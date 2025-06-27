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

// Common structs
type User struct {
	Name           string `json:"name"`
	Email          string `json:"email"`
	Password       string `json:"password"`
	Role           string `json:"role"`
	GraduationYear int    `json:"graduation_year"`
}

type LoginResponse struct {
	Message      string `json:"message"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
		Role  string `json:"role"`
	} `json:"user"`
}

type Project struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	TechStack   []string `json:"tech_stack"`
	GitHubLink  string   `json:"github_link"`
	ImageURL    string   `json:"image_url"`
}

type Job struct {
	Title       string    `json:"title"`
	Company     string    `json:"company"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	Type        string    `json:"type"`
	Salary      string    `json:"salary"`
	Deadline    time.Time `json:"deadline"`
	ImageURL    string    `json:"image_url"`
}

type Message struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Content string `json:"content"`
}

type Gallery struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
}

// Test helper functions
func makeRequest(t *testing.T, method, url string, token string, body interface{}) (*http.Response, error) {
	t.Log("Testing something")
	var req *http.Request
	var err error

	if body != nil {
		var jsonBody []byte
		jsonBody, err = json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %v", err)
		}

		req, err = http.NewRequest(method, url, bytes.NewBuffer(jsonBody))
	} else {
		req, err = http.NewRequest(method, url, nil)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	client := &http.Client{}
	return client.Do(req)
}
func ensureUserExists(t *testing.T, baseURL string, user User) string {
	// Try logging in with test password
	token := login(t, baseURL, user.Email, "test123")
	if token != "" {
		t.Logf("ℹ️ User %s already exists, using existing credentials", user.Email)
		return token
	}

	// Register if not already registered
	resp, err := makeRequest(t, "POST", baseURL+"/auth/register", "", user)
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusConflict {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Registration failed: %s", string(body))
	}

	// Try verifying
	verifyEmail(t, baseURL, user.Email)

	// Login again with test password
	return login(t, baseURL, user.Email, "test123")
}

func login(t *testing.T, baseURL string, email, password string) string {
	loginData := map[string]string{
		"email":    email,
		"password": password,
	}

	resp, err := makeRequest(t, "POST", baseURL+"/auth/login", "", loginData)
	if err != nil {
		t.Fatalf("Failed to login: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Login failed with status %d: %s", resp.StatusCode, string(body))
	}

	var loginResp LoginResponse
	if err := json.Unmarshal(body, &loginResp); err != nil {
		t.Fatalf("Failed to decode login response: %v", err)
	}

	if loginResp.AccessToken == "" {
		t.Fatalf("Access token is empty in response: %s", string(body))
	}

	return loginResp.AccessToken
}

// Helper function to verify email
func verifyEmail(t *testing.T, baseURL string, email string) {
	verifyData := map[string]string{
		"email": email,
		"otp":   "123456", // Use the test verification code
	}

	//resp, err := makeRequest(t, "POST", baseURL+"/auth/verify-email", "", verifyData)
	resp, err := makeRequest(t, "POST", baseURL+"/auth/verify-otp", "", verifyData)
	if err != nil {
		t.Fatalf("Failed to verify email: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Email verification failed: %s", string(body))
	}
	t.Log("✅ Email verification successful")
}

// Test Student Role
func TestStudentRole(t *testing.T) {
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	// Ensure server is running
	resp, err := http.Get(baseURL + "/health")
	if err != nil {
		t.Fatalf("Server is not running: %v", err)
	}
	resp.Body.Close()

	// Register new student
	student := User{
		Name:           "Test Student",
		Email:          "thekingofmyqueenxyz143@gmail.com",
		Password:       "Test123!",
		Role:           "student",
		GraduationYear: time.Now().Year() + 2, // 2 years from now
	}

	token := ensureUserExists(t, baseURL, student)
	t.Log("✅ Student login successful")

	// Test forgot password
	forgotPassData := map[string]string{"email": student.Email}
	resp, err = makeRequest(t, "POST", baseURL+"/auth/forgot-password", "", forgotPassData)
	if err != nil {
		t.Fatalf("Failed to request password reset: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Forgot password request failed: %s", string(body))
	}
	t.Log("✅ Forgot password request successful")

	// Upload project
	project := Project{
		Title:       "Test Project",
		Description: "Test Description",
		TechStack:   []string{"Go", "MongoDB", "Fiber"},
		GitHubLink:  "https://github.com/test/project",
		ImageURL:    "https://example.com/project.jpg",
	}

	//resp, err = makeRequest(t, "POST", baseURL+"/projects", token, project)
	resp, err = makeRequest(t, "POST", baseURL+"/projects/addproject", token, project)

	if err != nil {
		t.Fatalf("Failed to upload project: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Project upload failed: %s", string(body))
	}
	t.Log("✅ Project upload successful")

	// View jobs (should succeed)
	resp, err = makeRequest(t, "GET", baseURL+"/jobs", token, nil)
	if err != nil {
		t.Fatalf("Failed to view jobs: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("View jobs failed: %s", string(body))
	}
	t.Log("✅ View jobs successful")

	// Try to post job (should fail - unauthorized)
	job := struct {
		Title       string    `json:"title"`
		Company     string    `json:"company"`
		Description string    `json:"description"`
		Location    string    `json:"location"`
		Type        string    `json:"type"`
		Salary      string    `json:"salary"`
		Deadline    time.Time `json:"deadline"`
	}{
		Title:       "Test Job",
		Company:     "Test Company",
		Description: "Test Description",
		Location:    "Test Location",
		Type:        "Full-time",
		Salary:      "50k-60k",
		Deadline:    time.Now().Add(7 * 24 * time.Hour),
	}

	resp, err = makeRequest(t, "POST", baseURL+"/jobs/add", token, job)
	if err != nil {
		t.Fatalf("Failed to attempt job posting: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusForbidden {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Job posting should be forbidden: %s", string(body))
	}
	t.Log("✅ Job posting correctly forbidden for student")
}

// Test Alumni Role
func TestAlumniRole(t *testing.T) {
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	// Register new alumni
	alumni := User{
		Name:           "Test Alumni",
		Email:          "1da21et030.et@drait.edu.in",
		Password:       "test1234A!",
		Role:           "alumni",
		GraduationYear: time.Now().Year() - 1, // 1 year ago
	}

	resp, err := makeRequest(t, "POST", baseURL+"/auth/register", "", alumni)
	if err != nil {
		t.Fatalf("Failed to register alumni: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusConflict {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Registration failed: %s", string(body))
	}

	// Verify email
	verifyEmail(t, baseURL, alumni.Email)

	// // Login as alumni
	// token := login(t, baseURL, alumni.Email, alumni.Password)
	// t.Log("✅ Alumni login successful")

	token := ensureUserExists(t, baseURL, alumni)
	t.Log("✅ Alumni login successful")

	// Post job
	job := struct {
		Title       string    `json:"title"`
		Company     string    `json:"company"`
		Description string    `json:"description"`
		Location    string    `json:"location"`
		Type        string    `json:"type"`
		Salary      string    `json:"salary"`
		Deadline    time.Time `json:"deadline"`
	}{
		Title:       "Test Job",
		Company:     "Test Company",
		Description: "Test Description",
		Location:    "Test Location",
		Type:        "Full-time",
		Salary:      "50k-60k",
		Deadline:    time.Now().Add(7 * 24 * time.Hour),
	}

	//resp, err = makeRequest(t, "POST", baseURL+"/jobs", token, job)
	resp, err = makeRequest(t, "POST", baseURL+"/jobs/add", token, job)
	if err != nil {
		t.Fatalf("Failed to post job: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Job posting failed: %s", string(body))
	}
	t.Log("✅ Job posting successful")

	// Post to gallery
	gallery := struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		ImageURL    string `json:"image_url"`
	}{
		Title:       "Test Image",
		Description: "Test Description",
		ImageURL:    "https://example.com/image.jpg",
	}

	//resp, err = makeRequest(t, "POST", baseURL+"/gallery", token, gallery)
	resp, err = makeRequest(t, "POST", baseURL+"/gallery/upload", token, gallery)
	if err != nil {
		t.Fatalf("Failed to post to gallery: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Gallery posting failed: %s", string(body))
	}
	t.Log("✅ Gallery posting successful")
}

// Test Faculty Role
func TestFacultyRole(t *testing.T) {
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	// Register new faculty
	faculty := User{
		Name:           "Test Faculty",
		Email:          "parshwanathparamagond1234@gmail.com",
		Password:       "Test123!",
		Role:           "faculty",
		GraduationYear: time.Now().Year() - 5, // 5 years ago
	}

	resp, err := makeRequest(t, "POST", baseURL+"/auth/register", "", faculty)
	if err != nil {
		t.Fatalf("Failed to register faculty: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusConflict {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Registration failed: %s", string(body))
	}

	// Verify email
	verifyEmail(t, baseURL, faculty.Email)

	// // Login as faculty
	// token := login(t, baseURL, faculty.Email, faculty.Password)
	// t.Log("✅ Faculty login successful")

	token := ensureUserExists(t, baseURL, faculty)
	t.Log("✅ Faculty login successful")

	// View student projects
	resp, err = makeRequest(t, "GET", baseURL+"/projects", token, nil)
	if err != nil {
		t.Fatalf("Failed to view projects: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("View projects failed: %s", string(body))
	}
	t.Log("✅ View projects successful")

	// Send message to student
	message := Message{
		To:      "thekingofmyqueenxyz143@gmail.com",
		Subject: "Project Review",
		Content: "Great work on your project!",
	}

	//resp, err = makeRequest(t, "POST", baseURL+"/inbox", token, message)
	resp, err = makeRequest(t, "POST", baseURL+"/messages/sendmessage", token, message)
	if err != nil {
		t.Fatalf("Failed to send message: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Message sending failed: %s", string(body))
	}
	t.Log("✅ Message sending successful")
}

// Test Admin Role
func TestAdminRole(t *testing.T) {
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	// Login as admin
	token := login(t, baseURL, "admin@alumni-portal.com", "admin123")
	t.Log("✅ Admin login successful")

	// Get all users
	resp, err := makeRequest(t, "GET", baseURL+"/admin/users", token, nil)
	if err != nil {
		t.Fatalf("Failed to get users: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Get users failed: %s", string(body))
	}
	t.Log("✅ Get users successful")

	// Get stats
	resp, err = makeRequest(t, "GET", baseURL+"/admin/stats", token, nil)
	if err != nil {
		t.Fatalf("Failed to get stats: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Get stats failed: %s", string(body))
	}
	t.Log("✅ Get stats successful")
}

// Test Unauthorized Access
func TestUnauthorizedAccess(t *testing.T) {
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	// Register and login as student
	student := User{
		Name:     "Test Student",
		Email:    "thekingofmyqueenxyz143@gmail.com",
		Password: "test123",
		Role:     "student",
	}

	token := ensureUserExists(t, baseURL, student)
	t.Log("✅ Student login successful")

	// Try to access admin routes
	resp, err := makeRequest(t, "GET", baseURL+"/admin/users", token, nil)
	if err != nil {
		t.Fatalf("Failed to attempt admin access: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusForbidden {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Admin access should be forbidden: %s", string(body))
	}
	t.Log("✅ Admin access correctly forbidden for student")

	// Try to post job as student
	job := struct {
		Title       string    `json:"title"`
		Company     string    `json:"company"`
		Description string    `json:"description"`
		Location    string    `json:"location"`
		Type        string    `json:"type"`
		Salary      string    `json:"salary"`
		Deadline    time.Time `json:"deadline"`
	}{
		Title:       "Test Job",
		Company:     "Test Company",
		Description: "Test Description",
		Location:    "Test Location",
		Type:        "Full-time",
		Salary:      "50k-60k",
		Deadline:    time.Now().Add(7 * 24 * time.Hour),
	}

	//resp, err = makeRequest(t, "POST", baseURL+"/jobs", token, job)
	resp, err = makeRequest(t, "POST", baseURL+"/jobs/add", token, job)
	if err != nil {
		t.Fatalf("Failed to attempt job posting: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusForbidden {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Job posting should be forbidden: %s", string(body))
	}
	t.Log("✅ Job posting correctly forbidden for student")
}
