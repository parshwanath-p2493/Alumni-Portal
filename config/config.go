package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	JWTSecret         string
	JWTExpiration     time.Duration
	RefreshExpiration time.Duration
	SMTPHost          string
	SMTPPort          int
	SMTPUsername      string
	SMTPPassword      string
	SMTPFrom          string
	RateLimitLogin    int
	RateLimitRegister int
	RateLimitRefresh  int
	RateLimitWindow   time.Duration
	MaxFileSize       int64
	AllowedImageTypes []string
	FrontendURL       string
	Environment       string
}

func GetConfig() *Config {
	jwtExpiration, _ := time.ParseDuration(getEnv("JWT_EXPIRATION", "24h"))
	refreshExpiration, _ := time.ParseDuration(getEnv("REFRESH_EXPIRATION", "168h"))
	rateLimitWindow, _ := time.ParseDuration(getEnv("RATE_LIMIT_WINDOW", "1m"))

	smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "587"))
	rateLimitLogin, _ := strconv.Atoi(getEnv("RATE_LIMIT_LOGIN", "5"))
	rateLimitRegister, _ := strconv.Atoi(getEnv("RATE_LIMIT_REGISTER", "3"))
	rateLimitRefresh, _ := strconv.Atoi(getEnv("RATE_LIMIT_REFRESH", "10"))
	maxFileSize, _ := strconv.ParseInt(getEnv("MAX_FILE_SIZE", "5242880"), 10, 64) // 5MB

	return &Config{
		JWTSecret:         getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpiration:     jwtExpiration,
		RefreshExpiration: refreshExpiration,
		SMTPHost:          getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:          smtpPort,
		SMTPUsername:      getEnv("SMTP_USERNAME", ""),
		SMTPPassword:      getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:          getEnv("SMTP_FROM", "noreply@almaniportal.com"),
		RateLimitLogin:    rateLimitLogin,
		RateLimitRegister: rateLimitRegister,
		RateLimitRefresh:  rateLimitRefresh,
		RateLimitWindow:   rateLimitWindow,
		MaxFileSize:       maxFileSize,
		AllowedImageTypes: []string{"image/jpeg", "image/png", "image/gif", "image/webp"},
		FrontendURL:       getEnv("FRONTEND_URL", "http://localhost:3000"),
		Environment:       getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
