package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"testing"
	"time"
)

type Event struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	Location    string    `json:"location"`
}

type Post struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

func testRoute(client *http.Client, method, url string, token string, body interface{}) error {
	var req *http.Request
	var err error

	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("marshal error: %v", err)
		}
		req, err = http.NewRequest(method, url, bytes.NewBuffer(jsonBody))

	} else {
		req, err = http.NewRequest(method, url, nil)
	}

	if err != nil {
		return fmt.Errorf("request creation failed: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("status %d: %s", resp.StatusCode, string(bodyBytes))
	}
	return nil
}

func TestAllRoutes(t *testing.T) {
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}
	client := &http.Client{}

	// LOGIN
	loginData := map[string]string{
		"email":    "admin@alumni-portal.com",
		"password": "admin@eteportal2025",
	}
	var loginResp LoginResponse
	loginJSON, _ := json.Marshal(loginData)
	loginReq, _ := http.NewRequest("POST", baseURL+"/auth/login", bytes.NewBuffer(loginJSON))
	loginReq.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(loginReq)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("Login failed: %v", err)
	}
	defer resp.Body.Close()
	json.NewDecoder(resp.Body).Decode(&loginResp)
	t.Log("✅ Login successful")

	// TEST CASES
	routes := []struct {
		name   string
		method string
		path   string
		token  bool
		body   interface{}
	}{
		// ✅ AUTH
		{"Register", "POST", "/auth/register", false, map[string]string{
			"name": "Test User", "email": "test@example.com", "password": "test123", "role": "student",
		}},

		// ✅ USERS
		{"Get Profile", "GET", "/users/profile", true, nil},
		{"Get All Users", "GET", "/users/getusers", true, nil},

		// ✅ PROJECTS
		{"Get Projects", "GET", "/projects/projectview", true, nil},

		// ✅ JOBS
		{"Get Jobs", "GET", "/jobs/", true, nil},
		{"Create Job", "POST", "/jobs/add", true, Job{
			Title: "Test Job", Company: "Test Ltd", Description: "Job Desc",
			Location: "Bangalore", JobType: "Intern", Salary: "0", Deadline: time.Now().AddDate(0, 0, 7),
		}},

		// ✅ EVENTS
		{"Get Events", "GET", "/events/", true, nil},
		{"Create Event", "POST", "/events/", true, Event{
			Title: "Test Event", Description: "Event Desc", Date: time.Now().AddDate(0, 0, 1), Location: "Campus",
		}},

		// ✅ POSTS
		{"Get Posts", "GET", "/posts", true, nil},
		{"Create Post", "POST", "/posts", true, Post{
			Title: "Alumni Post", Content: "Welcome message",
		}},

		// ✅ GALLERY
		{"Get Gallery", "GET", "/gallery/items", true, nil},
		{"Upload to Gallery", "POST", "/gallery/upload", true, Gallery{
			Title: "Sample", Description: "Test Img", ImageURL: "https://example.com/img.jpg",
		}},

		// ✅ INBOX (Notifications)
		{"Get Inbox", "GET", "/notifications/inbox", true, nil},

		// ✅ MESSAGES
		{"Get Messages", "GET", "/messages/message", true, nil},

		// ✅ ADMIN
		{"Get Admin Users", "GET", "/admin/users", true, nil},
		{"Get Admin Analytics", "GET", "/admin/analytics", true, nil},
	}

	t.Log("📦 Executing all route tests...")
	for _, route := range routes {
		token := ""
		if route.token {
			token = loginResp.Data.AccessToken
		}

		err := testRoute(client, route.method, baseURL+route.path, token, route.body)
		if err != nil {
			t.Logf("❌ %s FAILED → %v", route.name, err)
		} else {
			t.Logf("✅ %s PASSED", route.name)
		}
	}
}
