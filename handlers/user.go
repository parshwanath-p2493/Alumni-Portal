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

type UserHandler struct{}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

func (h *UserHandler) GetProfile(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "User not found",
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  user.ToResponse(),
	})
}

func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req models.UpdateProfileRequest
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

	// Build update document
	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	if req.Name != "" {
		update["$set"].(bson.M)["name"] = utils.SanitizeString(req.Name)
	}
	if req.Company != "" {
		update["$set"].(bson.M)["company"] = utils.SanitizeString(req.Company)
	}
	if req.Position != "" {
		update["$set"].(bson.M)["position"] = utils.SanitizeString(req.Position)
	}
	if req.Location != "" {
		update["$set"].(bson.M)["location"] = utils.SanitizeString(req.Location)
	}
	if req.Experience != "" {
		update["$set"].(bson.M)["experience"] = utils.SanitizeString(req.Experience)
	}
	if req.Skills != nil {
		update["$set"].(bson.M)["skills"] = req.Skills
	}
	if req.GitHubURL != "" {
		update["$set"].(bson.M)["github_url"] = req.GitHubURL
	}
	if req.LinkedInURL != "" {
		update["$set"].(bson.M)["linkedin_url"] = req.LinkedInURL
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": userID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update profile",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Profile updated successfully",
		"data":    user.ToResponse(),
	})
}

func (h *UserHandler) GetUsers(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	role := c.Query("role")
	search := c.Query("search")
	graduationYear := c.Query("graduation_year")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Build filter
	filter := bson.M{
		"is_verified": true,
		//"is_active":   true,
	}

	if role != "" {
		filter["role"] = role
	}

	if graduationYear != "" {
		if year, err := strconv.Atoi(graduationYear); err == nil {
			filter["graduation_year"] = year
		}
	}

	if search != "" {
		filter["$or"] = []bson.M{
			{"name": bson.M{"$regex": search, "$options": "i"}},
			{"company": bson.M{"$regex": search, "$options": "i"}},
			{"skills": bson.M{"$in": []string{search}}},
		}
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get total count
	total, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to count users",
		})
	}

	// Get users with pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"name": 1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch users",
		})
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to decode users",
		})
	}

	// Convert to response format
	var userResponses []*models.UserResponse
	for _, user := range users {
		userResponses = append(userResponses, user.ToResponse())
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data": fiber.Map{
			"users": userResponses,
			"pagination": fiber.Map{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

func (h *UserHandler) GetUserByID(c *fiber.Ctx) error {
	userIDStr := c.Params("id")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid user ID",
		})
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err = collection.FindOne(ctx, bson.M{
		"_id":         userID,
		"is_verified": true,
		"is_active":   true,
	}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "User not found",
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  user.ToResponse(),
	})
}

func (h *UserHandler) GetDashboardStats(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	userRole := middleware.GetUserRole(c)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	stats := fiber.Map{}

	switch userRole {
	case models.RoleStudent:
		// Projects count
		projectsCollection := config.GetCollection("projects")
		projectsCount, _ := projectsCollection.CountDocuments(ctx, bson.M{
			"author_id": userID,
			"is_active": true,
		})
		stats["projects_count"] = projectsCount

		// Job interests count
		jobInterestsCollection := config.GetCollection("job_interests")
		jobInterestsCount, _ := jobInterestsCollection.CountDocuments(ctx, bson.M{
			"user_id": userID,
		})
		stats["job_interests_count"] = jobInterestsCount

	case models.RoleAlumni:
		// Jobs posted count
		jobsCollection := config.GetCollection("jobs")
		jobsCount, _ := jobsCollection.CountDocuments(ctx, bson.M{
			"posted_by": userID,
			"is_active": true,
		})
		stats["jobs_posted_count"] = jobsCount

		// Total applicants for jobs
		pipeline := []bson.M{
			{"$match": bson.M{"posted_by": userID, "is_active": true}},
			{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$applicants_count"}}},
		}
		cursor, err := jobsCollection.Aggregate(ctx, pipeline)
		if err == nil {
			var result []bson.M
			cursor.All(ctx, &result)
			if len(result) > 0 {
				stats["total_applicants"] = result[0]["total"]
			} else {
				stats["total_applicants"] = 0
			}
		}

	case models.RoleFaculty:
		// Gallery uploads count
		galleryCollection := config.GetCollection("gallery")
		galleryCount, _ := galleryCollection.CountDocuments(ctx, bson.M{
			"uploaded_by": userID,
			"is_active":   true,
		})
		stats["gallery_uploads_count"] = galleryCount

	case models.RoleAdmin:
		// Total users
		usersCollection := config.GetCollection("users")
		totalUsers, _ := usersCollection.CountDocuments(ctx, bson.M{
			"is_verified": true,
			"is_active":   true,
		})
		stats["total_users"] = totalUsers

		// Total projects
		projectsCollection := config.GetCollection("projects")
		totalProjects, _ := projectsCollection.CountDocuments(ctx, bson.M{
			"is_active": true,
		})
		stats["total_projects"] = totalProjects

		// Total jobs
		jobsCollection := config.GetCollection("jobs")
		totalJobs, _ := jobsCollection.CountDocuments(ctx, bson.M{
			"is_active": true,
		})
		stats["total_jobs"] = totalJobs

		// Total events
		eventsCollection := config.GetCollection("events")
		totalEvents, _ := eventsCollection.CountDocuments(ctx, bson.M{
			"is_active": true,
		})
		stats["total_events"] = totalEvents
	}

	// Common stats for all roles
	messagesCollection := config.GetCollection("messages")
	unreadMessages, _ := messagesCollection.CountDocuments(ctx, bson.M{
		"recipient_id": userID,
		"is_read":      false,
	})
	stats["unread_messages"] = unreadMessages

	notificationsCollection := config.GetCollection("notifications")
	unreadNotifications, _ := notificationsCollection.CountDocuments(ctx, bson.M{
		"user_id": userID,
		"is_read": false,
	})
	stats["unread_notifications"] = unreadNotifications

	return c.JSON(fiber.Map{
		"error": false,
		"data":  stats,
	})
}
