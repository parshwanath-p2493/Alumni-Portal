package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProjectType string

const (
	ProjectTypeMini  ProjectType = "mini"
	ProjectTypeMajor ProjectType = "major"
)

type Project struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title        string             `json:"title" bson:"title" validate:"required,min=5,max=200"`
	Description  string             `json:"description" bson:"description" validate:"required,min=20,max=2000"`
	ProjectType  ProjectType        `json:"project_type" bson:"project_type" validate:"required,oneof=mini major"`
	Technologies []string           `json:"technologies" bson:"technologies" validate:"required,min=1"`
	GitHubURL    string             `json:"github_url,omitempty" bson:"github_url,omitempty" validate:"omitempty,url"`
	DemoURL      string             `json:"demo_url,omitempty" bson:"demo_url,omitempty" validate:"omitempty,url"`
	AuthorID     primitive.ObjectID `json:"author_id" bson:"author_id"`
	Author       *UserResponse      `json:"author,omitempty" bson:"-"`
	LikesCount   int                `json:"likes_count" bson:"likes_count"`
	ViewsCount   int                `json:"views_count" bson:"views_count"`
	IsActive     bool               `json:"is_active" bson:"is_active"`
	CreatedAt    time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time          `json:"updated_at" bson:"updated_at"`
}

type CreateProjectRequest struct {
	Title        string      `json:"title" validate:"required,min=5,max=200"`
	Description  string      `json:"description" validate:"required,min=20,max=2000"`
	ProjectType  ProjectType `json:"project_type" validate:"required,oneof=mini major"`
	Technologies []string    `json:"technologies" validate:"required,min=1"`
	GitHubURL    string      `json:"github_url,omitempty" validate:"omitempty,url"`
	DemoURL      string      `json:"demo_url,omitempty" validate:"omitempty,url"`
}

type UpdateProjectRequest struct {
	Title        string      `json:"title,omitempty" validate:"omitempty,min=5,max=200"`
	Description  string      `json:"description,omitempty" validate:"omitempty,min=20,max=2000"`
	ProjectType  ProjectType `json:"project_type,omitempty" validate:"omitempty,oneof=mini major"`
	Technologies []string    `json:"technologies,omitempty" validate:"omitempty,min=1"`
	GitHubURL    string      `json:"github_url,omitempty" validate:"omitempty,url"`
	DemoURL      string      `json:"demo_url,omitempty" validate:"omitempty,url"`
}

type ProjectLike struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	ProjectID primitive.ObjectID `json:"project_id" bson:"project_id"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}
