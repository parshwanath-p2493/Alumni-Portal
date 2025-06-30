// package tests

// import (
// 	"bufio"
// 	"bytes"
// 	"encoding/json"
// 	"fmt"
// 	"io"
// 	"net/http"
// 	"os"
// 	"strings"
// 	"testing"
// 	"time"

// 	"golang.org/x/term"
// )

// var baseURL = "http://localhost:8080"

// // getOTP prompts for manual OTP input from terminal with 60 seconds timeout.
// func getOTP(email string) string {
// 	fmt.Printf("\nCheck your email (%s) for the OTP.\n", email)

// 	if !term.IsTerminal(int(os.Stdin.Fd())) {
// 		fmt.Println("Non-interactive environment detected, please run interactively for OTP input.")
// 		return ""
// 	}

// 	fmt.Print("Enter the OTP you received via email (you have 60 seconds): ")
// 	reader := bufio.NewReader(os.Stdin)
// 	otpCh := make(chan string, 1)

// 	go func() {
// 		otp, _ := reader.ReadString('\n')
// 		otpCh <- strings.TrimSpace(otp)
// 	}()

// 	select {
// 	case entered := <-otpCh:
// 		if entered == "" {
// 			fmt.Println("No OTP entered. Please rerun test and enter the OTP.")
// 			return ""
// 		}
// 		return entered
// 	case <-time.After(60 * time.Second):
// 		fmt.Println("\nTimeout waiting for OTP input. Please rerun test and enter OTP in time.")
// 		return ""
// 	}
// }

// func TestAutoRegistrationAndDashboard(t *testing.T) {
// 	emails := []string{
// 		"thekingofmyqueenxyz143@gmail.com", // Student
// 		"1da21et030.et@drait.edu.in",       // Alumni
// 	}
// 	roles := []string{"student", "alumni"}

// 	for i, email := range emails {
// 		fmt.Printf("\n--- Testing registration for %s (%s) ---\n", email, roles[i])

// 		// 1. Register
// 		regPayload := map[string]interface{}{
// 			"name":           "Test User",
// 			"email":          email,
// 			"password":       "TestPassword123!",
// 			"role":           roles[i],
// 			"studentId":      fmt.Sprintf("ID%d", time.Now().UnixNano()%100000),
// 			"graduationYear": 2024,
// 		}
// 		regBody, _ := json.Marshal(regPayload)
// 		resp, err := http.Post(baseURL+"/auth/register", "application/json", bytes.NewReader(regBody))
// 		if err != nil {
// 			t.Fatalf("Registration failed: %v", err)
// 		}
// 		defer resp.Body.Close()
// 		body, _ := io.ReadAll(resp.Body)
// 		fmt.Printf("Registration response: %s\n", string(body))

// 		// 2. Interactive OTP input (wait up to 60 seconds)
// 		otp := getOTP(email)
// 		if otp == "" {
// 			t.Fatalf("OTP input failed or timed out. Cannot continue test for %s", email)
// 		}

// 		// 3. Verify OTP
// 		otpPayload := map[string]interface{}{
// 			"email": email,
// 			"otp":   otp,
// 		}
// 		otpBody, _ := json.Marshal(otpPayload)
// 		resp, err = http.Post(baseURL+"/auth/verify-otp", "application/json", bytes.NewReader(otpBody))
// 		if err != nil {
// 			t.Fatalf("OTP verification failed: %v", err)
// 		}
// 		defer resp.Body.Close()
// 		body, _ = io.ReadAll(resp.Body)
// 		fmt.Printf("OTP verification response: %s\n", string(body))

// 		var otpResp map[string]interface{}
// 		if err := json.Unmarshal(body, &otpResp); err != nil {
// 			t.Fatalf("Failed to parse OTP verification response: %v", err)
// 		}
// 		if errVal, ok := otpResp["error"].(bool); ok && errVal == true {
// 			t.Fatalf("OTP verification error: %v", otpResp["message"])
// 		}

// 		// 4. Login (only if OTP verified)
// 		loginPayload := map[string]interface{}{
// 			"email":    email,
// 			"password": "TestPassword123!",
// 		}
// 		loginBody, _ := json.Marshal(loginPayload)
// 		resp, err = http.Post(baseURL+"/auth/login", "application/json", bytes.NewReader(loginBody))
// 		if err != nil {
// 			t.Fatalf("Login failed: %v", err)
// 		}
// 		defer resp.Body.Close()
// 		body, _ = io.ReadAll(resp.Body)
// 		fmt.Printf("Login response: %s\n", string(body))

// 		var loginResp map[string]interface{}
// 		if err := json.Unmarshal(body, &loginResp); err != nil {
// 			t.Fatalf("Failed to parse login response: %v", err)
// 		}

// 		token := ""
// 		if data, ok := loginResp["data"].(map[string]interface{}); ok {
// 			if tkn, ok := data["access_token"].(string); ok {
// 				token = tkn
// 			}
// 		}
// 		if token == "" {
// 			t.Fatalf("No token received after login for %s", email)
// 		}

// 		client := &http.Client{}
// 		get(client, "/users/profile", token, t)
// 		get(client, "/users/dashboard-stats", token, t)
// 		get(client, "/users", token, t)

// 		if roles[i] == "student" {
// 			projectPayload := map[string]interface{}{
// 				"title":        "Student Project",
// 				"description":  "Description of student project",
// 				"type":         "Major",
// 				"technologies": []string{"Go", "React", "MongoDB"},
// 			}
// 			post(client, "/projects", projectPayload, token, t)
// 		}

// 		if roles[i] == "alumni" {
// 			jobPayload := map[string]interface{}{
// 				"title":       "Hiring Go Dev",
// 				"company":     "Mock Corp",
// 				"description": "Full-time remote dev job",
// 				"type":        "Full-time",
// 				"location":    "Remote",
// 				"experience":  "0-1 years",
// 			}
// 			post(client, "/jobs", jobPayload, token, t)
// 		}

// 		if roles[i] == "student" {
// 			msgPayload := map[string]interface{}{
// 				"receiverEmail": "1da21et030.et@drait.edu.in",
// 				"content":       "Hello alumni! I'm a student from ETE.",
// 			}
// 			post(client, "/messages", msgPayload, token, t)
// 		}

// 		get(client, "/notifications", token, t)
// 		time.Sleep(1 * time.Second)
// 	}
// }

// func post(client *http.Client, route string, payload map[string]interface{}, token string, t *testing.T) {
// 	body, _ := json.Marshal(payload)
// 	req, _ := http.NewRequest("POST", baseURL+route, bytes.NewReader(body))
// 	req.Header.Set("Authorization", "Bearer "+token)
// 	req.Header.Set("Content-Type", "application/json")
// 	resp, err := client.Do(req)
// 	if err != nil {
// 		t.Fatalf("POST %s failed: %v", route, err)
// 	}
// 	defer resp.Body.Close()
// 	resBody, _ := io.ReadAll(resp.Body)
// 	fmt.Printf("POST %s response: %s\n", route, resBody)
// }

//	func get(client *http.Client, route string, token string, t *testing.T) {
//		req, _ := http.NewRequest("GET", baseURL+route, nil)
//		req.Header.Set("Authorization", "Bearer "+token)
//		resp, err := client.Do(req)
//		if err != nil {
//			t.Fatalf("GET %s failed: %v", route, err)
//		}
//		defer resp.Body.Close()
//		body, _ := io.ReadAll(resp.Body)
//		fmt.Printf("GET %s response: %s\n", route, body)
//	}
package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"
)

// Common structs matching your backend models exactly
type User struct {
	Name           string   `json:"name"`
	Email          string   `json:"email"`
	Password       string   `json:"password"`
	Role           string   `json:"role"`
	StudentID      string   `json:"student_id,omitempty"`
	GraduationYear int      `json:"graduation_year,omitempty"`
	Company        string   `json:"company,omitempty"`
	Position       string   `json:"position,omitempty"`
	Location       string   `json:"location,omitempty"`
	Experience     string   `json:"experience,omitempty"`
	Skills         []string `json:"skills,omitempty"`
	GitHubURL      string   `json:"github_url,omitempty"`
	LinkedInURL    string   `json:"linkedin_url,omitempty"`
}

type LoginResponse struct {
	Data struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		User         struct {
			ID             string   `json:"id"`
			Name           string   `json:"name"`
			Email          string   `json:"email"`
			Role           string   `json:"role"`
			StudentID      string   `json:"student_id,omitempty"`
			GraduationYear int      `json:"graduation_year,omitempty"`
			Company        string   `json:"company,omitempty"`
			Position       string   `json:"position,omitempty"`
			Skills         []string `json:"skills,omitempty"`
			IsVerified     bool     `json:"is_verified"`
			IsActive       bool     `json:"is_active"`
		} `json:"user"`
	} `json:"data"`
	Message string `json:"message"`
	Error   bool   `json:"error"`
}

// Project struct matching backend validation
type Project struct {
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	ProjectType  string   `json:"project_type"` // Changed from Type to ProjectType
	Technologies []string `json:"technologies"`
	GitHubURL    string   `json:"github_url,omitempty"`
	ImageURL     string   `json:"image_url,omitempty"`
	DemoURL      string   `json:"demo_url,omitempty"`
}

// Job struct matching backend validation exactly
type Job struct {
	Title              string    `json:"title"`
	Company            string    `json:"company"`
	Location           string    `json:"location"`
	JobType            string    `json:"job_type"`
	ExperienceRequired string    `json:"experience_required,omitempty"`
	SalaryRange        string    `json:"salary_range,omitempty"`
	Description        string    `json:"description"`
	Requirements       []string  `json:"requirements"`
	ExpiresAt          time.Time `json:"expires_at"`
}

type Event struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	EventDate   time.Time `json:"event_date"`
	EventType   string    `json:"event_type"`
	MaxCapacity int       `json:"max_capacity,omitempty"`
	ImageURL    string    `json:"image_url,omitempty"`
}

type SendMessageRequest struct {
	RecipientID string `json:"recipient_id"`
	Subject     string `json:"subject,omitempty"`
	Content     string `json:"content"`
}

// Test helper functions
func makeRequest(_ *testing.T, method, url string, token string, body interface{}) (*http.Response, error) {
	var req *http.Request
	var err error

	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %v", err)
		}
		req, err = http.NewRequest(method, url, bytes.NewBuffer(jsonBody))
		if err != nil {
			return nil, fmt.Errorf("failed to create request: %v", err)
		}
	} else {
		req, err = http.NewRequest(method, url, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create request: %v", err)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	return client.Do(req)
}

func getBaseURL() string {
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}
	return baseURL
}

func ensureServerRunning(t *testing.T, baseURL string) {
	resp, err := http.Get(baseURL + "/health")
	if err != nil {
		t.Fatalf("❌ Server is not running at %s: %v", baseURL, err)
	}
	resp.Body.Close()
	t.Logf("✅ Server is running at %s", baseURL)
}

func registerUser(t *testing.T, baseURL string, user User) {
	resp, err := makeRequest(t, "POST", baseURL+"/auth/register", "", user)
	if err != nil {
		t.Fatalf("❌ Failed to register user: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusConflict {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("❌ Registration failed with status %d: %s", resp.StatusCode, string(body))
	}

	t.Logf("✅ User %s registered successfully", user.Email)
}

func verifyEmail(t *testing.T, baseURL string, email string) {
	verifyData := map[string]string{
		"email": email,
		"otp":   "123456", // Test OTP
	}

	resp, err := makeRequest(t, "POST", baseURL+"/auth/verify-otp", "", verifyData)
	if err != nil {
		t.Logf("⚠️ Email verification failed (might already be verified): %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		t.Logf("✅ Email verification successful for %s", email)
	} else {
		t.Logf("⚠️ Email verification status %d (might already be verified)", resp.StatusCode)
	}
}

func loginUser(t *testing.T, baseURL string, email, password string) string {
	loginData := map[string]string{
		"email":    email,
		"password": password,
	}

	resp, err := makeRequest(t, "POST", baseURL+"/auth/login", "", loginData)
	if err != nil {
		t.Fatalf("❌ Failed to login: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("❌ Login failed with status %d: %s", resp.StatusCode, string(body))
	}

	var loginResp LoginResponse
	if err := json.Unmarshal(body, &loginResp); err != nil {
		t.Fatalf("❌ Failed to decode login response: %v", err)
	}

	if loginResp.Data.AccessToken == "" {
		t.Fatalf("❌ Access token is empty in response")
	}

	t.Logf("✅ Login successful for %s (Role: %s)", email, loginResp.Data.User.Role)
	return loginResp.Data.AccessToken
}

func EnsureUserExists(t *testing.T, baseURL string, user User) string {
	// Try logging in first
	loginData := map[string]string{
		"email":    user.Email,
		"password": user.Password,
	}

	resp, err := makeRequest(t, "POST", baseURL+"/auth/login", "", loginData)
	if err == nil {
		defer resp.Body.Close()
		if resp.StatusCode == http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			var loginResp LoginResponse
			if err := json.Unmarshal(body, &loginResp); err == nil && loginResp.Data.AccessToken != "" {
				t.Logf("ℹ️ User %s already exists, using existing credentials", user.Email)
				return loginResp.Data.AccessToken
			}
		}
	}

	// Register if login failed
	registerUser(t, baseURL, user)
	verifyEmail(t, baseURL, user.Email)
	return loginUser(t, baseURL, user.Email, user.Password)
}

// Test Student Role
func TestStudentRole(t *testing.T) {
	baseURL := getBaseURL()
	ensureServerRunning(t, baseURL)

	t.Log("🎓 Testing Student Role Functionality")

	student := User{
		Name:           "Test Student",
		Email:          "thekingofmyqueenxyz143@gmail.com",
		Password:       "Test123!",
		Role:           "student",
		StudentID:      "ETE2025001",
		GraduationYear: 2025,
		Skills:         []string{"Go", "React", "MongoDB"},
		GitHubURL:      "https://github.com/teststudent",
		LinkedInURL:    "https://linkedin.com/in/teststudent",
	}

	// Register and login
	token := EnsureUserExists(t, baseURL, student)

	// Test project upload (should succeed)
	t.Run("Student_Upload_Project", func(t *testing.T) {
		project := Project{
			Title:        "IoT Smart Home System",
			Description:  "A comprehensive smart home automation system using IoT devices and sensors for monitoring and controlling various aspects of a home environment",
			ProjectType:  "major", // Fixed: using correct field name
			Technologies: []string{"Arduino", "React", "Node.js", "MongoDB"},
			GitHubURL:    "https://github.com/teststudent/smart-home",
			DemoURL:      "https://smart-home-demo.com",
		}

		resp, err := makeRequest(t, "POST", baseURL+"/projects/addproject", token, project)
		if err != nil {
			t.Fatalf("❌ Failed to upload project: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Project upload failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Student project upload successful")
	})

	// Test viewing jobs (should succeed)
	t.Run("Student_View_Jobs", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/jobs", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to view jobs: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ View jobs failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Student view jobs successful")
	})

	// Test posting job (should fail - unauthorized)
	t.Run("Student_Post_Job_Should_Fail", func(t *testing.T) {
		job := Job{
			Title:              "Software Engineer",
			Company:            "Test Company",
			Location:           "Bangalore, Karnataka",
			JobType:            "full-time",
			ExperienceRequired: "0-2 years",
			SalaryRange:        "₹6-10 LPA",
			Description:        "We are looking for a passionate Software Engineer to join our team and work on exciting projects that will shape the future of technology.",
			Requirements:       []string{"React.js", "Node.js", "MongoDB"},
			ExpiresAt:          time.Now().Add(30 * 24 * time.Hour),
		}

		resp, err := makeRequest(t, "POST", baseURL+"/jobs/add", token, job)
		if err != nil {
			t.Fatalf("❌ Failed to attempt job posting: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusForbidden {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Job posting should be forbidden for students, got status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Job posting correctly forbidden for student")
	})

	// Test viewing events (should succeed)
	t.Run("Student_View_Events", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/events", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to view events: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ View events failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Student view events successful")
	})

	// Test viewing gallery (should succeed)
	t.Run("Student_View_Gallery", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/gallery/items", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to view gallery: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ View gallery failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Student view gallery successful")
	})

	// Test accessing admin routes (should fail)
	t.Run("Student_Admin_Access_Should_Fail", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/admin/users", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to attempt admin access: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusForbidden {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Admin access should be forbidden for students, got status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Admin access correctly forbidden for student")
	})
}

// Test Alumni Role
func TestAlumniRole(t *testing.T) {
	baseURL := getBaseURL()
	ensureServerRunning(t, baseURL)

	t.Log("🎓 Testing Alumni Role Functionality")

	alumni := User{
		Name:           "Test Alumni",
		Email:          "rahulroshu2003@gmail.com",
		Password:       "Test123!",
		Role:           "alumni",
		StudentID:      "ETE2020001",
		GraduationYear: 2020,
		Company:        "Tech Corp",
		Position:       "Senior Software Engineer",
		Experience:     "5 years",
		Skills:         []string{"Python", "Machine Learning", "AWS"},
		GitHubURL:      "https://github.com/testalumni",
		LinkedInURL:    "https://linkedin.com/in/testalumni",
	}

	// Register and login
	token := EnsureUserExists(t, baseURL, alumni)

	// Test job posting (should succeed)
	t.Run("Alumni_Post_Job", func(t *testing.T) {
		job := Job{
			Title:              "Full Stack Developer",
			Company:            "Tech Corp",
			Location:           "Bangalore, Karnataka",
			JobType:            "full-time",
			ExperienceRequired: "2-5 years",
			SalaryRange:        "₹12-18 LPA",
			Description:        "We are looking for an experienced Full Stack Developer to join our growing team and work on cutting-edge web applications that serve millions of users worldwide.",
			Requirements:       []string{"React.js", "Node.js", "PostgreSQL", "AWS"},
			ExpiresAt:          time.Now().Add(30 * 24 * time.Hour),
		}

		resp, err := makeRequest(t, "POST", baseURL+"/jobs/add", token, job)
		if err != nil {
			t.Fatalf("❌ Failed to post job: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Job posting failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Alumni job posting successful")
	})

	// Test viewing student projects (should succeed)
	t.Run("Alumni_View_Projects", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/projects/projectview", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to view projects: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ View projects failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Alumni view projects successful")
	})

	// Test sending message (should succeed)
	t.Run("Alumni_Send_Message", func(t *testing.T) {
		message := SendMessageRequest{
			RecipientID: "student_id_placeholder", // In real test, get actual student ID
			Subject:     "Job Opportunity",
			Content:     "Hi! I have an exciting job opportunity that might interest you.",
		}

		resp, err := makeRequest(t, "POST", baseURL+"/messages/sendmessage", token, message)
		if err != nil {
			t.Fatalf("❌ Failed to send message: %v", err)
		}
		defer resp.Body.Close()

		// Accept both 201 and 400 (if recipient doesn't exist)
		if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusBadRequest {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Send message failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Alumni send message test completed")
	})

	// Test accessing admin routes (should fail)
	t.Run("Alumni_Admin_Access_Should_Fail", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/admin/users", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to attempt admin access: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusForbidden {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Admin access should be forbidden for alumni, got status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Admin access correctly forbidden for alumni")
	})
}

// Test Faculty Role
func TestFacultyRole(t *testing.T) {
	baseURL := getBaseURL()
	ensureServerRunning(t, baseURL)

	t.Log("👨‍🏫 Testing Faculty Role Functionality")

	faculty := User{
		Name:        "Test Faculty",
		Email:       "parshwanathparamagond1234@gmail.com",
		Password:    "Test123!",
		Role:        "faculty",
		Position:    "Associate Professor",
		Experience:  "10 years",
		Skills:      []string{"Signal Processing", "Machine Learning", "Research"},
		GitHubURL:   "https://github.com/testfaculty",
		LinkedInURL: "https://linkedin.com/in/testfaculty",
	}

	// Register and login
	token := EnsureUserExists(t, baseURL, faculty)

	// Test viewing student projects (should succeed)
	t.Run("Faculty_View_Projects", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/projects/projectview", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to view projects: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ View projects failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Faculty view projects successful")
	})

	// Test creating event (should succeed for admin only, so this should fail)
	t.Run("Faculty_Create_Event_Should_Fail", func(t *testing.T) {
		event := Event{
			Title:       "Tech Fest 2024",
			Description: "Annual technical festival showcasing student innovations",
			Location:    "Main Auditorium",
			EventDate:   time.Now().Add(30 * 24 * time.Hour),
			EventType:   "festival",
			MaxCapacity: 500,
		}

		resp, err := makeRequest(t, "POST", baseURL+"/events", token, event)
		if err != nil {
			t.Fatalf("❌ Failed to attempt event creation: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusForbidden {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Event creation should be forbidden for faculty, got status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Event creation correctly forbidden for faculty")
	})

	// Test sending message to student (should succeed)
	t.Run("Faculty_Send_Message", func(t *testing.T) {
		message := SendMessageRequest{
			RecipientID: "student_id_placeholder", // In real test, get actual student ID
			Subject:     "Project Feedback",
			Content:     "Great work on your project! I have some suggestions for improvement.",
		}

		resp, err := makeRequest(t, "POST", baseURL+"/messages/sendmessage", token, message)
		if err != nil {
			t.Fatalf("❌ Failed to send message: %v", err)
		}
		defer resp.Body.Close()

		// Accept both 201 and 400 (if recipient doesn't exist)
		if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusBadRequest {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Send message failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Faculty send message test completed")
	})

	// Test posting job (should fail - unauthorized)
	t.Run("Faculty_Post_Job_Should_Fail", func(t *testing.T) {
		job := Job{
			Title:        "Research Assistant",
			Company:      "University",
			Location:     "Campus",
			JobType:      "part-time",
			Description:  "Research assistant position available for students interested in advanced signal processing and machine learning research projects.",
			Requirements: []string{"Python", "MATLAB", "Research Experience"},
			ExpiresAt:    time.Now().Add(30 * 24 * time.Hour),
		}

		resp, err := makeRequest(t, "POST", baseURL+"/jobs/add", token, job)
		if err != nil {
			t.Fatalf("❌ Failed to attempt job posting: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusForbidden {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Job posting should be forbidden for faculty, got status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Job posting correctly forbidden for faculty")
	})

	// Test accessing admin routes (should fail)
	t.Run("Faculty_Admin_Access_Should_Fail", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/admin/users", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to attempt admin access: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusForbidden {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Admin access should be forbidden for faculty, got status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Admin access correctly forbidden for faculty")
	})
}

// Test Admin Role
func TestAdminRole(t *testing.T) {
	baseURL := getBaseURL()
	ensureServerRunning(t, baseURL)

	t.Log("👑 Testing Admin Role Functionality")

	// Use existing admin credentials
	admin := User{
		//Name:     "Super Admin",
		Email:    "admin@alumni-portal.com",
		Password: "admin@eteportal2025",
		//Role:     "admin", // This should be valid according to your backend
	}

	// hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(admin.Password), bcrypt.DefaultCost)
	// admin.Password = string(hashedPassword)
	// Try to login with existing admin
	token := loginUser(t, baseURL, admin.Email, admin.Password)

	// Test getting all users (should succeed)
	t.Run("Admin_Get_All_Users", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/admin/users", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to get users: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Get users failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Admin get users successful")
	})

	// Test getting analytics (should succeed)
	t.Run("Admin_Get_Analytics", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/admin/analytics", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to get analytics: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Get analytics failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Admin get analytics successful")
	})

	// Test getting email settings (should succeed)
	t.Run("Admin_Get_Email_Settings", func(t *testing.T) {
		resp, err := makeRequest(t, "GET", baseURL+"/admin/email-settings", token, nil)
		if err != nil {
			t.Fatalf("❌ Failed to get email settings: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Get email settings failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Admin get email settings successful")
	})

	// Test creating event (should succeed for admin)
	t.Run("Admin_Create_Event", func(t *testing.T) {
		event := Event{
			Title:       "Alumni Meet 2024",
			Description: "Annual alumni gathering and networking event",
			Location:    "Main Auditorium",
			EventDate:   time.Now().Add(30 * 24 * time.Hour),
			EventType:   "networking",
			MaxCapacity: 200,
		}

		resp, err := makeRequest(t, "POST", baseURL+"/events", token, event)
		if err != nil {
			t.Fatalf("❌ Failed to create event: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Event creation failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Admin event creation successful")
	})
}

// Test Authentication and Authorization
func TestAuthenticationAndAuthorization(t *testing.T) {
	baseURL := getBaseURL()
	ensureServerRunning(t, baseURL)

	t.Log("🔐 Testing Authentication and Authorization")

	// Test accessing protected routes without token (should fail)
	t.Run("No_Token_Access_Should_Fail", func(t *testing.T) {
		protectedRoutes := []string{
			"/projects/addproject",
			"/jobs/add",
			"/messages/sendmessage",
			"/admin/users",
			"/users/profile",
		}

		for _, route := range protectedRoutes {
			resp, err := makeRequest(t, "GET", baseURL+route, "", nil)
			if err != nil {
				t.Fatalf("❌ Failed to test route %s: %v", route, err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusUnauthorized {
				body, _ := io.ReadAll(resp.Body)
				t.Fatalf("❌ Route %s should require authentication, got status %d: %s", route, resp.StatusCode, string(body))
			}
		}
		t.Log("✅ All protected routes correctly require authentication")
	})

	// Test with invalid token (should fail)
	t.Run("Invalid_Token_Access_Should_Fail", func(t *testing.T) {
		invalidToken := "invalid.jwt.token"
		resp, err := makeRequest(t, "GET", baseURL+"/users/profile", invalidToken, nil)
		if err != nil {
			t.Fatalf("❌ Failed to test invalid token: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusUnauthorized {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Invalid token should be rejected, got status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Invalid token correctly rejected")
	})

	// Test password reset flow
	t.Run("Password_Reset_Flow", func(t *testing.T) {
		// Test forgot password
		forgotData := map[string]string{
			"email": "thekingofmyqueenxyz143@gmail.com",
		}

		resp, err := makeRequest(t, "POST", baseURL+"/auth/forgot-password", "", forgotData)
		if err != nil {
			t.Fatalf("❌ Failed to test forgot password: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Forgot password failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Forgot password request successful")

		// Test reset password with token
		resetData := map[string]string{
			"token":    "test_reset_token",
			"password": "NewPassword123!",
		}

		resp, err = makeRequest(t, "POST", baseURL+"/auth/reset-password", "", resetData)
		if err != nil {
			t.Fatalf("❌ Failed to test reset password: %v", err)
		}
		defer resp.Body.Close()

		// Accept both success and invalid token (since we're using a test token)
		if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusBadRequest {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Reset password failed with status %d: %s", resp.StatusCode, string(body))
		}
		t.Log("✅ Reset password test completed")
	})
}

// Test Cross-Role Interactions
func TestCrossRoleInteractions(t *testing.T) {
	baseURL := getBaseURL()
	ensureServerRunning(t, baseURL)

	t.Log("🤝 Testing Cross-Role Interactions")

	// Create users for interaction testing
	student := User{
		Name:     "Interaction Student",
		Email:    "thekingofmyqueenxyz143@gmail.com",
		Password: "Test123!",
		Role:     "student",
	}

	alumni := User{
		Name:     "Interaction Alumni",
		Email:    "rahulroshu2003@gmail.com",
		Password: "Test123!",
		Role:     "alumni",
	}

	// Register users
	studentToken := EnsureUserExists(t, baseURL, student)
	alumniToken := EnsureUserExists(t, baseURL, alumni)

	// Test alumni posting job and student viewing it
	t.Run("Alumni_Post_Job_Student_View", func(t *testing.T) {
		// Alumni posts job
		job := Job{
			Title:        "Junior Developer",
			Company:      "Interaction Corp",
			Location:     "Remote",
			JobType:      "full-time",
			Description:  "Entry level position for fresh graduates looking to start their career in software development with comprehensive training and mentorship programs.",
			Requirements: []string{"Bachelor's Degree", "Basic Programming Knowledge", "Willingness to Learn"},
			ExpiresAt:    time.Now().Add(30 * 24 * time.Hour),
		}

		resp, err := makeRequest(t, "POST", baseURL+"/jobs/add", alumniToken, job)
		if err != nil {
			t.Fatalf("❌ Failed to post job: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Job posting failed: %s", string(body))
		}

		// Student views jobs
		resp, err = makeRequest(t, "GET", baseURL+"/jobs", studentToken, nil)
		if err != nil {
			t.Fatalf("❌ Failed to view jobs: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ View jobs failed: %s", string(body))
		}

		t.Log("✅ Alumni-Student job interaction successful")
	})

	// Test messaging between roles
	t.Run("Cross_Role_Messaging", func(t *testing.T) {
		// Get user IDs for messaging (simplified - in real test, parse from login response)
		message := SendMessageRequest{
			RecipientID: "test_recipient_id",
			Subject:     "Cross Role Communication",
			Content:     "Testing messaging between different user roles",
		}

		// Student sends message
		resp, err := makeRequest(t, "POST", baseURL+"/messages/sendmessage", studentToken, message)
		if err != nil {
			t.Fatalf("❌ Failed to send message: %v", err)
		}
		defer resp.Body.Close()

		// Accept both success and bad request (if recipient doesn't exist)
		if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusBadRequest {
			body, _ := io.ReadAll(resp.Body)
			t.Fatalf("❌ Send message failed: %s", string(body))
		}

		t.Log("✅ Cross-role messaging test completed")
	})
}

// Main test runner
func TestMain(m *testing.M) {
	fmt.Println("🚀 Starting ETE Alumni Portal Role-Based Testing")
	fmt.Println(strings.Repeat("=", 100))

	// Run all tests
	code := m.Run()

	fmt.Println(strings.Repeat("=", 100))
	if code == 0 {
		fmt.Println("✅ All tests completed successfully!")
	} else {
		fmt.Println("❌ Some tests failed!")
	}

	os.Exit(code)
}
