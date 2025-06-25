package tests

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"golang.org/x/term"
)

var baseURL = "http://localhost:8080"

// getOTP prompts for manual OTP input from terminal with 60 seconds timeout.
func getOTP(email string) string {
	fmt.Printf("\nCheck your email (%s) for the OTP.\n", email)

	if !term.IsTerminal(int(os.Stdin.Fd())) {
		fmt.Println("Non-interactive environment detected, please run interactively for OTP input.")
		return ""
	}

	fmt.Print("Enter the OTP you received via email (you have 60 seconds): ")
	reader := bufio.NewReader(os.Stdin)
	otpCh := make(chan string, 1)

	go func() {
		otp, _ := reader.ReadString('\n')
		otpCh <- strings.TrimSpace(otp)
	}()

	select {
	case entered := <-otpCh:
		if entered == "" {
			fmt.Println("No OTP entered. Please rerun test and enter the OTP.")
			return ""
		}
		return entered
	case <-time.After(60 * time.Second):
		fmt.Println("\nTimeout waiting for OTP input. Please rerun test and enter OTP in time.")
		return ""
	}
}

func TestAutoRegistrationAndDashboard(t *testing.T) {
	emails := []string{
		"thekingofmyqueenxyz143@gmail.com", // Student
		"1da21et030.et@drait.edu.in",       // Alumni
	}
	roles := []string{"student", "alumni"}

	for i, email := range emails {
		fmt.Printf("\n--- Testing registration for %s (%s) ---\n", email, roles[i])

		// 1. Register
		regPayload := map[string]interface{}{
			"name":           "Test User",
			"email":          email,
			"password":       "TestPassword123!",
			"role":           roles[i],
			"studentId":      fmt.Sprintf("ID%d", time.Now().UnixNano()%100000),
			"graduationYear": 2024,
		}
		regBody, _ := json.Marshal(regPayload)
		resp, err := http.Post(baseURL+"/auth/register", "application/json", bytes.NewReader(regBody))
		if err != nil {
			t.Fatalf("Registration failed: %v", err)
		}
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("Registration response: %s\n", string(body))

		// 2. Interactive OTP input (wait up to 60 seconds)
		otp := getOTP(email)
		if otp == "" {
			t.Fatalf("OTP input failed or timed out. Cannot continue test for %s", email)
		}

		// 3. Verify OTP
		otpPayload := map[string]interface{}{
			"email": email,
			"otp":   otp,
		}
		otpBody, _ := json.Marshal(otpPayload)
		resp, err = http.Post(baseURL+"/auth/verify-otp", "application/json", bytes.NewReader(otpBody))
		if err != nil {
			t.Fatalf("OTP verification failed: %v", err)
		}
		defer resp.Body.Close()
		body, _ = io.ReadAll(resp.Body)
		fmt.Printf("OTP verification response: %s\n", string(body))

		var otpResp map[string]interface{}
		if err := json.Unmarshal(body, &otpResp); err != nil {
			t.Fatalf("Failed to parse OTP verification response: %v", err)
		}
		if errVal, ok := otpResp["error"].(bool); ok && errVal == true {
			t.Fatalf("OTP verification error: %v", otpResp["message"])
		}

		// 4. Login (only if OTP verified)
		loginPayload := map[string]interface{}{
			"email":    email,
			"password": "TestPassword123!",
		}
		loginBody, _ := json.Marshal(loginPayload)
		resp, err = http.Post(baseURL+"/auth/login", "application/json", bytes.NewReader(loginBody))
		if err != nil {
			t.Fatalf("Login failed: %v", err)
		}
		defer resp.Body.Close()
		body, _ = io.ReadAll(resp.Body)
		fmt.Printf("Login response: %s\n", string(body))

		var loginResp map[string]interface{}
		if err := json.Unmarshal(body, &loginResp); err != nil {
			t.Fatalf("Failed to parse login response: %v", err)
		}

		token := ""
		if data, ok := loginResp["data"].(map[string]interface{}); ok {
			if tkn, ok := data["access_token"].(string); ok {
				token = tkn
			}
		}
		if token == "" {
			t.Fatalf("No token received after login for %s", email)
		}

		client := &http.Client{}
		get(client, "/users/profile", token, t)
		get(client, "/users/dashboard-stats", token, t)
		get(client, "/users", token, t)

		if roles[i] == "student" {
			projectPayload := map[string]interface{}{
				"title":        "Student Project",
				"description":  "Description of student project",
				"type":         "Major",
				"technologies": []string{"Go", "React", "MongoDB"},
			}
			post(client, "/projects", projectPayload, token, t)
		}

		if roles[i] == "alumni" {
			jobPayload := map[string]interface{}{
				"title":       "Hiring Go Dev",
				"company":     "Mock Corp",
				"description": "Full-time remote dev job",
				"type":        "Full-time",
				"location":    "Remote",
				"experience":  "0-1 years",
			}
			post(client, "/jobs", jobPayload, token, t)
		}

		if roles[i] == "student" {
			msgPayload := map[string]interface{}{
				"receiverEmail": "1da21et030.et@drait.edu.in",
				"content":       "Hello alumni! I'm a student from ETE.",
			}
			post(client, "/messages", msgPayload, token, t)
		}

		get(client, "/notifications", token, t)
		time.Sleep(1 * time.Second)
	}
}

func post(client *http.Client, route string, payload map[string]interface{}, token string, t *testing.T) {
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", baseURL+route, bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("POST %s failed: %v", route, err)
	}
	defer resp.Body.Close()
	resBody, _ := io.ReadAll(resp.Body)
	fmt.Printf("POST %s response: %s\n", route, resBody)
}

func get(client *http.Client, route string, token string, t *testing.T) {
	req, _ := http.NewRequest("GET", baseURL+route, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("GET %s failed: %v", route, err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("GET %s response: %s\n", route, body)
}
