// package routes

// import (
// 	"strings"

// 	"github.com/gofiber/fiber/v2"
// 	"github.com/gofiber/websocket/v2"

// 	"ete-alumni-portal/config"
// 	"ete-alumni-portal/handlers"
// 	"ete-alumni-portal/middleware"
// 	"ete-alumni-portal/models"
// )

// func SetupRoutes(app fiber.Router) {
// 	cfg := config.GetConfig()

// 	// Initialize handlers
// 	authHandler := handlers.NewAuthHandler()
// 	userHandler := handlers.NewUserHandler()

// 	// Auth routes with rate limiting
// 	auth := app.Group("/auth")
// 	auth.Post("/register", middleware.RateLimit("register", cfg.RateLimitRegister), authHandler.Register)
// 	auth.Post("/verify-otp", authHandler.VerifyOTP)
// 	auth.Post("/login", middleware.RateLimit("login", cfg.RateLimitLogin), authHandler.Login)
// 	auth.Post("/forgot-password", authHandler.ForgotPassword)
// 	auth.Post("/reset-password", authHandler.ResetPassword)
// 	auth.Post("/refresh", middleware.RateLimit("refresh", cfg.RateLimitRefresh), authHandler.RefreshToken)
// 	auth.Post("/logout", authHandler.Logout)

// 	// Protected routes
// 	api := app.Group("", middleware.AuthRequired())

// 	// User routes
// 	users := api.Group("/users")
// 	users.Get("/profile", userHandler.GetProfile)
// 	users.Put("/profile", userHandler.UpdateProfile)
// 	users.Get("/", userHandler.GetUsers)
// 	users.Get("/dashboard-stats", userHandler.GetDashboardStats)
// 	users.Get("/:id", userHandler.GetUserByID)

// 	// Project routes
// 	projects := api.Group("/projects")
// 	projectHandler := handlers.NewProjectHandler()
// 	projects.Get("/projectview", projectHandler.GetProjects)
// 	projects.Post("/addproject", middleware.RoleRequired(models.RoleStudent), projectHandler.CreateProject)
// 	projects.Get("/:id", projectHandler.GetProjectByID)
// 	projects.Put("/:id", middleware.RoleRequired(models.RoleStudent), projectHandler.UpdateProject)
// 	projects.Delete("/:id", middleware.RoleRequired(models.RoleStudent, models.RoleAdmin), projectHandler.DeleteProject)
// 	projects.Post("/:id/like", projectHandler.LikeProject)
// 	projects.Delete("/:id/like", projectHandler.UnlikeProject)

// 	// Job routes
// 	jobs := api.Group("/jobs")
// 	jobHandler := handlers.NewJobHandler()
// 	jobs.Get("/", jobHandler.GetJobs)
// 	jobs.Post("/add", middleware.RoleRequired(models.RoleAlumni), jobHandler.CreateJob)
// 	jobs.Get("/:id", jobHandler.GetJobByID)
// 	jobs.Put("/:id", middleware.RoleRequired(models.RoleAlumni), jobHandler.UpdateJob)
// 	jobs.Delete("/:id", middleware.RoleRequired(models.RoleAlumni, models.RoleAdmin), jobHandler.DeleteJob)
// 	jobs.Post("/:id/interest", middleware.RoleRequired(models.RoleStudent), jobHandler.ShowInterest)
// 	jobs.Delete("/:id/interest", middleware.RoleRequired(models.RoleStudent), jobHandler.RemoveInterest)
// 	jobs.Get("/:id/interested-users", middleware.RoleRequired(models.RoleAlumni, models.RoleAdmin), jobHandler.GetInterestedUsers)

// 	// Event routes
// 	events := api.Group("/events")
// 	eventHandler := handlers.NewEventHandler()
// 	events.Get("/", eventHandler.GetEvents)
// 	events.Post("/", middleware.RoleRequired(models.RoleAdmin), eventHandler.CreateEvent)
// 	events.Get("/:id", eventHandler.GetEventByID)
// 	events.Put("/:id", middleware.RoleRequired(models.RoleAdmin), eventHandler.UpdateEvent)
// 	events.Delete("/:id", middleware.RoleRequired(models.RoleAdmin), eventHandler.DeleteEvent)
// 	events.Post("/:id/rsvp", eventHandler.RSVPEvent)
// 	events.Get("/:id/attendees", eventHandler.GetEventAttendees)

// 	// Message routes
// 	messages := api.Group("/messages")
// 	messageHandler := handlers.NewMessageHandler()
// 	messages.Get("/message", messageHandler.GetConversations)
// 	messages.Post("/sendmessage", messageHandler.SendMessage)
// 	messages.Get("/:id", messageHandler.GetMessages)
// 	messages.Put("/:id/read", messageHandler.MarkAsRead)

// 	// Notification routes
// 	notifications := api.Group("/notifications")
// 	notificationHandler := handlers.NewNotificationHandler()
// 	notifications.Get("/", notificationHandler.GetNotifications)
// 	notifications.Put("/:id/read", notificationHandler.MarkAsRead)
// 	notifications.Put("/read-all", notificationHandler.MarkAllAsRead)

// 	// Gallery routes
// 	gallery := api.Group("/gallery")
// 	galleryHandler := handlers.NewGalleryHandler()
// 	gallery.Get("/", galleryHandler.GetGalleryItems)
// 	gallery.Post("/upload", middleware.RoleRequired(models.RoleFaculty, models.RoleAdmin), galleryHandler.CreateGalleryItem)
// 	gallery.Get("/:id", galleryHandler.GetGalleryItemByID)
// 	gallery.Delete("/:id", middleware.RoleRequired(models.RoleFaculty, models.RoleAdmin), galleryHandler.DeleteGalleryItem)

// 	// Admin routes
// 	admin := api.Group("/admin", middleware.RoleRequired(models.RoleAdmin))
// 	adminHandler := handlers.NewAdminHandler()
// 	analyticsHandler := handlers.NewAnalyticsHandler()

// 	admin.Get("/users", adminHandler.GetAllUsers)
// 	admin.Put("/users/:id/status", adminHandler.UpdateUserStatus)
// 	admin.Delete("/users/:id", adminHandler.DeleteUser)
// 	admin.Get("/analytics", adminHandler.GetAnalytics)
// 	admin.Get("/dashboard-analytics", analyticsHandler.GetDashboardAnalytics)

// 	// Email settings routes (admin only)
// 	emailSettings := admin.Group("/email-settings")
// 	emailSettingsHandler := handlers.NewEmailSettingsHandler()
// 	emailSettings.Get("/", emailSettingsHandler.GetEmailSettings)
// 	emailSettings.Put("/", emailSettingsHandler.UpdateEmailSettings)
// 	emailSettings.Post("/test", emailSettingsHandler.TestEmailConnection)
// 	emailSettings.Get("/templates", emailSettingsHandler.GetEmailTemplates)
// 	emailSettings.Post("/templates", emailSettingsHandler.CreateEmailTemplate)
// 	emailSettings.Get("/stats", emailSettingsHandler.GetEmailStats)
// 	/**
// 		// WebSocket routes
// 		//wsHandler := handlers.WebSocketHandler()
// 		app.Use("/ws", func(c *fiber.Ctx) error {
// 			// Check if it's a WebSocket upgrade request
// 			if websocket.IsWebSocketUpgrade(c) {
// 				c.Locals("allowed", true)
// 				return c.Next()
// 			}
// 			return fiber.ErrUpgradeRequired
// 		})
// 		//app.Get("/ws/chat", middleware.AuthRequired(), wsHandler.WebSocketUpgrade)
// 		// WebSocket routes
// 		//app.Get("/ws/chat", middleware.AuthRequired(), handlers.WebSocketHandler)
// 		//app.Get("/ws/chat", middleware.AuthRequired(), websocket.New(handlers.WebSocketHandler))
// 		app.Get("/ws/chat", func(c *fiber.Ctx) error {
// 			// Check if it's a WebSocket upgrade request
// 			if websocket.IsWebSocketUpgrade(c) {
// 				// Extract token from query parameter
// 				token := c.Query("token")
// 				if token == "" {
// 					return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
// 						"error":   true,
// 						"message": "Token required",
// 					})
// 				}

// 				// Validate token and extract user ID
// 				// (You'll need to implement this based on your JWT validation logic)
// 				userID, err := validateTokenAndGetUserID(token)
// 				if err != nil {
// 					return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
// 						"error":   true,
// 						"message": "Invalid token",
// 					})
// 				}

// 				c.Locals("userID", userID)
// 				return c.Next()
// 			}
// 			return fiber.ErrUpgradeRequired
// 		}, websocket.New(handlers.WebSocketHandler))
// 	**/
// 	// WebSocket routes with proper authentication
// 	app.Get("/ws/chat", func(c *fiber.Ctx) error {
// 		// Check if it's a WebSocket upgrade request
// 		if websocket.IsWebSocketUpgrade(c) {
// 			// Extract token from query parameter
// 			token := c.Query("token")
// 			if token == "" {
// 				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
// 					"error":   true,
// 					"message": "Token required",
// 				})
// 			}

// 			// Remove Bearer prefix if present
// 			token = strings.Replace(token, "Bearer ", "", 1)

// 			// Validate token and extract user ID
// 			userID, err := validateTokenAndGetUserID(token)
// 			if err != nil {
// 				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
// 					"error":   true,
// 					"message": "Invalid token",
// 				})
// 			}

// 			c.Locals("userID", userID)
// 			return c.Next()
// 		}
// 		return fiber.ErrUpgradeRequired
// 	}, websocket.New(handlers.WebSocketHandler))

// 	// Upload routes
// 	upload := api.Group("/upload", middleware.AuthRequired())
// 	uploadHandler := handlers.NewUploadHandler()
// 	upload.Post("/avatar", uploadHandler.UploadAvatar)
// 	upload.Post("/gallery", middleware.RoleRequired(models.RoleFaculty, models.RoleAlumni, models.RoleStudent), uploadHandler.UploadGalleryImage)

//		// Static file serving
//		app.Static("/avatars", "./public/avatars")
//		app.Static("/gallery", "./public/gallery")
//		app.Static("/logos", "./public/logos")
//		app.Static("/banners", "./public/banners")
//	}

package routes

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"

	"ete-alumni-portal/config"
	"ete-alumni-portal/handlers"
	"ete-alumni-portal/middleware"
	"ete-alumni-portal/models"
	"ete-alumni-portal/utils"
)

// validateTokenAndGetUserID validates JWT token and returns user ID
func validateTokenAndGetUserID(tokenString string) (string, error) {
	log.Printf("Validating token: %s...", tokenString[:min(len(tokenString), 20)])

	claims, err := utils.ValidateToken(tokenString)
	if err != nil {
		log.Printf("Token validation failed: %v", err)
		return "", err
	}

	userID := claims.UserID.Hex()
	log.Printf("Token validated successfully for user: %s", userID)

	// Since claims.UserID is already a primitive.ObjectID, convert it directly to string
	return userID, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func SetupRoutes(app fiber.Router) {
	cfg := config.GetConfig()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler()
	userHandler := handlers.NewUserHandler()

	// Auth routes with rate limiting
	auth := app.Group("/auth")
	auth.Post("/register", middleware.RateLimit("register", cfg.RateLimitRegister), authHandler.Register)
	auth.Post("/verify-otp", authHandler.VerifyOTP)
	auth.Post("/login", middleware.RateLimit("login", cfg.RateLimitLogin), authHandler.Login)
	auth.Post("/forgot-password", authHandler.ForgotPassword)
	auth.Post("/reset-password", authHandler.ResetPassword)
	auth.Post("/refresh", middleware.RateLimit("refresh", cfg.RateLimitRefresh), authHandler.RefreshToken)
	auth.Post("/logout", authHandler.Logout)

	// Protected routes
	api := app.Group("", middleware.AuthRequired())

	// User routes
	users := api.Group("/users")
	users.Get("/profile", userHandler.GetProfile)
	users.Put("/updateprofile", userHandler.UpdateProfile)
	users.Get("/getusers", userHandler.GetUsers)
	users.Get("/dashboard-stats", userHandler.GetDashboardStats)
	users.Get("/:id", userHandler.GetUserByID)

	// Project routes
	projects := api.Group("/projects")
	projectHandler := handlers.NewProjectHandler()
	projects.Get("/projectview", projectHandler.GetProjects)
	projects.Post("/addproject", middleware.RoleRequired(models.RoleStudent), projectHandler.CreateProject)
	projects.Get("/:id", projectHandler.GetProjectByID)
	projects.Put("/:id", middleware.RoleRequired(models.RoleStudent), projectHandler.UpdateProject)
	projects.Delete("/:id", middleware.RoleRequired(models.RoleStudent, models.RoleAdmin), projectHandler.DeleteProject)
	projects.Post("/:id/like", projectHandler.LikeProject)
	projects.Delete("/:id/like", projectHandler.UnlikeProject)

	// Job routes
	jobs := api.Group("/jobs")
	jobHandler := handlers.NewJobHandler()
	jobs.Get("/", jobHandler.GetJobs)
	jobs.Post("/add", middleware.RoleRequired(models.RoleAlumni), jobHandler.CreateJob)
	jobs.Get("/:id", jobHandler.GetJobByID)
	jobs.Put("/:id", middleware.RoleRequired(models.RoleAlumni), jobHandler.UpdateJob)
	jobs.Delete("/:id", middleware.RoleRequired(models.RoleAlumni, models.RoleAdmin), jobHandler.DeleteJob)
	jobs.Post("/:id/interest", middleware.RoleRequired(models.RoleStudent), jobHandler.ShowInterest)
	jobs.Delete("/:id/interest", middleware.RoleRequired(models.RoleStudent), jobHandler.RemoveInterest)
	jobs.Get("/:id/interested-users", middleware.RoleRequired(models.RoleAlumni, models.RoleAdmin), jobHandler.GetInterestedUsers)

	// Event routes
	events := api.Group("/events")
	eventHandler := handlers.NewEventHandler()
	events.Get("/", eventHandler.GetEvents)
	events.Post("/", middleware.RoleRequired(models.RoleAdmin), eventHandler.CreateEvent)
	events.Get("/:id", eventHandler.GetEventByID)
	events.Put("/:id", middleware.RoleRequired(models.RoleAdmin), eventHandler.UpdateEvent)
	events.Delete("/:id", middleware.RoleRequired(models.RoleAdmin), eventHandler.DeleteEvent)
	events.Post("/:id/rsvp", eventHandler.RSVPEvent)
	events.Get("/:id/attendees", eventHandler.GetEventAttendees)

	// Message routes
	messages := api.Group("/messages")
	messageHandler := handlers.NewMessageHandler()
	messages.Get("/message", messageHandler.GetConversations)
	messages.Post("/sendmessage", messageHandler.SendMessage)
	messages.Get("/:id", messageHandler.GetMessages)
	messages.Put("/:id/read", messageHandler.MarkAsRead)

	// Notification routes
	notifications := api.Group("/notifications")
	notificationHandler := handlers.NewNotificationHandler()
	notifications.Get("/inbox", notificationHandler.GetNotifications)
	notifications.Put("/:id/read", notificationHandler.MarkAsRead)
	notifications.Put("/read-all", notificationHandler.MarkAllAsRead)

	// Gallery routes
	gallery := api.Group("/gallery")
	galleryHandler := handlers.NewGalleryHandler()
	gallery.Get("/items", galleryHandler.GetGalleryItems)
	gallery.Post("/upload", middleware.RoleRequired(models.RoleFaculty, models.RoleAdmin), galleryHandler.CreateGalleryItem)
	gallery.Get("/:id", galleryHandler.GetGalleryItemByID)
	gallery.Delete("/:id", middleware.RoleRequired(models.RoleFaculty, models.RoleAdmin), galleryHandler.DeleteGalleryItem)

	// Admin routes
	admin := api.Group("/admin", middleware.RoleRequired(models.RoleAdmin))
	adminHandler := handlers.NewAdminHandler()
	analyticsHandler := handlers.NewAnalyticsHandler()

	admin.Get("/users", adminHandler.GetAllUsers)
	admin.Put("/users/:id/status", adminHandler.UpdateUserStatus)
	admin.Delete("/users/:id", adminHandler.DeleteUser)
	admin.Get("/analytics", adminHandler.GetAnalytics)
	admin.Get("/dashboard-analytics", analyticsHandler.GetDashboardAnalytics)

	// Email settings routes (admin only)
	emailSettings := admin.Group("/email-settings")
	emailSettingsHandler := handlers.NewEmailSettingsHandler()
	emailSettings.Get("/", emailSettingsHandler.GetEmailSettings)
	emailSettings.Put("/", emailSettingsHandler.UpdateEmailSettings)
	emailSettings.Post("/test", emailSettingsHandler.TestEmailConnection)
	emailSettings.Get("/templates", emailSettingsHandler.GetEmailTemplates)
	emailSettings.Post("/templates", emailSettingsHandler.CreateEmailTemplate)
	emailSettings.Get("/stats", emailSettingsHandler.GetEmailStats)

	// WebSocket routes - Enhanced with detailed logging
	app.Get("/ws/chat", func(c *fiber.Ctx) error {
		log.Printf("WebSocket connection attempt from: %s", c.IP())

		// Check if it's a WebSocket upgrade request
		if !websocket.IsWebSocketUpgrade(c) {
			log.Printf("Not a WebSocket upgrade request")
			return fiber.ErrUpgradeRequired
		}

		// Extract token from query parameter
		token := c.Query("token")
		if token == "" {
			log.Printf("No token provided in WebSocket request")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   true,
				"message": "Token required",
			})
		}

		log.Printf("Token received: %s...", token[:min(len(token), 20)])

		// Validate token and extract user ID
		userID, err := validateTokenAndGetUserID(token)
		if err != nil {
			log.Printf("Token validation failed: %v", err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   true,
				"message": "Invalid token",
			})
		}

		log.Printf("WebSocket authentication successful for user: %s", userID)

		// Store user ID in context for the WebSocket handler
		c.Locals("userID", userID)
		return c.Next()
	}, websocket.New(handlers.WebSocketHandler))

	// Upload routes
	upload := api.Group("/upload", middleware.AuthRequired())
	uploadHandler := handlers.NewUploadHandler()
	upload.Post("/avatar", uploadHandler.UploadAvatar)
	upload.Post("/gallery", middleware.RoleRequired(models.RoleFaculty, models.RoleAlumni, models.RoleStudent), uploadHandler.UploadGalleryImage)

	// Static file serving
	app.Static("/avatars", "./public/avatars")
	app.Static("/gallery", "./public/gallery")
	app.Static("/logos", "./public/logos")
	app.Static("/banners", "./public/banners")
}
