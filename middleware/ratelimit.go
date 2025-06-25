package middleware

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"

	"ete-alumni-portal/config"
	"ete-alumni-portal/models"
)

func RateLimit(actionType string, maxAttempts int) fiber.Handler {
	return func(c *fiber.Ctx) error {
		cfg := config.GetConfig()
		collection := config.GetCollection("rate_limits")

		identifier := c.IP()
		if userID := c.Locals("userID"); userID != nil {
			identifier = userID.(string)
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		now := time.Now()
		windowStart := now.Add(-cfg.RateLimitWindow)

		// Find existing rate limit record
		var rateLimit models.RateLimit
		filter := bson.M{
			"identifier":   identifier,
			"action_type":  actionType,
			"window_start": bson.M{"$gte": windowStart},
		}

		err := collection.FindOne(ctx, filter).Decode(&rateLimit)
		if err != nil {
			// Create new rate limit record
			rateLimit = models.RateLimit{
				Identifier:  identifier,
				ActionType:  actionType,
				Attempts:    1,
				WindowStart: now,
				CreatedAt:   now,
			}

			_, err = collection.InsertOne(ctx, rateLimit)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   true,
					"message": "Rate limit check failed",
				})
			}

			return c.Next()
		}

		// Check if rate limit exceeded
		if rateLimit.Attempts >= maxAttempts {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error":   true,
				"message": "Rate limit exceeded. Please try again later.",
			})
		}

		// Increment attempts
		update := bson.M{
			"$inc": bson.M{"attempts": 1},
		}

		_, err = collection.UpdateOne(ctx, filter, update)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Rate limit update failed",
			})
		}

		return c.Next()
	}
}

func CleanupRateLimits() {
	cfg := config.GetConfig()
	collection := config.GetCollection("rate_limits")

	ticker := time.NewTicker(time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)

		cutoff := time.Now().Add(-cfg.RateLimitWindow)
		filter := bson.M{
			"window_start": bson.M{"$lt": cutoff},
		}

		_, err := collection.DeleteMany(ctx, filter)
		cancel()
		if err != nil {
			// Log error but don't stop the cleanup process
			continue
		}

		cancel()
	}
}
