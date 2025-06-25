package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Event struct {
	ID                primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title             string             `json:"title" bson:"title" validate:"required,min=5,max=200"`
	Description       string             `json:"description" bson:"description" validate:"required,min=20,max=2000"`
	EventDate         time.Time          `json:"event_date" bson:"event_date" validate:"required"`
	Location          string             `json:"location,omitempty" bson:"location,omitempty"`
	EventType         string             `json:"event_type,omitempty" bson:"event_type,omitempty"`
	MaxAttendees      int                `json:"max_attendees,omitempty" bson:"max_attendees,omitempty"`
	CurrentAttendees  int                `json:"current_attendees" bson:"current_attendees"`
	CreatedBy         primitive.ObjectID `json:"created_by" bson:"created_by"`
	CreatedByUser     *UserResponse      `json:"created_by_user,omitempty" bson:"-"`
	IsActive          bool               `json:"is_active" bson:"is_active"`
	CreatedAt         time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at" bson:"updated_at"`
}

type CreateEventRequest struct {
	Title        string    `json:"title" validate:"required,min=5,max=200"`
	Description  string    `json:"description" validate:"required,min=20,max=2000"`
	EventDate    time.Time `json:"event_date" validate:"required"`
	Location     string    `json:"location,omitempty"`
	EventType    string    `json:"event_type,omitempty"`
	MaxAttendees int       `json:"max_attendees,omitempty"`
}

type UpdateEventRequest struct {
	Title        string    `json:"title,omitempty" validate:"omitempty,min=5,max=200"`
	Description  string    `json:"description,omitempty" validate:"omitempty,min=20,max=2000"`
	EventDate    time.Time `json:"event_date,omitempty"`
	Location     string    `json:"location,omitempty"`
	EventType    string    `json:"event_type,omitempty"`
	MaxAttendees int       `json:"max_attendees,omitempty"`
}

type RSVPStatus string

const (
	RSVPAttending    RSVPStatus = "attending"
	RSVPNotAttending RSVPStatus = "not_attending"
	RSVPMaybe        RSVPStatus = "maybe"
)

type EventRSVP struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	EventID   primitive.ObjectID `json:"event_id" bson:"event_id"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	User      *UserResponse      `json:"user,omitempty" bson:"-"`
	Status    RSVPStatus         `json:"status" bson:"status" validate:"required,oneof=attending not_attending maybe"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}

type RSVPRequest struct {
	Status RSVPStatus `json:"status" validate:"required,oneof=attending not_attending maybe"`
}
