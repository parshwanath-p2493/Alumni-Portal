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

type MessageHandler struct {
	emailService *utils.EmailService
}

func NewMessageHandler() *MessageHandler {
	return &MessageHandler{
		emailService: utils.NewEmailService(),
	}
}

func (h *MessageHandler) GetConversations(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	collection := config.GetCollection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Aggregate to get conversations
	pipeline := []bson.M{
		{
			"$match": bson.M{
				"$or": []bson.M{
					{"sender_id": userID},
					{"recipient_id": userID},
				},
			},
		},
		{
			"$addFields": bson.M{
				"participant_id": bson.M{
					"$cond": bson.M{
						"if":   bson.M{"$eq": []interface{}{"$sender_id", userID}},
						"then": "$recipient_id",
						"else": "$sender_id",
					},
				},
			},
		},
		{
			"$sort": bson.M{"created_at": -1},
		},
		{
			"$group": bson.M{
				"_id":          "$participant_id",
				"last_message": bson.M{"$first": "$$ROOT"},
				"unread_count": bson.M{
					"$sum": bson.M{
						"$cond": bson.M{
							"if": bson.M{
								"$and": []bson.M{
									{"$eq": []interface{}{"$recipient_id", userID}},
									{"$eq": []interface{}{"$is_read", false}},
								},
							},
							"then": 1,
							"else": 0,
						},
					},
				},
			},
		},
		{
			"$sort": bson.M{"last_message.created_at": -1},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch conversations",
		})
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to decode conversations",
		})
	}

	// Build conversations response
	var conversations []models.Conversation
	usersCollection := config.GetCollection("users")

	for _, result := range results {
		participantID := result["_id"].(primitive.ObjectID)
		lastMessageData := result["last_message"].(bson.M)
		unreadCount := int(result["unread_count"].(int32))

		// Get participant info
		var participant models.User
		err := usersCollection.FindOne(ctx, bson.M{"_id": participantID}).Decode(&participant)
		if err != nil {
			continue
		}

		// Convert last message
		lastMessage := &models.Message{
			ID:          lastMessageData["_id"].(primitive.ObjectID),
			SenderID:    lastMessageData["sender_id"].(primitive.ObjectID),
			RecipientID: lastMessageData["recipient_id"].(primitive.ObjectID),
			Content:     lastMessageData["content"].(string),
			IsRead:      lastMessageData["is_read"].(bool),
			CreatedAt:   lastMessageData["created_at"].(primitive.DateTime).Time(),
		}

		if subject, ok := lastMessageData["subject"].(string); ok {
			lastMessage.Subject = subject
		}

		conversation := models.Conversation{
			ParticipantID:   participantID,
			Participant:     participant.ToResponse(),
			LastMessage:     lastMessage,
			UnreadCount:     unreadCount,
			LastMessageTime: lastMessage.CreatedAt,
		}

		conversations = append(conversations, conversation)
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  conversations,
	})
}

func (h *MessageHandler) SendMessage(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req models.SendMessageRequest
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

	recipientID, err := primitive.ObjectIDFromHex(req.RecipientID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid recipient ID",
		})
	}

	// Check if recipient exists
	usersCollection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var recipient models.User
	err = usersCollection.FindOne(ctx, bson.M{
		"_id":         recipientID,
		"is_verified": true,
		"is_active":   true,
	}).Decode(&recipient)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Recipient not found",
		})
	}

	// Get sender info for notification
	var sender models.User
	err = usersCollection.FindOne(ctx, bson.M{"_id": userID}).Decode(&sender)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to get sender information",
		})
	}

	message := models.Message{
		ID:          primitive.NewObjectID(),
		SenderID:    userID,
		RecipientID: recipientID,
		Subject:     utils.SanitizeString(req.Subject),
		Content:     utils.SanitizeString(req.Content),
		IsRead:      false,
		CreatedAt:   time.Now(),
	}

	collection := config.GetCollection("messages")
	_, err = collection.InsertOne(ctx, message)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to send message",
		})
	}

	// Send email notification
	go h.sendEmailNotification(sender, recipient, message)

	// Create notification
	notification := models.Notification{
		ID:               primitive.NewObjectID(),
		UserID:           recipientID,
		Title:            "New Message",
		Message:          "You have received a new message from " + sender.Name,
		NotificationType: models.NotificationMessageReceived,
		IsRead:           false,
		CreatedAt:        time.Now(),
		RelatedID:        &message.ID,
		RelatedType:      "message",
	}

	notificationsCollection := config.GetCollection("notifications")
	_, _ = notificationsCollection.InsertOne(ctx, notification)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error":   false,
		"message": "Message sent successfully",
		"data":    message,
	})
}

func (h *MessageHandler) sendEmailNotification(sender models.User, recipient models.User, message models.Message) {
	// Check if recipient has email notifications enabled
	userPrefsCollection := config.GetCollection("user_preferences")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var prefs models.UserPreferences
	err := userPrefsCollection.FindOne(ctx, bson.M{"user_id": recipient.ID}).Decode(&prefs)

	// If no preferences found or message notifications are enabled
	if err != nil || prefs.EmailNotifications.Messages {
		// Prepare email variables
		variables := map[string]string{
			"user_name":       recipient.Name,
			"sender_name":     sender.Name,
			"message_subject": message.Subject,
			"message_preview": utils.TruncateString(message.Content, 100),
			"portal_url":      config.GetConfig().FrontendURL + "/messages?user=" + sender.ID.Hex(),
		}
		sub := models.EmailTypeMessageReceived
		_ = variables
		// Send email notification
		h.emailService.SendMessageNotification(recipient.Email, sender.Name, string(sub))
	}
}

func (h *MessageHandler) GetMessages(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	participantIDStr := c.Params("id")
	participantID, err := primitive.ObjectIDFromHex(participantIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid participant ID",
		})
	}

	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}

	collection := config.GetCollection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Build filter for conversation between two users
	filter := bson.M{
		"$or": []bson.M{
			{"sender_id": userID, "recipient_id": participantID},
			{"sender_id": participantID, "recipient_id": userID},
		},
	}

	// Get total count
	total, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to count messages",
		})
	}

	// Get messages with pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"created_at": -1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch messages",
		})
	}
	defer cursor.Close(ctx)

	var messages []models.Message
	if err = cursor.All(ctx, &messages); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to decode messages",
		})
	}

	// Populate sender and recipient information
	usersCollection := config.GetCollection("users")
	for i := range messages {
		var sender, recipient models.User
		usersCollection.FindOne(ctx, bson.M{"_id": messages[i].SenderID}).Decode(&sender)
		usersCollection.FindOne(ctx, bson.M{"_id": messages[i].RecipientID}).Decode(&recipient)

		messages[i].Sender = sender.ToResponse()
		messages[i].Recipient = recipient.ToResponse()
	}

	// Mark messages as read if they are sent to current user
	_, err = collection.UpdateMany(ctx, bson.M{
		"sender_id":    participantID,
		"recipient_id": userID,
		"is_read":      false,
	}, bson.M{
		"$set": bson.M{"is_read": true},
	})
	if err != nil {
		// Log error but don't fail the request
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data": fiber.Map{
			"messages": messages,
			"pagination": fiber.Map{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

func (h *MessageHandler) MarkAsRead(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	messageIDStr := c.Params("id")
	messageID, err := primitive.ObjectIDFromHex(messageIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid message ID",
		})
	}

	collection := config.GetCollection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.UpdateOne(ctx, bson.M{
		"_id":          messageID,
		"recipient_id": userID,
	}, bson.M{
		"$set": bson.M{"is_read": true},
	})
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Message not found or access denied",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Message marked as read",
	})
}
