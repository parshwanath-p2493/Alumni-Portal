package handlers

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"ete-alumni-portal/config"
	"ete-alumni-portal/models"
	"ete-alumni-portal/utils"
)

type AuthHandler struct {
	emailService *utils.EmailService
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{
		emailService: utils.NewEmailService(),
	}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	// Validate password strength
	if !utils.IsStrongPassword(req.Password) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
		})
	}

	// Check if user already exists
	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var existingUser models.User
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error":   true,
			"message": "User with this email already exists",
		})
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to process password",
		})
	}

	// Create user
	user := models.User{
		ID:             primitive.NewObjectID(),
		Name:           utils.SanitizeString(req.Name),
		Email:          req.Email,
		PasswordHash:   hashedPassword,
		Role:           req.Role,
		StudentID:      req.StudentID,
		GraduationYear: req.GraduationYear,
		Company:        utils.SanitizeString(req.Company),
		Position:       utils.SanitizeString(req.Position),
		Location:       utils.SanitizeString(req.Location),
		Experience:     utils.SanitizeString(req.Experience),
		Skills:         req.Skills,
		GitHubURL:      req.GitHubURL,
		LinkedInURL:    req.LinkedInURL,
		IsVerified:     false,
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to create user",
		})
	}

	// Generate and send OTP
	otp, err := utils.GenerateOTP()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to generate OTP",
		})
	}

	// Store OTP
	otpCollection := config.GetCollection("otp_verifications")
	otpDoc := models.OTPVerification{
		ID:        primitive.NewObjectID(),
		Email:     req.Email,
		OTPCode:   otp,
		Purpose:   models.OTPPurposeRegistration,
		ExpiresAt: time.Now().Add(10 * time.Minute),
		IsUsed:    false,
		CreatedAt: time.Now(),
	}

	_, err = otpCollection.InsertOne(ctx, otpDoc)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to store OTP",
		})
	}

	// Send OTP email
	err = h.emailService.SendOTP(req.Email, otp, "registration")
	if err != nil {
		log.Println("them otp not sent ")
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error":   false,
		"message": "User registered successfully. Please verify your email with the OTP sent.",
		"data": fiber.Map{
			"user_id": user.ID,
			"email":   user.Email,
		},
	})
}

/*
*

	func (h *AuthHandler) VerifyOTP(c *fiber.Ctx) error {
		var req models.OTPVerificationRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Invalid request body",
			})
		}

		if err := utils.ValidateStruct(req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": err.Error(),
			})
		}

		// Find and validate OTP
		otpCollection := config.GetCollection("otp_verifications")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var otpDoc models.OTPVerification
		filter := bson.M{
			"email":      req.Email,
			"otp_code":   req.OTP,
			"is_used":    false,
			"expires_at": bson.M{"$gt": time.Now()},
		}

		err := otpCollection.FindOne(ctx, filter).Decode(&otpDoc)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Invalid or expired OTP",
			})
		}

		// Mark OTP as used
		_, err = otpCollection.UpdateOne(ctx, bson.M{"_id": otpDoc.ID}, bson.M{
			"$set": bson.M{"is_used": true},
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to update OTP status",
			})
		}

		// Verify user
		userCollection := config.GetCollection("users")
		var user models.User
		err = userCollection.FindOneAndUpdate(
			ctx,
			bson.M{"email": req.Email},
			bson.M{"$set": bson.M{"is_verified": true, "updated_at": time.Now()}},
		).Decode(&user)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to verify user",
			})
		}

		// Generate tokens
		accessToken, refreshToken, err := utils.GenerateTokens(&user)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to generate tokens",
			})
		}

		// Store refresh token
		tokenHash := sha256.Sum256([]byte(refreshToken))
		refreshTokenDoc := models.RefreshToken{
			ID:        primitive.NewObjectID(),
			UserID:    user.ID,
			TokenHash: hex.EncodeToString(tokenHash[:]),
			ExpiresAt: time.Now().Add(config.GetConfig().RefreshExpiration),
			IsRevoked: false,
			CreatedAt: time.Now(),
		}

		refreshCollection := config.GetCollection("refresh_tokens")
		_, err = refreshCollection.InsertOne(ctx, refreshTokenDoc)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to store refresh token",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "Email verified successfully",
			"data": fiber.Map{
				"user":          user.ToResponse(),
				"access_token":  accessToken,
				"refresh_token": refreshToken,
			},
		})
	}

*
*/
func (h *AuthHandler) VerifyOTP(c *fiber.Ctx) error {
	var req models.OTPVerificationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	cfg := config.GetConfig()
	userCollection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// ✅ TEST ENVIRONMENT: bypass real OTP check
	if os.Getenv("ENVIRONMENT") == "test" && req.OTP == "123456" {
		// Mark user as verified
		var user models.User
		err := userCollection.FindOneAndUpdate(
			ctx,
			bson.M{"email": req.Email},
			bson.M{"$set": bson.M{"is_verified": true, "updated_at": time.Now()}},
		).Decode(&user)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to mock verify user",
			})
		}

		// Generate tokens
		accessToken, refreshToken, err := utils.GenerateTokens(&user)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to generate tokens",
			})
		}

		// Store refresh token
		tokenHash := sha256.Sum256([]byte(refreshToken))
		refreshCollection := config.GetCollection("refresh_tokens")
		refreshTokenDoc := models.RefreshToken{
			ID:        primitive.NewObjectID(),
			UserID:    user.ID,
			TokenHash: hex.EncodeToString(tokenHash[:]),
			ExpiresAt: time.Now().Add(cfg.RefreshExpiration),
			IsRevoked: false,
			CreatedAt: time.Now(),
		}

		_, err = refreshCollection.InsertOne(ctx, refreshTokenDoc)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to store refresh token",
			})
		}

		return c.JSON(fiber.Map{
			"error":   false,
			"message": "✅ Test email verified successfully",
			"data": fiber.Map{
				"user":          user.ToResponse(),
				"access_token":  accessToken,
				"refresh_token": refreshToken,
			},
		})
	}

	// Normal OTP flow (non-test environment or real OTP)
	otpCollection := config.GetCollection("otp_verifications")

	var otpDoc models.OTPVerification
	filter := bson.M{
		"email":      req.Email,
		"otp_code":   req.OTP,
		"is_used":    false,
		"expires_at": bson.M{"$gt": time.Now()},
	}

	err := otpCollection.FindOne(ctx, filter).Decode(&otpDoc)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid or expired OTP",
		})
	}

	// Mark OTP as used
	_, err = otpCollection.UpdateOne(ctx, bson.M{"_id": otpDoc.ID}, bson.M{
		"$set": bson.M{"is_used": true},
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update OTP status",
		})
	}

	// Mark user as verified
	var user models.User
	err = userCollection.FindOneAndUpdate(
		ctx,
		bson.M{"email": req.Email},
		bson.M{"$set": bson.M{"is_verified": true, "updated_at": time.Now()}},
	).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to verify user",
		})
	}

	// Generate tokens
	accessToken, refreshToken, err := utils.GenerateTokens(&user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to generate tokens",
		})
	}

	// Store refresh token
	tokenHash := sha256.Sum256([]byte(refreshToken))
	refreshCollection := config.GetCollection("refresh_tokens")
	refreshTokenDoc := models.RefreshToken{
		ID:        primitive.NewObjectID(),
		UserID:    user.ID,
		TokenHash: hex.EncodeToString(tokenHash[:]),
		ExpiresAt: time.Now().Add(cfg.RefreshExpiration),
		IsRevoked: false,
		CreatedAt: time.Now(),
	}

	_, err = refreshCollection.InsertOne(ctx, refreshTokenDoc)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to store refresh token",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Email verified successfully",
		"data": fiber.Map{
			"user":          user.ToResponse(),
			"access_token":  accessToken,
			"refresh_token": refreshToken,
		},
	})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	// Find user
	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := collection.FindOne(ctx, bson.M{
		"email": req.Email,
		//"is_verified": true,
		//"is_active":   true,
	}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid credentials",
		})
	}

	// Check password
	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid credentials",
		})
	}

	// Generate tokens
	accessToken, refreshToken, err := utils.GenerateTokens(&user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to generate tokens",
		})
	}

	// Store refresh token
	tokenHash := sha256.Sum256([]byte(refreshToken))
	refreshTokenDoc := models.RefreshToken{
		ID:        primitive.NewObjectID(),
		UserID:    user.ID,
		TokenHash: hex.EncodeToString(tokenHash[:]),
		ExpiresAt: time.Now().Add(config.GetConfig().RefreshExpiration),
		IsRevoked: false,
		CreatedAt: time.Now(),
	}

	refreshCollection := config.GetCollection("refresh_tokens")
	_, err = refreshCollection.InsertOne(ctx, refreshTokenDoc)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to store refresh token",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Login successful",
		"data": fiber.Map{
			"user":          user.ToResponse(),
			"access_token":  accessToken,
			"refresh_token": refreshToken,
		},
	})
}

func (h *AuthHandler) ForgotPassword(c *fiber.Ctx) error {
	var req models.ForgotPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	// Check if user exists
	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := collection.FindOne(ctx, bson.M{
		"email":       req.Email,
		"is_verified": true,
		"is_active":   true,
	}).Decode(&user)
	if err != nil {
		// Don't reveal if email exists or not
		return c.JSON(fiber.Map{
			"error":   false,
			"message": "If the email exists, a password reset OTP has been sent.",
		})
	}

	// Generate and send OTP
	otp, err := utils.GenerateOTP()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to generate OTP",
		})
	}

	// Store OTP
	otpCollection := config.GetCollection("otp_verifications")
	otpDoc := models.OTPVerification{
		ID:        primitive.NewObjectID(),
		Email:     req.Email,
		OTPCode:   otp,
		Purpose:   models.OTPPurposePasswordReset,
		ExpiresAt: time.Now().Add(10 * time.Minute),
		IsUsed:    false,
		CreatedAt: time.Now(),
	}

	_, err = otpCollection.InsertOne(ctx, otpDoc)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to store OTP",
		})
	}

	// Send OTP email
	err = h.emailService.SendOTP(req.Email, otp, "password_reset")
	if err != nil {
		// Log error but don't fail the request
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "If the email exists, a password reset OTP has been sent.",
	})
}

func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	var req models.ResetPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	// Validate password strength
	if !utils.IsStrongPassword(req.Password) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
		})
	}

	// Find and validate OTP
	otpCollection := config.GetCollection("otp_verifications")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var otpDoc models.OTPVerification
	filter := bson.M{
		"email":      req.Email,
		"otp_code":   req.OTP,
		"purpose":    models.OTPPurposePasswordReset,
		"is_used":    false,
		"expires_at": bson.M{"$gt": time.Now()},
	}

	err := otpCollection.FindOne(ctx, filter).Decode(&otpDoc)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid or expired OTP",
		})
	}

	// Mark OTP as used
	_, err = otpCollection.UpdateOne(ctx, bson.M{"_id": otpDoc.ID}, bson.M{
		"$set": bson.M{"is_used": true},
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update OTP status",
		})
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to process password",
		})
	}

	// Update user password
	userCollection := config.GetCollection("users")
	_, err = userCollection.UpdateOne(
		ctx,
		bson.M{"email": req.Email},
		bson.M{"$set": bson.M{
			"password_hash": hashedPassword,
			"updated_at":    time.Now(),
		}},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update password",
		})
	}

	// Revoke all existing refresh tokens for this user
	refreshCollection := config.GetCollection("refresh_tokens")
	var user models.User
	userCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)

	_, err = refreshCollection.UpdateMany(
		ctx,
		bson.M{"user_id": user.ID},
		bson.M{"$set": bson.M{"is_revoked": true}},
	)
	if err != nil {
		// Log error but don't fail the request
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Password reset successfully",
	})
}

func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	type RefreshRequest struct {
		RefreshToken string `json:"refresh_token" validate:"required"`
	}

	var req RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	// Validate refresh token
	claims, err := utils.ValidateToken(req.RefreshToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid refresh token",
		})
	}

	// Check if refresh token exists and is not revoked
	refreshCollection := config.GetCollection("refresh_tokens")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	tokenHash := sha256.Sum256([]byte(req.RefreshToken))
	var refreshToken models.RefreshToken
	err = refreshCollection.FindOne(ctx, bson.M{
		"user_id":    claims.UserID,
		"token_hash": hex.EncodeToString(tokenHash[:]),
		"is_revoked": false,
		"expires_at": bson.M{"$gt": time.Now()},
	}).Decode(&refreshToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid refresh token",
		})
	}

	// Get user
	userCollection := config.GetCollection("users")
	var user models.User
	err = userCollection.FindOne(ctx, bson.M{
		"_id":         claims.UserID,
		"is_verified": true,
		"is_active":   true,
	}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   true,
			"message": "User not found or inactive",
		})
	}

	// Generate new tokens
	newAccessToken, newRefreshToken, err := utils.GenerateTokens(&user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to generate tokens",
		})
	}

	// Revoke old refresh token
	_, err = refreshCollection.UpdateOne(
		ctx,
		bson.M{"_id": refreshToken.ID},
		bson.M{"$set": bson.M{"is_revoked": true}},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to revoke old token",
		})
	}

	// Store new refresh token
	newTokenHash := sha256.Sum256([]byte(newRefreshToken))
	newRefreshTokenDoc := models.RefreshToken{
		ID:        primitive.NewObjectID(),
		UserID:    user.ID,
		TokenHash: hex.EncodeToString(newTokenHash[:]),
		ExpiresAt: time.Now().Add(config.GetConfig().RefreshExpiration),
		IsRevoked: false,
		CreatedAt: time.Now(),
	}

	_, err = refreshCollection.InsertOne(ctx, newRefreshTokenDoc)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to store new refresh token",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Tokens refreshed successfully",
		"data": fiber.Map{
			"access_token":  newAccessToken,
			"refresh_token": newRefreshToken,
		},
	})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	type LogoutRequest struct {
		RefreshToken string `json:"refresh_token" validate:"required"`
	}

	var req LogoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	// Revoke refresh token
	refreshCollection := config.GetCollection("refresh_tokens")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	tokenHash := sha256.Sum256([]byte(req.RefreshToken))
	_, err := refreshCollection.UpdateOne(
		ctx,
		bson.M{"token_hash": hex.EncodeToString(tokenHash[:])},
		bson.M{"$set": bson.M{"is_revoked": true}},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to logout",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Logged out successfully",
	})
}
