package main

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Name            string    `bson:"name"`
	Email           string    `bson:"email"`
	Password        string    `bson:"password"`
	Role            string    `bson:"role"`
	IsEmailVerified bool      `bson:"is_email_verified"`
	IsActive        bool      `bson:"is_active"`
	CreatedAt       time.Time `bson:"created_at"`
	UpdatedAt       time.Time `bson:"updated_at"`
}

func main() {
	// Connect to MongoDB
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		uri = "mongodb://localhost:27017"
	}

	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(context.TODO())

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "alumni_portal"
	}

	db := client.Database(dbName)
	userCollection := db.Collection("users")

	// Check if admin already exists
	var existingAdmin User
	err = userCollection.FindOne(context.TODO(), bson.M{"email": "admin@alumni-portal.com"}).Decode(&existingAdmin)
	if err == nil {
		log.Println("Admin user already exists!")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin@eteportal2025"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	// Create admin user
	admin := User{
		Name:            "Admin User",
		Email:           "admin@alumni-portal.com",
		Password:        string(hashedPassword),
		Role:            "admin",
		IsEmailVerified: true, // Pre-verified for testing
		IsActive:        true,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	_, err = userCollection.InsertOne(context.TODO(), admin)
	if err != nil {
		log.Fatal("Failed to create admin user:", err)
	}

	log.Println("✅ Admin user created successfully!")
	log.Println("Email: admin@alumni-portal.com")
	log.Println("Password: admin@eteportal2025")
}
