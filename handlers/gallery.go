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

type GalleryHandler struct{}

func NewGalleryHandler() *GalleryHandler {
	return &GalleryHandler{}
}

func (h *GalleryHandler) GetGalleryItems(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	eventID := c.Query("event_id")
	tags := c.Query("tags")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Build filter
	filter := bson.M{"is_active": true}

	if eventID != "" {
		if objID, err := primitive.ObjectIDFromHex(eventID); err == nil {
			filter["event_id"] = objID
		}
	}

	if tags != "" {
		filter["tags"] = bson.M{"$in": []string{tags}}
	}

	collection := config.GetCollection("gallery")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get total count
	total, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to count gallery items",
		})
	}

	// Get gallery items with pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"created_at": -1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch gallery items",
		})
	}
	defer cursor.Close(ctx)

	var galleryItems []models.Gallery
	if err = cursor.All(ctx, &galleryItems); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to decode gallery items",
		})
	}

	// Populate uploader and event information
	usersCollection := config.GetCollection("users")
	eventsCollection := config.GetCollection("events")

	for i := range galleryItems {
		// Get uploader info
		var user models.User
		err := usersCollection.FindOne(ctx, bson.M{"_id": galleryItems[i].UploadedBy}).Decode(&user)
		if err == nil {
			galleryItems[i].Uploader = user.ToResponse()
		}

		// Get event info if exists
		if galleryItems[i].EventID != nil {
			var event models.Event
			err := eventsCollection.FindOne(ctx, bson.M{"_id": *galleryItems[i].EventID}).Decode(&event)
			if err == nil {
				galleryItems[i].Event = &event
			}
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data": fiber.Map{
			"gallery_items": galleryItems,
			"pagination": fiber.Map{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

func (h *GalleryHandler) CreateGalleryItem(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req models.CreateGalleryRequest
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

	galleryItem := models.Gallery{
		ID:          primitive.NewObjectID(),
		Title:       utils.SanitizeString(req.Title),
		Description: utils.SanitizeString(req.Description),
		ImageURL:    "/placeholder.svg?height=400&width=600", // Placeholder for now
		Tags:        req.Tags,
		UploadedBy:  userID,
		IsActive:    true,
		CreatedAt:   time.Now(),
	}

	if req.EventID != "" {
		if eventID, err := primitive.ObjectIDFromHex(req.EventID); err == nil {
			galleryItem.EventID = &eventID
		}
	}

	collection := config.GetCollection("gallery")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, galleryItem)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to create gallery item",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error":   false,
		"message": "Gallery item created successfully",
		"data":    galleryItem,
	})
}

func (h *GalleryHandler) GetGalleryItemByID(c *fiber.Ctx) error {
	galleryIDStr := c.Params("id")
	galleryID, err := primitive.ObjectIDFromHex(galleryIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid gallery item ID",
		})
	}

	collection := config.GetCollection("gallery")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var galleryItem models.Gallery
	err = collection.FindOne(ctx, bson.M{
		"_id":       galleryID,
		"is_active": true,
	}).Decode(&galleryItem)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Gallery item not found",
		})
	}

	// Populate uploader and event information
	usersCollection := config.GetCollection("users")
	var user models.User
	err = usersCollection.FindOne(ctx, bson.M{"_id": galleryItem.UploadedBy}).Decode(&user)
	if err == nil {
		galleryItem.Uploader = user.ToResponse()
	}

	if galleryItem.EventID != nil {
		eventsCollection := config.GetCollection("events")
		var event models.Event
		err := eventsCollection.FindOne(ctx, bson.M{"_id": *galleryItem.EventID}).Decode(&event)
		if err == nil {
			galleryItem.Event = &event
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  galleryItem,
	})
}

func (h *GalleryHandler) DeleteGalleryItem(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	userRole := middleware.GetUserRole(c)
	galleryIDStr := c.Params("id")
	galleryID, err := primitive.ObjectIDFromHex(galleryIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid gallery item ID",
		})
	}

	collection := config.GetCollection("gallery")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"_id":       galleryID,
		"is_active": true,
	}

	// Only allow uploader or admin to delete
	if userRole != models.RoleAdmin {
		filter["uploaded_by"] = userID
	}

	_, err = collection.UpdateOne(ctx, filter, bson.M{
		"$set": bson.M{"is_active": false},
	})
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Gallery item not found or access denied",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Gallery item deleted successfully",
	})
}
