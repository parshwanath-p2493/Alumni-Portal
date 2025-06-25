// package main

// import (
// 	"log"
// 	"os"

// 	"github.com/gofiber/fiber/v2"
// 	"github.com/gofiber/fiber/v2/middleware/cors"
// 	"github.com/gofiber/fiber/v2/middleware/logger"
// 	"github.com/gofiber/fiber/v2/middleware/recover"
// 	"github.com/joho/godotenv"

// 	"ete-alumni-portal/config"
// 	"ete-alumni-portal/middleware"
// 	"ete-alumni-portal/routes"
// )

// func main() {
// 	// Load environment variables
// 	if err := godotenv.Load(); err != nil {
// 		log.Println("No .env file found")
// 	}

// 	// Initialize database connection
// 	config.ConnectDB()

// 	// Start rate limit cleanup goroutine
// 	go middleware.CleanupRateLimits()

// 	// Create Fiber app
// 	app := fiber.New(fiber.Config{
// 		ErrorHandler: func(c *fiber.Ctx, err error) error {
// 			code := fiber.StatusInternalServerError
// 			if e, ok := err.(*fiber.Error); ok {
// 				code = e.Code
// 			}
// 			return c.Status(code).JSON(fiber.Map{
// 				"error":   true,
// 				"message": err.Error(),
// 			})
// 		},
// 	})

// 	// Middleware
// 	app.Use(logger.New())
// 	app.Use(recover.New())
// 	app.Use(cors.New(cors.Config{
// 		AllowOrigins:     "http://localhost:3000",
// 		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
// 		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
// 		AllowCredentials: true,
// 		MaxAge:           300,
// 	}))

// 	// Health check
// 	app.Get("/health", func(c *fiber.Ctx) error {
// 		return c.JSON(fiber.Map{
// 			"status":  "ok",
// 			"message": "Alumni Portal API is running",
// 		})
// 	})

// 	// API routes
// 	api := app.Group("")

// 	//ssapi := fiber.New()
// 	routes.SetupRoutes(api)

// 	// Start server
// 	port := os.Getenv("PORT")
// 	if port == "" {
// 		port = "8080"
// 	}

//		log.Printf("Server starting on port %s", port)
//		log.Fatal(app.Listen(":" + port))
//	}
package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"ete-alumni-portal/config"
	"ete-alumni-portal/handlers"
	"ete-alumni-portal/middleware"
	"ete-alumni-portal/routes"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize database connection
	config.ConnectDB()

	// Start rate limit cleanup goroutine
	go middleware.CleanupRateLimits()

	// Initialize WebSocket manager
	log.Println("Starting WebSocket manager...")
	go handlers.WSManager.Run()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error":   true,
				"message": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Alumni Portal API is running",
		})
	})

	// API routes
	api := app.Group("")
	routes.SetupRoutes(api)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("WebSocket endpoint available at: ws://localhost:%s/ws/chat", port)
	log.Fatal(app.Listen(":" + port))
}
