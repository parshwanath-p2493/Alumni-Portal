package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserRole string

const (
	RoleStudent UserRole = "student"
	RoleAlumni  UserRole = "alumni"
	RoleFaculty UserRole = "faculty"
	RoleAdmin   UserRole = "admin"
)

type User struct {
	ID             primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name           string             `json:"name" bson:"name" validate:"required,min=2,max=100"`
	Email          string             `json:"email" bson:"email" validate:"required,email"`
	PasswordHash   string             `json:"-" bson:"password_hash"`
	Role           UserRole           `json:"role" bson:"role" validate:"required,oneof=student alumni faculty admin"`
	StudentID      string             `json:"student_id,omitempty" bson:"student_id,omitempty"`
	GraduationYear int                `json:"graduation_year,omitempty" bson:"graduation_year,omitempty" validate:"omitempty,min=2000,max=2030"`
	CGPA           float64            `json:"cgpa,omitempty" bson:"cgpa,omitempty" validate:"omitempty,min=0,max=10"`
	Company        string             `json:"company,omitempty" bson:"company,omitempty"`
	Position       string             `json:"position,omitempty" bson:"position,omitempty"`
	Location       string             `json:"location,omitempty" bson:"location,omitempty"`
	Experience     string             `json:"experience,omitempty" bson:"experience,omitempty"`
	Skills         []string           `json:"skills,omitempty" bson:"skills,omitempty"`
	GitHubURL      string             `json:"github_url,omitempty" bson:"github_url,omitempty" validate:"omitempty,url"`
	LinkedInURL    string             `json:"linkedin_url,omitempty" bson:"linkedin_url,omitempty" validate:"omitempty,url"`
	AvatarURL      string             `json:"avatar_url,omitempty" bson:"avatar_url,omitempty"`
	IsVerified     bool               `json:"is_verified" bson:"is_verified"`
	IsActive       bool               `json:"is_active" bson:"is_active"`
	CreatedAt      time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt      time.Time          `json:"updated_at" bson:"updated_at"`
}

type RegisterRequest struct {
	Name           string   `json:"name" validate:"required,min=2,max=100"`
	Email          string   `json:"email" validate:"required,email"`
	Password       string   `json:"password" validate:"required,min=8"`
	Role           UserRole `json:"role" validate:"required,oneof=student alumni faculty"`
	StudentID      string   `json:"student_id,omitempty"`
	GraduationYear int      `json:"graduation_year,omitempty" validate:"omitempty,min=2000,max=2030"`
	Company        string   `json:"company,omitempty"`
	Position       string   `json:"position,omitempty"`
	Location       string   `json:"location,omitempty"`
	Experience     string   `json:"experience,omitempty"`
	Skills         []string `json:"skills,omitempty"`
	GitHubURL      string   `json:"github_url,omitempty" validate:"omitempty,url"`
	LinkedInURL    string   `json:"linkedin_url,omitempty" validate:"omitempty,url"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type OTPVerificationRequest struct {
	Email string `json:"email" validate:"required,email"`
	OTP   string `json:"otp" validate:"required,len=6"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
	Email    string `json:"email" validate:"required,email"`
	OTP      string `json:"otp" validate:"required,len=6"`
	Password string `json:"password" validate:"required,min=8"`
}

type UpdateProfileRequest struct {
	Name        string   `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Company     string   `json:"company,omitempty"`
	Position    string   `json:"position,omitempty"`
	Location    string   `json:"location,omitempty"`
	Experience  string   `json:"experience,omitempty"`
	Skills      []string `json:"skills,omitempty"`
	GitHubURL   string   `json:"github_url,omitempty" validate:"omitempty,url"`
	LinkedInURL string   `json:"linkedin_url,omitempty" validate:"omitempty,url"`
}

type UserResponse struct {
	ID             primitive.ObjectID `json:"id"`
	Name           string             `json:"name"`
	Email          string             `json:"email"`
	Role           UserRole           `json:"role"`
	StudentID      string             `json:"student_id,omitempty"`
	GraduationYear int                `json:"graduation_year,omitempty"`
	CGPA           float64            `json:"cgpa,omitempty"`
	Company        string             `json:"company,omitempty"`
	Position       string             `json:"position,omitempty"`
	Location       string             `json:"location,omitempty"`
	Experience     string             `json:"experience,omitempty"`
	Skills         []string           `json:"skills,omitempty"`
	GitHubURL      string             `json:"github_url,omitempty"`
	LinkedInURL    string             `json:"linkedin_url,omitempty"`
	AvatarURL      string             `json:"avatar_url,omitempty"`
	IsVerified     bool               `json:"is_verified"`
	CreatedAt      time.Time          `json:"created_at"`
}

func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:             u.ID,
		Name:           u.Name,
		Email:          u.Email,
		Role:           u.Role,
		StudentID:      u.StudentID,
		GraduationYear: u.GraduationYear,
		CGPA:           u.CGPA,
		Company:        u.Company,
		Position:       u.Position,
		Location:       u.Location,
		Experience:     u.Experience,
		Skills:         u.Skills,
		GitHubURL:      u.GitHubURL,
		LinkedInURL:    u.LinkedInURL,
		AvatarURL:      u.AvatarURL,
		IsVerified:     u.IsVerified,
		CreatedAt:      u.CreatedAt,
	}
}
