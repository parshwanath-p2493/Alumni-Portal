package handlers

import (
	"context"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"ete-alumni-portal/config"
	"ete-alumni-portal/middleware"
	"ete-alumni-portal/models"
	"ete-alumni-portal/utils"
)

type ProjectHandler struct{}

func NewProjectHandler() *ProjectHandler {
	return &ProjectHandler{}
}

func (h *ProjectHandler) GetProjects(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	projectType := c.Query("type")
	search := c.Query("search")
	authorID := c.Query("author_id")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Build filter
	filter := bson.M{"is_active": true}

	if projectType != "" {
		filter["project_type"] = projectType
	}

	if authorID != "" {
		if objID, err := primitive.ObjectIDFromHex(authorID); err == nil {
			filter["author_id"] = objID
		}
	}

	if search != "" {
		filter["$or"] = []bson.M{
			{"title": bson.M{"$regex": search, "$options": "i"}},
			{"description": bson.M{"$regex": search, "$options": "i"}},
			{"technologies": bson.M{"$in": []string{search}}},
		}
	}

	collection := config.GetCollection("projects")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get total count
	total, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to count projects",
		})
	}

	// Get projects with pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"created_at": -1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch projects",
		})
	}
	defer cursor.Close(ctx)

	var projects []models.Project
	if err = cursor.All(ctx, &projects); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to decode projects",
		})
	}

	// Populate author information
	userCollection := config.GetCollection("users")
	for i := range projects {
		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"_id": projects[i].AuthorID}).Decode(&user)
		if err == nil {
			projects[i].Author = user.ToResponse()
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data": fiber.Map{
			"projects": projects,
			"pagination": fiber.Map{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

func (h *ProjectHandler) CreateProject(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req models.CreateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	project := models.Project{
		ID:           primitive.NewObjectID(),
		Title:        utils.SanitizeString(req.Title),
		Description:  utils.SanitizeString(req.Description),
		ProjectType:  req.ProjectType,
		Technologies: req.Technologies,
		GitHubURL:    req.GitHubURL,
		DemoURL:      req.DemoURL,
		AuthorID:     userID,
		LikesCount:   0,
		ViewsCount:   0,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	collection := config.GetCollection("projects")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, project)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to create project",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error":   false,
		"message": "Project created successfully",
		"data":    project,
	})
}

func (h *ProjectHandler) GetProjectByID(c *fiber.Ctx) error {
	projectIDStr := c.Params("id")
	projectID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid project ID",
		})
	}

	collection := config.GetCollection("projects")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var project models.Project
	err = collection.FindOne(ctx, bson.M{
		"_id":       projectID,
		"is_active": true,
	}).Decode(&project)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Project not found",
		})
	}

	// Increment view count
	collection.UpdateOne(ctx, bson.M{"_id": projectID}, bson.M{
		"$inc": bson.M{"views_count": 1},
	})

	// Populate author information
	userCollection := config.GetCollection("users")
	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"_id": project.AuthorID}).Decode(&user)
	if err == nil {
		project.Author = user.ToResponse()
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  project,
	})
}

func (h *ProjectHandler) UpdateProject(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	projectIDStr := c.Params("id")
	projectID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid project ID",
		})
	}

	var req models.UpdateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	collection := config.GetCollection("projects")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if project exists and user owns it
	var existingProject models.Project
	err = collection.FindOne(ctx, bson.M{
		"_id":       projectID,
		"author_id": userID,
		"is_active": true,
	}).Decode(&existingProject)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Project not found or access denied",
		})
	}

	// Build update document
	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	if req.Title != "" {
		update["$set"].(bson.M)["title"] = utils.SanitizeString(req.Title)
	}
	if req.Description != "" {
		update["$set"].(bson.M)["description"] = utils.SanitizeString(req.Description)
	}
	if req.ProjectType != "" {
		update["$set"].(bson.M)["project_type"] = req.ProjectType
	}
	if req.Technologies != nil {
		update["$set"].(bson.M)["technologies"] = req.Technologies
	}
	if req.GitHubURL != "" {
		update["$set"].(bson.M)["github_url"] = req.GitHubURL
	}
	if req.DemoURL != "" {
		update["$set"].(bson.M)["demo_url"] = req.DemoURL
	}

	var project models.Project
	err = collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": projectID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&project)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update project",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Project updated successfully",
		"data":    project,
	})
}

func (h *ProjectHandler) DeleteProject(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	userRole := middleware.GetUserRole(c)
	projectIDStr := c.Params("id")
	projectID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid project ID",
		})
	}

	collection := config.GetCollection("projects")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"_id":       projectID,
		"is_active": true,
	}

	// Only allow author or admin to delete
	if userRole != models.RoleAdmin {
		filter["author_id"] = userID
	}

	_, err = collection.UpdateOne(ctx, filter, bson.M{
		"$set": bson.M{
			"is_active":  false,
			"updated_at": time.Now(),
		},
	})
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Project not found or access denied",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Project deleted successfully",
	})
}

func (h *ProjectHandler) LikeProject(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	projectIDStr := c.Params("id")
	projectID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid project ID",
		})
	}

	likesCollection := config.GetCollection("project_likes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if already liked
	var existingLike models.ProjectLike
	err = likesCollection.FindOne(ctx, bson.M{
		"project_id": projectID,
		"user_id":    userID,
	}).Decode(&existingLike)
	if err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error":   true,
			"message": "Project already liked",
		})
	}

	// Create like
	like := models.ProjectLike{
		ID:        primitive.NewObjectID(),
		ProjectID: projectID,
		UserID:    userID,
		CreatedAt: time.Now(),
	}

	_, err = likesCollection.InsertOne(ctx, like)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to like project",
		})
	}

	// Increment likes count
	projectsCollection := config.GetCollection("projects")
	_, err = projectsCollection.UpdateOne(ctx, bson.M{"_id": projectID}, bson.M{
		"$inc": bson.M{"likes_count": 1},
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update likes count",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Project liked successfully",
	})
}

func (h *ProjectHandler) UnlikeProject(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	projectIDStr := c.Params("id")
	projectID, err := primitive.ObjectIDFromHex(projectIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid project ID",
		})
	}

	likesCollection := config.GetCollection("project_likes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Remove like
	result, err := likesCollection.DeleteOne(ctx, bson.M{
		"project_id": projectID,
		"user_id":    userID,
	})
	if err != nil || result.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Like not found",
		})
	}

	// Decrement likes count
	projectsCollection := config.GetCollection("projects")
	_, err = projectsCollection.UpdateOne(ctx, bson.M{"_id": projectID}, bson.M{
		"$inc": bson.M{"likes_count": -1},
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update likes count",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Project unliked successfully",
	})
}
