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
	"ete-alumni-portal/models"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

func (h *AdminHandler) GetAllUsers(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	role := c.Query("role")
	status := c.Query("status")
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Build filter
	filter := bson.M{}

	if role != "" {
		filter["role"] = role
	}
	switch status {
	case "active":
		filter["is_active"] = true
	case "inactive":
		filter["is_active"] = false
	}

	if search != "" {
		filter["$or"] = []bson.M{
			{"name": bson.M{"$regex": search, "$options": "i"}},
			{"email": bson.M{"$regex": search, "$options": "i"}},
			{"student_id": bson.M{"$regex": search, "$options": "i"}},
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
		SetSort(bson.M{"created_at": -1})

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

func (h *AdminHandler) UpdateUserStatus(c *fiber.Ctx) error {
	userIDStr := c.Params("id")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid user ID",
		})
	}

	type StatusRequest struct {
		IsActive   *bool `json:"is_active,omitempty"`
		IsVerified *bool `json:"is_verified,omitempty"`
	}

	var req StatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Build update document
	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	if req.IsActive != nil {
		update["$set"].(bson.M)["is_active"] = *req.IsActive
	}
	if req.IsVerified != nil {
		update["$set"].(bson.M)["is_verified"] = *req.IsVerified
	}

	var user models.User
	err = collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": userID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "User not found",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "User status updated successfully",
		"data":    user.ToResponse(),
	})
}

func (h *AdminHandler) DeleteUser(c *fiber.Ctx) error {
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

	// Soft delete by setting is_active to false
	_, err = collection.UpdateOne(ctx, bson.M{"_id": userID}, bson.M{
		"$set": bson.M{
			"is_active":  false,
			"updated_at": time.Now(),
		},
	})
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "User not found",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "User deleted successfully",
	})
}

func (h *AdminHandler) GetAnalytics(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	analytics := fiber.Map{}

	// User statistics
	usersCollection := config.GetCollection("users")

	totalUsers, _ := usersCollection.CountDocuments(ctx, bson.M{"is_active": true})
	analytics["total_users"] = totalUsers

	studentsCount, _ := usersCollection.CountDocuments(ctx, bson.M{
		"role": models.RoleStudent, "is_active": true,
	})
	analytics["students_count"] = studentsCount

	alumniCount, _ := usersCollection.CountDocuments(ctx, bson.M{
		"role": models.RoleAlumni, "is_active": true,
	})
	analytics["alumni_count"] = alumniCount

	facultyCount, _ := usersCollection.CountDocuments(ctx, bson.M{
		"role": models.RoleFaculty, "is_active": true,
	})
	analytics["faculty_count"] = facultyCount

	// Project statistics
	projectsCollection := config.GetCollection("projects")
	totalProjects, _ := projectsCollection.CountDocuments(ctx, bson.M{"is_active": true})
	analytics["total_projects"] = totalProjects

	majorProjects, _ := projectsCollection.CountDocuments(ctx, bson.M{
		"project_type": models.ProjectTypeMajor, "is_active": true,
	})
	analytics["major_projects"] = majorProjects

	miniProjects, _ := projectsCollection.CountDocuments(ctx, bson.M{
		"project_type": models.ProjectTypeMini, "is_active": true,
	})
	analytics["mini_projects"] = miniProjects

	// Job statistics
	jobsCollection := config.GetCollection("jobs")
	totalJobs, _ := jobsCollection.CountDocuments(ctx, bson.M{"is_active": true})
	analytics["total_jobs"] = totalJobs

	activeJobs, _ := jobsCollection.CountDocuments(ctx, bson.M{
		"is_active": true,
		"$or": []bson.M{
			{"expires_at": bson.M{"$gt": time.Now()}},
			{"expires_at": nil},
		},
	})
	analytics["active_jobs"] = activeJobs

	// Event statistics
	eventsCollection := config.GetCollection("events")
	totalEvents, _ := eventsCollection.CountDocuments(ctx, bson.M{"is_active": true})
	analytics["total_events"] = totalEvents

	upcomingEvents, _ := eventsCollection.CountDocuments(ctx, bson.M{
		"is_active": true, "event_date": bson.M{"$gte": time.Now()},
	})
	analytics["upcoming_events"] = upcomingEvents

	// Message statistics
	messagesCollection := config.GetCollection("messages")
	totalMessages, _ := messagesCollection.CountDocuments(ctx, bson.M{})
	analytics["total_messages"] = totalMessages

	// Gallery statistics
	galleryCollection := config.GetCollection("gallery")
	totalGalleryItems, _ := galleryCollection.CountDocuments(ctx, bson.M{"is_active": true})
	analytics["total_gallery_items"] = totalGalleryItems

	// Recent activity (last 30 days)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	recentUsers, _ := usersCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{"$gte": thirtyDaysAgo},
		"is_active":  true,
	})
	analytics["recent_users"] = recentUsers

	recentProjects, _ := projectsCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{"$gte": thirtyDaysAgo},
		"is_active":  true,
	})
	analytics["recent_projects"] = recentProjects

	recentJobs, _ := jobsCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{"$gte": thirtyDaysAgo},
		"is_active":  true,
	})
	analytics["recent_jobs"] = recentJobs

	return c.JSON(fiber.Map{
		"error": false,
		"data":  analytics,
	})
}
