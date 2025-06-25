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
	"ete-alumni-portal/utils"
)

type EmailSettingsHandler struct{}

func NewEmailSettingsHandler() *EmailSettingsHandler {
	return &EmailSettingsHandler{}
}

func (h *EmailSettingsHandler) GetEmailSettings(c *fiber.Ctx) error {
	collection := config.GetCollection("email_settings")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var settings models.EmailSettings
	err := collection.FindOne(ctx, bson.M{}).Decode(&settings)
	if err != nil {
		// Return default settings if none exist
		defaultSettings := models.EmailSettings{
			SMTPHost:            "smtp.gmail.com",
			SMTPPort:            587,
			FromName:            "ETE Alumni Portal",
			IsEnabled:           true,
			DailyLimit:          1000,
			HourlyLimit:         100,
			RetryAttempts:       3,
			RetryDelay:          300,
			EnableBulkEmails:    true,
			EnableDigestEmails:  true,
			DigestFrequency:     "weekly",
			EnableNotifications: make(map[models.EmailNotificationType]bool),
		}

		// Enable all notification types by default
		notificationTypes := []models.EmailNotificationType{
			models.EmailTypeJobPosted,
			models.EmailTypeEventCreated,
			models.EmailTypeMessageReceived,
			models.EmailTypeProjectLiked,
			models.EmailTypeJobInterest,
			models.EmailTypeEventRSVP,
			models.EmailTypeWelcome,
			models.EmailTypePasswordReset,
			models.EmailTypeAccountVerified,
			models.EmailTypeWeeklyDigest,
			models.EmailTypeMonthlyNewsletter,
		}

		for _, notType := range notificationTypes {
			defaultSettings.EnableNotifications[notType] = true
		}

		return c.JSON(fiber.Map{
			"error": false,
			"data":  defaultSettings,
		})
	}

	// Hide password in response
	settings.SMTPPassword = ""

	return c.JSON(fiber.Map{
		"error": false,
		"data":  settings,
	})
}

func (h *EmailSettingsHandler) UpdateEmailSettings(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(primitive.ObjectID)

	var req models.UpdateEmailSettingsRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	collection := config.GetCollection("email_settings")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Build update document
	update := bson.M{
		"$set": bson.M{
			"updated_by": userID,
			"updated_at": time.Now(),
		},
	}

	if req.SMTPHost != "" {
		update["$set"].(bson.M)["smtp_host"] = req.SMTPHost
	}
	if req.SMTPPort > 0 {
		update["$set"].(bson.M)["smtp_port"] = req.SMTPPort
	}
	if req.SMTPUsername != "" {
		update["$set"].(bson.M)["smtp_username"] = req.SMTPUsername
	}
	if req.SMTPPassword != "" {
		update["$set"].(bson.M)["smtp_password"] = req.SMTPPassword
	}
	if req.FromEmail != "" {
		update["$set"].(bson.M)["from_email"] = req.FromEmail
	}
	if req.FromName != "" {
		update["$set"].(bson.M)["from_name"] = req.FromName
	}
	if req.ReplyToEmail != "" {
		update["$set"].(bson.M)["reply_to_email"] = req.ReplyToEmail
	}
	if req.IsEnabled != nil {
		update["$set"].(bson.M)["is_enabled"] = *req.IsEnabled
	}
	if req.DailyLimit > 0 {
		update["$set"].(bson.M)["daily_limit"] = req.DailyLimit
	}
	if req.HourlyLimit > 0 {
		update["$set"].(bson.M)["hourly_limit"] = req.HourlyLimit
	}
	if req.RetryAttempts > 0 {
		update["$set"].(bson.M)["retry_attempts"] = req.RetryAttempts
	}
	if req.RetryDelay > 0 {
		update["$set"].(bson.M)["retry_delay"] = req.RetryDelay
	}
	if req.EnableBulkEmails != nil {
		update["$set"].(bson.M)["enable_bulk_emails"] = *req.EnableBulkEmails
	}
	if req.EnableDigestEmails != nil {
		update["$set"].(bson.M)["enable_digest_emails"] = *req.EnableDigestEmails
	}
	if req.DigestFrequency != "" {
		update["$set"].(bson.M)["digest_frequency"] = req.DigestFrequency
	}
	if req.EnableNotifications != nil {
		update["$set"].(bson.M)["enable_notifications"] = req.EnableNotifications
	}

	opts := options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After)
	var settings models.EmailSettings
	err := collection.FindOneAndUpdate(ctx, bson.M{}, update, opts).Decode(&settings)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update email settings",
		})
	}

	// Hide password in response
	settings.SMTPPassword = ""

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Email settings updated successfully",
		"data":    settings,
	})
}

func (h *EmailSettingsHandler) TestEmailConnection(c *fiber.Ctx) error {
	collection := config.GetCollection("email_settings")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var settings models.EmailSettings
	err := collection.FindOne(ctx, bson.M{}).Decode(&settings)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Email settings not found",
		})
	}

	// Test email connection
	emailService := utils.NewEmailService()
	testEmail := c.Query("email", "test@example.com")
	
	err = emailService.SendTestEmail(testEmail, "Test Email", "This is a test email from ETE Alumni Portal admin panel.")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Email test failed: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Test email sent successfully",
	})
}

func (h *EmailSettingsHandler) GetEmailTemplates(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	templateType := c.Query("type")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	filter := bson.M{}
	if templateType != "" {
		filter["type"] = templateType
	}

	collection := config.GetCollection("email_templates")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get total count
	total, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to count templates",
		})
	}

	// Get templates with pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"created_at": -1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch templates",
		})
	}
	defer cursor.Close(ctx)

	var templates []models.EmailTemplate
	if err = cursor.All(ctx, &templates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to decode templates",
		})
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data": fiber.Map{
			"templates": templates,
			"pagination": fiber.Map{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

func (h *EmailSettingsHandler) CreateEmailTemplate(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(primitive.ObjectID)

	var req models.CreateEmailTemplateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	template := models.EmailTemplate{
		ID:        primitive.NewObjectID(),
		Type:      req.Type,
		Name:      req.Name,
		Subject:   req.Subject,
		Body:      req.Body,
		Variables: req.Variables,
		IsActive:  req.IsActive,
		IsDefault: false,
		CreatedBy: userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	collection := config.GetCollection("email_templates")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, template)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to create template",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error":   false,
		"message": "Email template created successfully",
		"data":    template,
	})
}

func (h *EmailSettingsHandler) GetEmailStats(c *fiber.Ctx) error {
	collection := config.GetCollection("email_logs")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	thisWeek := today.AddDate(0, 0, -int(today.Weekday()))
	thisMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	stats := models.EmailStatsResponse{
		ByType: make(map[models.EmailNotificationType]int64),
	}

	// Get total counts
	stats.TotalSent, _ = collection.CountDocuments(ctx, bson.M{"status": "sent"})
	stats.TotalFailed, _ = collection.CountDocuments(ctx, bson.M{"status": "failed"})
	stats.TotalPending, _ = collection.CountDocuments(ctx, bson.M{"status": "pending"})

	// Get time-based counts
	stats.SentToday, _ = collection.CountDocuments(ctx, bson.M{
		"status": "sent",
		"sent_at": bson.M{"$gte": today},
	})

	stats.SentThisWeek, _ = collection.CountDocuments(ctx, bson.M{
		"status": "sent",
		"sent_at": bson.M{"$gte": thisWeek},
	})

	stats.SentThisMonth, _ = collection.CountDocuments(ctx, bson.M{
		"status": "sent",
		"sent_at": bson.M{"$gte": thisMonth},
	})

	// Get counts by type
	pipeline := []bson.M{
		{"$match": bson.M{"status": "sent"}},
		{"$group": bson.M{
			"_id":   "$type",
			"count": bson.M{"$sum": 1},
		}},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err == nil {
		defer cursor.Close(ctx)
		for cursor.Next(ctx) {
			var result struct {
				ID    models.EmailNotificationType `bson:"_id"`
				Count int64                        `bson:"count"`
			}
			if err := cursor.Decode(&result); err == nil {
				stats.ByType[result.ID] = result.Count
			}
		}
	}

	// Get recent activity
	opts := options.Find().SetSort(bson.M{"created_at": -1}).SetLimit(10)
	cursor, err = collection.Find(ctx, bson.M{}, opts)
	if err == nil {
		defer cursor.Close(ctx)
		cursor.All(ctx, &stats.RecentActivity)
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  stats,
	})
}
