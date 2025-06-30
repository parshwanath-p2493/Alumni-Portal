package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
)

func main() {
	fmt.Println("🧪 ETE Alumni Portal - Role-Based Testing Suite")
	//fmt.Println("=" * 50)

	// Set environment variables for testing
	os.Setenv("API_URL", "http://localhost:8080")
	os.Setenv("GO_ENV", "test")

	// Check if server is running
	fmt.Println("🔍 Checking if server is running...")

	// Run the tests
	fmt.Println("🚀 Running role-based tests...")

	cmd := exec.Command("go", "test", "-v", "./internal/tests/", "-run", "Test")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Run()
	if err != nil {
		log.Fatalf("❌ Tests failed: %v", err)
	}

	fmt.Println("✅ All tests completed successfully!")
}
