package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type JobType string

const (
	JobTypeFullTime   JobType = "full-time"
	JobTypePartTime   JobType = "part-time"
	JobTypeInternship JobType = "internship"
	JobTypeContract   JobType = "contract"
)

type Job struct {
	ID                 primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title              string             `json:"title" bson:"title" validate:"required,min=5,max=200"`
	Company            string             `json:"company" bson:"company" validate:"required,min=2,max=100"`
	Location           string             `json:"location" bson:"location" validate:"required,min=2,max=100"`
	JobType            JobType            `json:"job_type" bson:"job_type" validate:"required,oneof=full-time part-time internship contract"`
	ExperienceRequired string             `json:"experience_required,omitempty" bson:"experience_required,omitempty"`
	SalaryRange        string             `json:"salary_range,omitempty" bson:"salary_range,omitempty"`
	Description        string             `json:"description" bson:"description" validate:"required,min=50,max=3000"`
	Requirements       []string           `json:"requirements" bson:"requirements" validate:"required,min=1"`
	PostedBy           primitive.ObjectID `json:"posted_by" bson:"posted_by"`
	PostedByUser       *UserResponse      `json:"posted_by_user,omitempty" bson:"-"`
	ApplicantsCount    int                `json:"applicants_count" bson:"applicants_count"`
	IsActive           bool               `json:"is_active" bson:"is_active"`
	ExpiresAt          *time.Time         `json:"expires_at,omitempty" bson:"expires_at,omitempty"`
	CreatedAt          time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt          time.Time          `json:"updated_at" bson:"updated_at"`
}

type CreateJobRequest struct {
	Title              string    `json:"title" validate:"required,min=5,max=200"`
	Company            string    `json:"company" validate:"required,min=2,max=100"`
	Location           string    `json:"location" validate:"required,min=2,max=100"`
	JobType            JobType   `json:"job_type" validate:"required,oneof=full-time part-time internship contract"`
	ExperienceRequired string    `json:"experience_required,omitempty"`
	SalaryRange        string    `json:"salary_range,omitempty"`
	Description        string    `json:"description" validate:"required,min=50,max=3000"`
	Requirements       []string  `json:"requirements" validate:"required,min=1"`
	ExpiresAt          time.Time `json:"expires_at,omitempty"`
}

type UpdateJobRequest struct {
	Title              string    `json:"title,omitempty" validate:"omitempty,min=5,max=200"`
	Company            string    `json:"company,omitempty" validate:"omitempty,min=2,max=100"`
	Location           string    `json:"location,omitempty" validate:"omitempty,min=2,max=100"`
	JobType            JobType   `json:"job_type,omitempty" validate:"omitempty,oneof=full-time part-time internship contract"`
	ExperienceRequired string    `json:"experience_required,omitempty"`
	SalaryRange        string    `json:"salary_range,omitempty"`
	Description        string    `json:"description,omitempty" validate:"omitempty,min=50,max=3000"`
	Requirements       []string  `json:"requirements,omitempty" validate:"omitempty,min=1"`
	ExpiresAt          time.Time `json:"expires_at,omitempty"`
}

type JobInterest struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	JobID     primitive.ObjectID `json:"job_id" bson:"job_id"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	User      *UserResponse      `json:"user,omitempty" bson:"-"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}
