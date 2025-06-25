package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NotificationType string

const (
	NotificationJobPosted        NotificationType = "job_posted"
	NotificationMessageReceived  NotificationType = "message_received"
	NotificationEventCreated     NotificationType = "event_created"
	NotificationProjectLiked     NotificationType = "project_liked"
	NotificationInterestReceived NotificationType = "interest_received"
)

type Notification struct {
	ID               primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	UserID           primitive.ObjectID  `json:"user_id" bson:"user_id"`
	Title            string              `json:"title" bson:"title" validate:"required,min=1,max=200"`
	Message          string              `json:"message" bson:"message" validate:"required,min=1,max=500"`
	NotificationType NotificationType    `json:"notification_type" bson:"notification_type"`
	RelatedID        *primitive.ObjectID `json:"related_id,omitempty" bson:"related_id,omitempty"`
	IsRead           bool                `json:"is_read" bson:"is_read"`
	CreatedAt        time.Time           `json:"created_at" bson:"created_at"`
	RelatedType      string              `bson:"related_type"`
}

type CreateNotificationRequest struct {
	UserID           primitive.ObjectID  `json:"user_id"`
	Title            string              `json:"title" validate:"required,min=1,max=200"`
	Message          string              `json:"message" validate:"required,min=1,max=500"`
	NotificationType NotificationType    `json:"notification_type"`
	RelatedID        *primitive.ObjectID `json:"related_id,omitempty"`
}
