package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Gallery struct {
	ID          primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	Title       string              `json:"title" bson:"title" validate:"required,min=2,max=200"`
	Description string              `json:"description,omitempty" bson:"description,omitempty"`
	ImageURL    string              `json:"image_url" bson:"image_url" validate:"required,url"`
	Tags        []string            `json:"tags,omitempty" bson:"tags,omitempty"`
	EventID     *primitive.ObjectID `json:"event_id,omitempty" bson:"event_id,omitempty"`
	Event       *Event              `json:"event,omitempty" bson:"-"`
	UploadedBy  primitive.ObjectID  `json:"uploaded_by" bson:"uploaded_by"`
	Uploader    *UserResponse       `json:"uploader,omitempty" bson:"-"`
	IsActive    bool                `json:"is_active" bson:"is_active"`
	CreatedAt   time.Time           `json:"created_at" bson:"created_at"`
}

type CreateGalleryRequest struct {
	Title       string   `json:"title" validate:"required,min=2,max=200"`
	Description string   `json:"description,omitempty"`
	Tags        []string `json:"tags,omitempty"`
	EventID     string   `json:"event_id,omitempty"`
}
