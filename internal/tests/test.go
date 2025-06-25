// NOTE: This file is for manual role-based testing and can be deleted after full development.
// Location: /backend/internal/tests/test.go

package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TestStudentFlow tests the complete flow for a student user
func TestStudentFlow(t *testing.T) {
	app := setupTestApp()
	var studentToken string

	var studentID string
	t.Run("Student Registration", func(t *testing.T) {
		body := map[string]interface{}{
			"name":           "Test Student",
			"email":          "student@example.com",
			"password":       "Test1234!",
			"role":           "student",
			"department":     "ETE",
			"skills":         []string{"Go", "React"},
			"studentId":      "ETE2025",
			"graduationYear": 2025,
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)

		if success, ok := result["success"].(bool); !ok || !success {
			t.Errorf("Expected success to be true, got %v", result["success"])
		}

		// Extract user ID for future tests
		if data, ok := result["data"].(map[string]interface{}); ok {
			if id, ok := data["id"].(string); ok {
				studentID = id
				t.Logf("student id is %s", studentID)
			}
		}
	})

	t.Run("Student Login", func(t *testing.T) {
		body := map[string]interface{}{
			"email":    "student@example.com",
			"password": "Test1234!",
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)

		if success, ok := result["success"].(bool); !ok || !success {
			t.Errorf("Expected success to be true, got %v", result["success"])
		}

		// Extract token for future authenticated requests
		if data, ok := result["data"].(map[string]interface{}); ok {
			if token, ok := data["accessToken"].(string); ok {
				studentToken = token
			}
		}
	})

	t.Run("Student Post Project", func(t *testing.T) {
		if studentToken == "" {
			t.Skip("Skipping test as student token is not available")
		}

		body := map[string]interface{}{
			"title":       "Test Project",
			"description": "This is a test project for the student flow",
			"type":        "Mini Project",
			"technologies": []string{
				"React",
				"Node.js",
				"MongoDB",
			},
			"githubUrl": "https://github.com/test/project",
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/api/v1/projects", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+studentToken)

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusCreated {
			t.Errorf("Expected status 201, got %d", resp.StatusCode)
		}

		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)

		if success, ok := result["success"].(bool); !ok || !success {
			t.Errorf("Expected success to be true, got %v", result["success"])
		}
	})

	t.Run("Student Show Interest in Job", func(t *testing.T) {
		if studentToken == "" {
			t.Skip("Skipping test as student token is not available")
		}

		// Assuming job ID 1 exists
		jobID := "1"
		req := httptest.NewRequest("POST", "/api/v1/jobs/"+jobID+"/interest", nil)
		req.Header.Set("Authorization", "Bearer "+studentToken)

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)

		if success, ok := result["success"].(bool); !ok || !success {
			t.Errorf("Expected success to be true, got %v", result["success"])
		}
	})

	// Additional student flow tests can be added here
}

// TestAlumniFlow tests the complete flow for an alumni user
func TestAlumniFlow(t *testing.T) {
	app := setupTestApp()
	var alumniToken string

	t.Run("Alumni Registration", func(t *testing.T) {
		body := map[string]interface{}{
			"name":           "Test Alumni",
			"email":          "alumni@example.com",
			"password":       "Test1234!",
			"role":           "alumni",
			"department":     "ETE",
			"skills":         []string{"Python", "Machine Learning"},
			"studentId":      "ETE2020",
			"graduationYear": 2020,
			"company":        "Tech Corp",
			"position":       "Software Engineer",
			"experience":     "3 years",
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("Alumni Login", func(t *testing.T) {
		body := map[string]interface{}{
			"email":    "alumni@example.com",
			"password": "Test1234!",
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)

		// Extract token for future authenticated requests
		if data, ok := result["data"].(map[string]interface{}); ok {
			if token, ok := data["accessToken"].(string); ok {
				alumniToken = token
			}
		}
	})

	t.Run("Alumni Post Job", func(t *testing.T) {
		if alumniToken == "" {
			t.Skip("Skipping test as alumni token is not available")
		}

		body := map[string]interface{}{
			"title":       "Software Engineer",
			"company":     "Tech Corp",
			"location":    "Bangalore, Karnataka",
			"type":        "Full-time",
			"experience":  "0-2 years",
			"salary":      "₹6-10 LPA",
			"description": "We are looking for a passionate Software Engineer to join our team.",
			"requirements": []string{
				"React.js",
				"Node.js",
				"MongoDB",
			},
			"deadline": "2023-12-31",
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/api/v1/jobs", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+alumniToken)

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusCreated {
			t.Errorf("Expected status 201, got %d", resp.StatusCode)
		}
	})

	// Additional alumni flow tests can be added here
}

// TestFacultyFlow tests the complete flow for a faculty user
func TestFacultyFlow(t *testing.T) {
	app := setupTestApp()
	var facultyToken string

	t.Run("Faculty Registration", func(t *testing.T) {
		body := map[string]interface{}{
			"name":           "Test Faculty",
			"email":          "faculty@example.com",
			"password":       "Test1234!",
			"role":           "faculty",
			"department":     "ETE",
			"position":       "Associate Professor",
			"specialization": "Signal Processing",
			"experience":     "10 years",
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("Faculty Login", func(t *testing.T) {
		body := map[string]interface{}{
			"email":    "faculty@example.com",
			"password": "Test1234!",
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)

		// Extract token for future authenticated requests
		if data, ok := result["data"].(map[string]interface{}); ok {
			if token, ok := data["accessToken"].(string); ok {
				facultyToken = token
			}
		}
	})

	t.Run("Faculty Upload Gallery Image", func(t *testing.T) {
		if facultyToken == "" {
			t.Skip("Skipping test as faculty token is not available")
		}

		// Note: This is a simplified test as we can't easily test file uploads in this context
		// In a real test, you would use multipart form data
		t.Skip("Skipping file upload test as it requires multipart form data")
	})

	// Additional faculty flow tests can be added here
}

// TestAdminFlow tests the complete flow for an admin user
func TestAdminFlow(t *testing.T) {
	app := setupTestApp()
	var adminToken string

	t.Run("Admin Login", func(t *testing.T) {
		body := map[string]interface{}{
			"email":    "admin@example.com",
			"password": "Admin1234!",
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}

		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)

		// Extract token for future authenticated requests
		if data, ok := result["data"].(map[string]interface{}); ok {
			if token, ok := data["accessToken"].(string); ok {
				adminToken = token
			}
		}
	})

	t.Run("Admin Get All Users", func(t *testing.T) {
		if adminToken == "" {
			t.Skip("Skipping test as admin token is not available")
		}

		req := httptest.NewRequest("GET", "/api/v1/admin/users", nil)
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("Admin Delete Gallery Image", func(t *testing.T) {
		if adminToken == "" {
			t.Skip("Skipping test as admin token is not available")
		}

		// Assuming gallery image ID 1 exists
		imageID := "1"
		req := httptest.NewRequest("DELETE", "/api/v1/admin/gallery/"+imageID, nil)
		req.Header.Set("Authorization", "Bearer "+adminToken)

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// Additional admin flow tests can be added here
}

// Helper function to set up the test app
func setupTestApp() *fiber.App {
	app := fiber.New()

	// Setup routes
	// This would typically call your routes.SetupRouter() function
	// For testing purposes, we'll define some basic routes here

	app.Post("/auth/register", func(c *fiber.Ctx) error {
		var user map[string]interface{}
		if err := c.BodyParser(&user); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"message": "Invalid request body",
			})
		}

		// Generate a mock ID
		id := primitive.NewObjectID().Hex()

		return c.Status(200).JSON(fiber.Map{
			"success": true,
			"message": "User registered successfully",
			"data": fiber.Map{
				"id": id,
			},
		})
	})

	app.Post("/auth/login", func(c *fiber.Ctx) error {
		var credentials map[string]interface{}
		if err := c.BodyParser(&credentials); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"message": "Invalid request body",
			})
		}

		// Generate a mock token
		token := "mock_token_" + fmt.Sprintf("%v", credentials["email"])

		return c.Status(200).JSON(fiber.Map{
			"success": true,
			"message": "Login successful",
			"data": fiber.Map{
				"accessToken":  token,
				"refreshToken": "mock_refresh_token",
			},
		})
	})

	app.Post("/projects", func(c *fiber.Ctx) error {
		var project map[string]interface{}
		if err := c.BodyParser(&project); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"message": "Invalid request body",
			})
		}

		// Generate a mock ID
		id := primitive.NewObjectID().Hex()

		return c.Status(201).JSON(fiber.Map{
			"success": true,
			"message": "Project created successfully",
			"data": fiber.Map{
				"id": id,
			},
		})
	})

	app.Post("/jobs", func(c *fiber.Ctx) error {
		var job map[string]interface{}
		if err := c.BodyParser(&job); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"message": "Invalid request body",
			})
		}

		// Generate a mock ID
		id := primitive.NewObjectID().Hex()

		return c.Status(201).JSON(fiber.Map{
			"success": true,
			"message": "Job created successfully",
			"data": fiber.Map{
				"id": id,
			},
		})
	})

	app.Post("/jobs/:id/interest", func(c *fiber.Ctx) error {
		jobID := c.Params("id")

		return c.Status(200).JSON(fiber.Map{
			"success": true,
			"message": "Interest shown in job successfully",
			"data": fiber.Map{
				"jobId": jobID,
			},
		})
	})

	app.Get("/api/v1/admin/users", func(c *fiber.Ctx) error {
		// Mock users data
		users := []map[string]interface{}{
			{
				"id":    primitive.NewObjectID().Hex(),
				"name":  "Test User 1",
				"email": "user1@example.com",
				"role":  "student",
			},
			{
				"id":    primitive.NewObjectID().Hex(),
				"name":  "Test User 2",
				"email": "user2@example.com",
				"role":  "alumni",
			},
		}

		return c.Status(200).JSON(fiber.Map{
			"success": true,
			"message": "Users retrieved successfully",
			"data":    users,
		})
	})

	app.Delete("/admin/gallery/:id", func(c *fiber.Ctx) error {
		imageID := c.Params("id")

		return c.Status(200).JSON(fiber.Map{
			"success": true,
			"message": "Gallery image deleted successfully",
			"data": fiber.Map{
				"id": imageID,
			},
		})
	})

	return app
}
