package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OTPPurpose string

const (
	OTPPurposeRegistration  OTPPurpose = "registration"
	OTPPurposePasswordReset OTPPurpose = "password_reset"
	OTPPurposeEmailChange   OTPPurpose = "email_change"
)

type OTPVerification struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Email     string             `json:"email" bson:"email"`
	OTPCode   string             `json:"otp_code" bson:"otp_code"`
	Purpose   OTPPurpose         `json:"purpose" bson:"purpose"`
	ExpiresAt time.Time          `json:"expires_at" bson:"expires_at"`
	IsUsed    bool               `json:"is_used" bson:"is_used"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}

type RefreshToken struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	TokenHash string             `json:"token_hash" bson:"token_hash"`
	ExpiresAt time.Time          `json:"expires_at" bson:"expires_at"`
	IsRevoked bool               `json:"is_revoked" bson:"is_revoked"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}

type RateLimit struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Identifier  string             `json:"identifier" bson:"identifier"`
	ActionType  string             `json:"action_type" bson:"action_type"`
	Attempts    int                `json:"attempts" bson:"attempts"`
	WindowStart time.Time          `json:"window_start" bson:"window_start"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
}
