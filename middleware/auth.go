package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"ete-alumni-portal/models"
	"ete-alumni-portal/utils"
)

func AuthRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   true,
				"message": "Authorization header required",
			})
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   true,
				"message": "Invalid or expired token",
			})
		}

		// Store user info in context
		c.Locals("userID", claims.UserID)
		c.Locals("userEmail", claims.Email)
		c.Locals("userRole", claims.Role)

		return c.Next()
	}
}

func RoleRequired(roles ...models.UserRole) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole := c.Locals("userRole").(models.UserRole)

		for _, role := range roles {
			if userRole == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   true,
			"message": "Insufficient permissions",
		})
	}
}

// GetUserID safely extracts user ID from context and converts to ObjectID
func GetUserID(c *fiber.Ctx) primitive.ObjectID {
	userIDInterface := c.Locals("userID")

	// Handle different types that userID might be stored as
	switch v := userIDInterface.(type) {
	case primitive.ObjectID:
		return v
	case string:
		objectID, err := primitive.ObjectIDFromHex(v)
		if err != nil {
			// Return empty ObjectID if conversion fails
			return primitive.NilObjectID
		}
		return objectID
	default:
		return primitive.NilObjectID
	}
}

// GetUserIDAsString safely extracts user ID from context as string
func GetUserIDAsString(c *fiber.Ctx) string {
	userIDInterface := c.Locals("userID")

	switch v := userIDInterface.(type) {
	case primitive.ObjectID:
		return v.Hex()
	case string:
		return v
	default:
		return ""
	}
}

func GetUserRole(c *fiber.Ctx) models.UserRole {
	return c.Locals("userRole").(models.UserRole)
}
