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

type EventHandler struct{}

func NewEventHandler() *EventHandler {
	return &EventHandler{}
}

func (h *EventHandler) GetEvents(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	eventType := c.Query("type")
	upcoming := c.Query("upcoming") == "true"

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Build filter
	filter := bson.M{"is_active": true}

	if eventType != "" {
		filter["event_type"] = eventType
	}

	if upcoming {
		filter["event_date"] = bson.M{"$gte": time.Now()}
	}

	collection := config.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get total count
	total, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to count events",
		})
	}

	// Get events with pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"event_date": 1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch events",
		})
	}
	defer cursor.Close(ctx)

	var events []models.Event
	if err = cursor.All(ctx, &events); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to decode events",
		})
	}

	// Populate created by user information
	userCollection := config.GetCollection("users")
	for i := range events {
		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"_id": events[i].CreatedBy}).Decode(&user)
		if err == nil {
			events[i].CreatedByUser = user.ToResponse()
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data": fiber.Map{
			"events": events,
			"pagination": fiber.Map{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

func (h *EventHandler) CreateEvent(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req models.CreateEventRequest
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

	event := models.Event{
		ID:               primitive.NewObjectID(),
		Title:            utils.SanitizeString(req.Title),
		Description:      utils.SanitizeString(req.Description),
		EventDate:        req.EventDate,
		Location:         utils.SanitizeString(req.Location),
		EventType:        utils.SanitizeString(req.EventType),
		MaxAttendees:     req.MaxAttendees,
		CurrentAttendees: 0,
		CreatedBy:        userID,
		IsActive:         true,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	collection := config.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, event)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to create event",
		})
	}

	// Notify all users about new event
	go h.notifyUsersAboutNewEvent(event)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error":   false,
		"message": "Event created successfully",
		"data":    event,
	})
}

func (h *EventHandler) notifyUsersAboutNewEvent(event models.Event) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get all active users
	usersCollection := config.GetCollection("users")
	cursor, err := usersCollection.Find(ctx, bson.M{
		"is_verified": true,
		"is_active":   true,
	})
	if err != nil {
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	cursor.All(ctx, &users)

	// Create notifications
	notificationsCollection := config.GetCollection("notifications")
	for _, user := range users {
		notification := models.Notification{
			ID:               primitive.NewObjectID(),
			UserID:           user.ID,
			Title:            "New Event Created",
			Message:          "A new event '" + event.Title + "' has been scheduled",
			NotificationType: models.NotificationEventCreated,
			RelatedID:        &event.ID,
			IsRead:           false,
			CreatedAt:        time.Now(),
		}

		notificationsCollection.InsertOne(ctx, notification)
	}
}

func (h *EventHandler) GetEventByID(c *fiber.Ctx) error {
	eventIDStr := c.Params("id")
	eventID, err := primitive.ObjectIDFromHex(eventIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid event ID",
		})
	}

	collection := config.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var event models.Event
	err = collection.FindOne(ctx, bson.M{
		"_id":       eventID,
		"is_active": true,
	}).Decode(&event)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Event not found",
		})
	}

	// Populate created by user information
	userCollection := config.GetCollection("users")
	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"_id": event.CreatedBy}).Decode(&user)
	if err == nil {
		event.CreatedByUser = user.ToResponse()
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  event,
	})
}

func (h *EventHandler) UpdateEvent(c *fiber.Ctx) error {
	eventIDStr := c.Params("id")
	eventID, err := primitive.ObjectIDFromHex(eventIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid event ID",
		})
	}

	var req models.UpdateEventRequest
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

	collection := config.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

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
	if !req.EventDate.IsZero() {
		update["$set"].(bson.M)["event_date"] = req.EventDate
	}
	if req.Location != "" {
		update["$set"].(bson.M)["location"] = utils.SanitizeString(req.Location)
	}
	if req.EventType != "" {
		update["$set"].(bson.M)["event_type"] = utils.SanitizeString(req.EventType)
	}
	if req.MaxAttendees > 0 {
		update["$set"].(bson.M)["max_attendees"] = req.MaxAttendees
	}

	var event models.Event
	err = collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": eventID, "is_active": true},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&event)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Event not found",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Event updated successfully",
		"data":    event,
	})
}

func (h *EventHandler) DeleteEvent(c *fiber.Ctx) error {
	eventIDStr := c.Params("id")
	eventID, err := primitive.ObjectIDFromHex(eventIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid event ID",
		})
	}

	collection := config.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.UpdateOne(ctx, bson.M{
		"_id":       eventID,
		"is_active": true,
	}, bson.M{
		"$set": bson.M{
			"is_active":  false,
			"updated_at": time.Now(),
		},
	})
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Event not found",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Event deleted successfully",
	})
}

func (h *EventHandler) RSVPEvent(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	eventIDStr := c.Params("id")
	eventID, err := primitive.ObjectIDFromHex(eventIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid event ID",
		})
	}

	var req models.RSVPRequest
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

	rsvpCollection := config.GetCollection("event_rsvps")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if RSVP already exists
	var existingRSVP models.EventRSVP
	err = rsvpCollection.FindOne(ctx, bson.M{
		"event_id": eventID,
		"user_id":  userID,
	}).Decode(&existingRSVP)

	if err == nil {
		// Update existing RSVP
		_, err = rsvpCollection.UpdateOne(ctx, bson.M{
			"event_id": eventID,
			"user_id":  userID,
		}, bson.M{
			"$set": bson.M{"status": req.Status},
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to update RSVP",
			})
		}
	} else {
		// Create new RSVP
		rsvp := models.EventRSVP{
			ID:        primitive.NewObjectID(),
			EventID:   eventID,
			UserID:    userID,
			Status:    req.Status,
			CreatedAt: time.Now(),
		}

		_, err = rsvpCollection.InsertOne(ctx, rsvp)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to create RSVP",
			})
		}
	}

	// Update event attendees count
	h.updateEventAttendeesCount(eventID)

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "RSVP updated successfully",
	})
}

func (h *EventHandler) updateEventAttendeesCount(eventID primitive.ObjectID) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rsvpCollection := config.GetCollection("event_rsvps")
	count, err := rsvpCollection.CountDocuments(ctx, bson.M{
		"event_id": eventID,
		"status":   models.RSVPAttending,
	})
	if err != nil {
		return
	}

	eventsCollection := config.GetCollection("events")
	eventsCollection.UpdateOne(ctx, bson.M{"_id": eventID}, bson.M{
		"$set": bson.M{"current_attendees": count},
	})
}

func (h *EventHandler) GetEventAttendees(c *fiber.Ctx) error {
	eventIDStr := c.Params("id")
	eventID, err := primitive.ObjectIDFromHex(eventIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid event ID",
		})
	}

	rsvpCollection := config.GetCollection("event_rsvps")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := rsvpCollection.Find(ctx, bson.M{"event_id": eventID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch attendees",
		})
	}
	defer cursor.Close(ctx)

	var rsvps []models.EventRSVP
	if err = cursor.All(ctx, &rsvps); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to decode RSVPs",
		})
	}

	// Populate user information
	usersCollection := config.GetCollection("users")
	for i := range rsvps {
		var user models.User
		err := usersCollection.FindOne(ctx, bson.M{"_id": rsvps[i].UserID}).Decode(&user)
		if err == nil {
			rsvps[i].User = user.ToResponse()
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  rsvps,
	})
}
