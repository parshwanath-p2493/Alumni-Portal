package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type EmailNotificationType string

const (
	EmailTypeJobPosted        EmailNotificationType = "job_posted"
	EmailTypeEventCreated     EmailNotificationType = "event_created"
	EmailTypeMessageReceived  EmailNotificationType = "message_received"
	EmailTypeProjectLiked     EmailNotificationType = "project_liked"
	EmailTypeJobInterest      EmailNotificationType = "job_interest"
	EmailTypeEventRSVP        EmailNotificationType = "event_rsvp"
	EmailTypeWelcome          EmailNotificationType = "welcome"
	EmailTypePasswordReset    EmailNotificationType = "password_reset"
	EmailTypeAccountVerified  EmailNotificationType = "account_verified"
	EmailTypeWeeklyDigest     EmailNotificationType = "weekly_digest"
	EmailTypeMonthlyNewsletter EmailNotificationType = "monthly_newsletter"
)

type EmailTemplate struct {
	ID          primitive.ObjectID    `json:"id" bson:"_id,omitempty"`
	Type        EmailNotificationType `json:"type" bson:"type"`
	Name        string                `json:"name" bson:"name"`
	Subject     string                `json:"subject" bson:"subject"`
	Body        string                `json:"body" bson:"body"`
	Variables   []string              `json:"variables" bson:"variables"`
	IsActive    bool                  `json:"is_active" bson:"is_active"`
	IsDefault   bool                  `json:"is_default" bson:"is_default"`
	CreatedBy   primitive.ObjectID    `json:"created_by" bson:"created_by"`
	CreatedAt   time.Time             `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time             `json:"updated_at" bson:"updated_at"`
}

type EmailSettings struct {
	ID                    primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	SMTPHost              string             `json:"smtp_host" bson:"smtp_host"`
	SMTPPort              int                `json:"smtp_port" bson:"smtp_port"`
	SMTPUsername          string             `json:"smtp_username" bson:"smtp_username"`
	SMTPPassword          string             `json:"smtp_password,omitempty" bson:"smtp_password"`
	FromEmail             string             `json:"from_email" bson:"from_email"`
	FromName              string             `json:"from_name" bson:"from_name"`
	ReplyToEmail          string             `json:"reply_to_email" bson:"reply_to_email"`
	IsEnabled             bool               `json:"is_enabled" bson:"is_enabled"`
	DailyLimit            int                `json:"daily_limit" bson:"daily_limit"`
	HourlyLimit           int                `json:"hourly_limit" bson:"hourly_limit"`
	RetryAttempts         int                `json:"retry_attempts" bson:"retry_attempts"`
	RetryDelay            int                `json:"retry_delay" bson:"retry_delay"`
	EnableBulkEmails      bool               `json:"enable_bulk_emails" bson:"enable_bulk_emails"`
	EnableDigestEmails    bool               `json:"enable_digest_emails" bson:"enable_digest_emails"`
	DigestFrequency       string             `json:"digest_frequency" bson:"digest_frequency"` // daily, weekly, monthly
	EnableNotifications   map[EmailNotificationType]bool `json:"enable_notifications" bson:"enable_notifications"`
	UpdatedBy             primitive.ObjectID `json:"updated_by" bson:"updated_by"`
	UpdatedAt             time.Time          `json:"updated_at" bson:"updated_at"`
}

type UserEmailPreferences struct {
	ID                    primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID                primitive.ObjectID `json:"user_id" bson:"user_id"`
	EnableAllEmails       bool               `json:"enable_all_emails" bson:"enable_all_emails"`
	EnableNotifications   map[EmailNotificationType]bool `json:"enable_notifications" bson:"enable_notifications"`
	DigestFrequency       string             `json:"digest_frequency" bson:"digest_frequency"`
	UnsubscribeToken      string             `json:"unsubscribe_token" bson:"unsubscribe_token"`
	CreatedAt             time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt             time.Time          `json:"updated_at" bson:"updated_at"`
}

type EmailLog struct {
	ID            primitive.ObjectID    `json:"id" bson:"_id,omitempty"`
	Type          EmailNotificationType `json:"type" bson:"type"`
	ToEmail       string                `json:"to_email" bson:"to_email"`
	Subject       string                `json:"subject" bson:"subject"`
	Status        string                `json:"status" bson:"status"` // sent, failed, pending
	ErrorMessage  string                `json:"error_message,omitempty" bson:"error_message,omitempty"`
	RetryCount    int                   `json:"retry_count" bson:"retry_count"`
	SentAt        *time.Time            `json:"sent_at,omitempty" bson:"sent_at,omitempty"`
	CreatedAt     time.Time             `json:"created_at" bson:"created_at"`
}

type CreateEmailTemplateRequest struct {
	Type      EmailNotificationType `json:"type" validate:"required"`
	Name      string                `json:"name" validate:"required,min=3,max=100"`
	Subject   string                `json:"subject" validate:"required,min=5,max=200"`
	Body      string                `json:"body" validate:"required,min=10"`
	Variables []string              `json:"variables"`
	IsActive  bool                  `json:"is_active"`
}

type UpdateEmailSettingsRequest struct {
	SMTPHost              string                             `json:"smtp_host,omitempty"`
	SMTPPort              int                                `json:"smtp_port,omitempty"`
	SMTPUsername          string                             `json:"smtp_username,omitempty"`
	SMTPPassword          string                             `json:"smtp_password,omitempty"`
	FromEmail             string                             `json:"from_email,omitempty"`
	FromName              string                             `json:"from_name,omitempty"`
	ReplyToEmail          string                             `json:"reply_to_email,omitempty"`
	IsEnabled             *bool                              `json:"is_enabled,omitempty"`
	DailyLimit            int                                `json:"daily_limit,omitempty"`
	HourlyLimit           int                                `json:"hourly_limit,omitempty"`
	RetryAttempts         int                                `json:"retry_attempts,omitempty"`
	RetryDelay            int                                `json:"retry_delay,omitempty"`
	EnableBulkEmails      *bool                              `json:"enable_bulk_emails,omitempty"`
	EnableDigestEmails    *bool                              `json:"enable_digest_emails,omitempty"`
	DigestFrequency       string                             `json:"digest_frequency,omitempty"`
	EnableNotifications   map[EmailNotificationType]bool    `json:"enable_notifications,omitempty"`
}

type EmailStatsResponse struct {
	TotalSent       int64                            `json:"total_sent"`
	TotalFailed     int64                            `json:"total_failed"`
	TotalPending    int64                            `json:"total_pending"`
	SentToday       int64                            `json:"sent_today"`
	SentThisWeek    int64                            `json:"sent_this_week"`
	SentThisMonth   int64                            `json:"sent_this_month"`
	ByType          map[EmailNotificationType]int64  `json:"by_type"`
	RecentActivity  []EmailLog                       `json:"recent_activity"`
}
