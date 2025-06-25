package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
	ID              primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	SenderID        primitive.ObjectID  `json:"sender_id" bson:"sender_id"`
	RecipientID     primitive.ObjectID  `json:"recipient_id" bson:"recipient_id"`
	Sender          *UserResponse       `json:"sender,omitempty" bson:"-"`
	Recipient       *UserResponse       `json:"recipient,omitempty" bson:"-"`
	Subject         string              `json:"subject,omitempty" bson:"subject,omitempty"`
	Content         string              `json:"content" bson:"content" validate:"required,min=1,max=5000"`
	IsRead          bool                `json:"is_read" bson:"is_read"`
	ParentMessageID *primitive.ObjectID `json:"parent_message_id,omitempty" bson:"parent_message_id,omitempty"`
	CreatedAt       time.Time           `json:"created_at" bson:"created_at"`
}

type SendMessageRequest struct {
	RecipientID string `json:"recipient_id" validate:"required"`
	Subject     string `json:"subject,omitempty"`
	Content     string `json:"content" validate:"required,min=1,max=5000"`
}

type Conversation struct {
	ParticipantID   primitive.ObjectID `json:"participant_id"`
	Participant     *UserResponse      `json:"participant"`
	LastMessage     *Message           `json:"last_message"`
	UnreadCount     int                `json:"unread_count"`
	LastMessageTime time.Time          `json:"last_message_time"`
}
type UserPreferences struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty"`
	UserID             primitive.ObjectID `bson:"user_id"`
	EmailNotifications struct {
		Messages bool `bson:"messages"`
	} `bson:"email_notifications"`
}
