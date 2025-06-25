package handlers

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"ete-alumni-portal/config"
	"ete-alumni-portal/middleware"
	"ete-alumni-portal/models"
	"ete-alumni-portal/utils"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

func (h *UploadHandler) UploadAvatar(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	file, err := c.FormFile("avatar")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "No file uploaded",
		})
	}

	// Validate file
	if err := h.validateImageFile(file); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s_%d%s", userID.Hex(), time.Now().Unix(), ext)
	filepath := fmt.Sprintf("./public/avatars/%s", filename)

	// Save file
	if err := c.SaveFile(file, filepath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to save file",
		})
	}

	// Update user avatar in database
	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	avatarURL := fmt.Sprintf("/avatars/%s", filename)
	_, err = collection.UpdateOne(ctx,
		bson.M{"_id": userID},
		bson.M{"$set": bson.M{"avatar_url": avatarURL}},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update user avatar",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Avatar uploaded successfully",
		"data": fiber.Map{
			"avatar_url": avatarURL,
		},
	})
}

func (h *UploadHandler) UploadGalleryImage(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "No file uploaded",
		})
	}

	// Validate file
	if err := h.validateImageFile(file); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	// Get form data
	title := c.FormValue("title")
	description := c.FormValue("description")
	tags := c.FormValue("tags")
	eventID := c.FormValue("event_id")

	if title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Title is required",
		})
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("gallery_%d%s", time.Now().Unix(), ext)
	filepath := fmt.Sprintf("./public/gallery/%s", filename)

	// Save file
	if err := c.SaveFile(file, filepath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to save file",
		})
	}

	// Create gallery item
	galleryItem := models.Gallery{
		ID:          primitive.NewObjectID(),
		Title:       utils.SanitizeString(title),
		Description: utils.SanitizeString(description),
		ImageURL:    fmt.Sprintf("/gallery/%s", filename),
		UploadedBy:  userID,
		IsActive:    true,
		CreatedAt:   time.Now(),
	}

	if tags != "" {
		galleryItem.Tags = strings.Split(tags, ",")
		for i := range galleryItem.Tags {
			galleryItem.Tags[i] = strings.TrimSpace(galleryItem.Tags[i])
		}
	}

	if eventID != "" {
		if objID, err := primitive.ObjectIDFromHex(eventID); err == nil {
			galleryItem.EventID = &objID
		}
	}

	collection := config.GetCollection("gallery")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, galleryItem)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to save gallery item",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error":   false,
		"message": "Gallery image uploaded successfully",
		"data":    galleryItem,
	})
}

func (h *UploadHandler) validateImageFile(file *multipart.FileHeader) error {
	// Check file size (max 5MB)
	if file.Size > 5*1024*1024 {
		return fmt.Errorf("file size too large (max 5MB)")
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif"}

	isValidExt := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			isValidExt = true
			break
		}
	}

	if !isValidExt {
		return fmt.Errorf("invalid file type (allowed: jpg, jpeg, png, gif)")
	}

	// Check MIME type
	src, err := file.Open()
	if err != nil {
		return fmt.Errorf("failed to open file")
	}
	defer src.Close()

	buffer := make([]byte, 512)
	_, err = src.Read(buffer)
	if err != nil && err != io.EOF {
		return fmt.Errorf("failed to read file")
	}

	contentType := http.DetectContentType(buffer)
	allowedTypes := []string{"image/jpeg", "image/png", "image/gif"}

	isValidType := false
	for _, allowedType := range allowedTypes {
		if contentType == allowedType {
			isValidType = true
			break
		}
	}

	if !isValidType {
		return fmt.Errorf("invalid file type detected")
	}

	return nil
}

// Ensure upload directories exist
func init() {
	dirs := []string{"./public/avatars", "./public/gallery", "./public/banners"}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("Failed to create directory %s: %v", dir, err)
		}
	}
}
