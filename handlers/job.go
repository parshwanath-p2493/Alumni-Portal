package handlers

import (
	"context"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"ete-alumni-portal/config"
	"ete-alumni-portal/middleware"
	"ete-alumni-portal/models"
	"ete-alumni-portal/utils"
)

type JobHandler struct {
	emailService *utils.EmailService
}

func NewJobHandler() *JobHandler {
	return &JobHandler{
		emailService: utils.NewEmailService(),
	}
}

func (h *JobHandler) GetJobs(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	jobType := c.Query("type")
	location := c.Query("location")
	search := c.Query("search")
	postedBy := c.Query("posted_by")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Build filter
	filter := bson.M{
		"is_active": true,
		"$or": []bson.M{
			{"expires_at": bson.M{"$gt": time.Now()}},
			{"expires_at": nil},
		},
	}

	if jobType != "" {
		filter["job_type"] = jobType
	}

	if location != "" {
		filter["location"] = bson.M{"$regex": location, "$options": "i"}
	}

	if postedBy != "" {
		if objID, err := primitive.ObjectIDFromHex(postedBy); err == nil {
			filter["posted_by"] = objID
		}
	}

	if search != "" {
		filter["$and"] = []bson.M{
			filter,
			{
				"$or": []bson.M{
					{"title": bson.M{"$regex": search, "$options": "i"}},
					{"company": bson.M{"$regex": search, "$options": "i"}},
					{"description": bson.M{"$regex": search, "$options": "i"}},
					{"requirements": bson.M{"$in": []string{search}}},
				},
			},
		}
	}

	collection := config.GetCollection("jobs")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get total count
	total, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to count jobs",
		})
	}

	// Get jobs with pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"created_at": -1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch jobs",
		})
	}
	defer cursor.Close(ctx)

	var jobs []models.Job
	if err = cursor.All(ctx, &jobs); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to decode jobs",
		})
	}

	// Populate posted by user information
	userCollection := config.GetCollection("users")
	for i := range jobs {
		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"_id": jobs[i].PostedBy}).Decode(&user)
		if err == nil {
			jobs[i].PostedByUser = user.ToResponse()
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data": fiber.Map{
			"jobs": jobs,
			"pagination": fiber.Map{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

func (h *JobHandler) CreateJob(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req models.CreateJobRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	job := models.Job{
		ID:                 primitive.NewObjectID(),
		Title:              utils.SanitizeString(req.Title),
		Company:            utils.SanitizeString(req.Company),
		Location:           utils.SanitizeString(req.Location),
		JobType:            req.JobType,
		ExperienceRequired: utils.SanitizeString(req.ExperienceRequired),
		SalaryRange:        utils.SanitizeString(req.SalaryRange),
		Description:        utils.SanitizeString(req.Description),
		Requirements:       req.Requirements,
		PostedBy:           userID,
		ApplicantsCount:    0,
		IsActive:           true,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	if !req.ExpiresAt.IsZero() {
		job.ExpiresAt = &req.ExpiresAt
	}

	collection := config.GetCollection("jobs")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, job)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to create job",
		})
	}

	// Send notifications to all students
	go h.notifyStudentsAboutNewJob(job)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"error":   false,
		"message": "Job created successfully",
		"data":    job,
	})
}

func (h *JobHandler) notifyStudentsAboutNewJob(job models.Job) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get all students
	usersCollection := config.GetCollection("users")
	cursor, err := usersCollection.Find(ctx, bson.M{
		"role":        models.RoleStudent,
		"is_verified": true,
		"is_active":   true,
	})
	if err != nil {
		return
	}
	defer cursor.Close(ctx)

	var students []models.User
	cursor.All(ctx, &students)

	// Get job poster info
	var poster models.User
	usersCollection.FindOne(ctx, bson.M{"_id": job.PostedBy}).Decode(&poster)

	// Create notifications and send emails
	notificationsCollection := config.GetCollection("notifications")
	for _, student := range students {
		// Create notification
		notification := models.Notification{
			ID:               primitive.NewObjectID(),
			UserID:           student.ID,
			Title:            "New Job Posted",
			Message:          "A new " + job.Title + " position has been posted at " + job.Company,
			NotificationType: models.NotificationJobPosted,
			RelatedID:        &job.ID,
			IsRead:           false,
			CreatedAt:        time.Now(),
		}

		notificationsCollection.InsertOne(ctx, notification)

		// Send email notification
		emailSubject := "New Job Opportunity on AlmaniPortal"
		emailBody := `Hello ` + student.Name + `,

A new job opportunity has been posted on AlmaniPortal:

Position: ` + job.Title + `
Company: ` + job.Company + `
Location: ` + job.Location + `
Posted by: ` + poster.Name + `

Description:
` + job.Description + `

Visit AlmaniPortal to view full details and show your interest.

Thanks,
AlmaniPortal Team
Electronics and Telecommunication Department
Dr. AIT, Bengaluru`

		h.emailService.SendJobNotification(student.Email, job.Title, job.Company, poster.Name, emailSubject, emailBody)
	}
}

func (h *JobHandler) GetJobByID(c *fiber.Ctx) error {
	jobIDStr := c.Params("id")
	jobID, err := primitive.ObjectIDFromHex(jobIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid job ID",
		})
	}

	collection := config.GetCollection("jobs")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var job models.Job
	err = collection.FindOne(ctx, bson.M{
		"_id":       jobID,
		"is_active": true,
	}).Decode(&job)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Job not found",
		})
	}

	// Populate posted by user information
	userCollection := config.GetCollection("users")
	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"_id": job.PostedBy}).Decode(&user)
	if err == nil {
		job.PostedByUser = user.ToResponse()
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  job,
	})
}

func (h *JobHandler) UpdateJob(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	jobIDStr := c.Params("id")
	jobID, err := primitive.ObjectIDFromHex(jobIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid job ID",
		})
	}

	var req models.UpdateJobRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if err := utils.ValidateStruct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": err.Error(),
		})
	}

	collection := config.GetCollection("jobs")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if job exists and user owns it
	var existingJob models.Job
	err = collection.FindOne(ctx, bson.M{
		"_id":       jobID,
		"posted_by": userID,
		"is_active": true,
	}).Decode(&existingJob)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Job not found or access denied",
		})
	}

	// Build update document
	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	if req.Title != "" {
		update["$set"].(bson.M)["title"] = utils.SanitizeString(req.Title)
	}
	if req.Company != "" {
		update["$set"].(bson.M)["company"] = utils.SanitizeString(req.Company)
	}
	if req.Location != "" {
		update["$set"].(bson.M)["location"] = utils.SanitizeString(req.Location)
	}
	if req.JobType != "" {
		update["$set"].(bson.M)["job_type"] = req.JobType
	}
	if req.ExperienceRequired != "" {
		update["$set"].(bson.M)["experience_required"] = utils.SanitizeString(req.ExperienceRequired)
	}
	if req.SalaryRange != "" {
		update["$set"].(bson.M)["salary_range"] = utils.SanitizeString(req.SalaryRange)
	}
	if req.Description != "" {
		update["$set"].(bson.M)["description"] = utils.SanitizeString(req.Description)
	}
	if req.Requirements != nil {
		update["$set"].(bson.M)["requirements"] = req.Requirements
	}
	if !req.ExpiresAt.IsZero() {
		update["$set"].(bson.M)["expires_at"] = req.ExpiresAt
	}

	var job models.Job
	err = collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": jobID},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&job)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update job",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Job updated successfully",
		"data":    job,
	})
}

func (h *JobHandler) DeleteJob(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	userRole := middleware.GetUserRole(c)
	jobIDStr := c.Params("id")
	jobID, err := primitive.ObjectIDFromHex(jobIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid job ID",
		})
	}

	collection := config.GetCollection("jobs")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"_id":       jobID,
		"is_active": true,
	}

	// Only allow poster or admin to delete
	if userRole != models.RoleAdmin {
		filter["posted_by"] = userID
	}

	_, err = collection.UpdateOne(ctx, filter, bson.M{
		"$set": bson.M{
			"is_active":  false,
			"updated_at": time.Now(),
		},
	})
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Job not found or access denied",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Job deleted successfully",
	})
}

func (h *JobHandler) ShowInterest(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	jobIDStr := c.Params("id")
	jobID, err := primitive.ObjectIDFromHex(jobIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid job ID",
		})
	}

	interestsCollection := config.GetCollection("job_interests")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if already interested
	var existingInterest models.JobInterest
	err = interestsCollection.FindOne(ctx, bson.M{
		"job_id":  jobID,
		"user_id": userID,
	}).Decode(&existingInterest)
	if err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error":   true,
			"message": "Already showed interest in this job",
		})
	}

	// Create interest
	interest := models.JobInterest{
		ID:        primitive.NewObjectID(),
		JobID:     jobID,
		UserID:    userID,
		CreatedAt: time.Now(),
	}

	_, err = interestsCollection.InsertOne(ctx, interest)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to show interest",
		})
	}

	// Increment applicants count
	jobsCollection := config.GetCollection("jobs")
	_, err = jobsCollection.UpdateOne(ctx, bson.M{"_id": jobID}, bson.M{
		"$inc": bson.M{"applicants_count": 1},
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update applicants count",
		})
	}

	// Notify job poster
	go h.notifyJobPosterAboutInterest(jobID, userID)

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Interest shown successfully",
	})
}

func (h *JobHandler) notifyJobPosterAboutInterest(jobID, userID primitive.ObjectID) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get job and user info
	jobsCollection := config.GetCollection("jobs")
	usersCollection := config.GetCollection("users")

	var job models.Job
	var user models.User

	jobsCollection.FindOne(ctx, bson.M{"_id": jobID}).Decode(&job)
	usersCollection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)

	// Create notification for job poster
	notification := models.Notification{
		ID:               primitive.NewObjectID(),
		UserID:           job.PostedBy,
		Title:            "New Interest Received",
		Message:          user.Name + " has shown interest in your " + job.Title + " position",
		NotificationType: models.NotificationInterestReceived,
		RelatedID:        &jobID,
		IsRead:           false,
		CreatedAt:        time.Now(),
	}

	notificationsCollection := config.GetCollection("notifications")
	notificationsCollection.InsertOne(ctx, notification)
}

func (h *JobHandler) RemoveInterest(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	jobIDStr := c.Params("id")
	jobID, err := primitive.ObjectIDFromHex(jobIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid job ID",
		})
	}

	interestsCollection := config.GetCollection("job_interests")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Remove interest
	result, err := interestsCollection.DeleteOne(ctx, bson.M{
		"job_id":  jobID,
		"user_id": userID,
	})
	if err != nil || result.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Interest not found",
		})
	}

	// Decrement applicants count
	jobsCollection := config.GetCollection("jobs")
	_, err = jobsCollection.UpdateOne(ctx, bson.M{"_id": jobID}, bson.M{
		"$inc": bson.M{"applicants_count": -1},
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to update applicants count",
		})
	}

	return c.JSON(fiber.Map{
		"error":   false,
		"message": "Interest removed successfully",
	})
}

func (h *JobHandler) GetInterestedUsers(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	jobIDStr := c.Params("id")
	jobID, err := primitive.ObjectIDFromHex(jobIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid job ID",
		})
	}

	// Check if user owns the job
	jobsCollection := config.GetCollection("jobs")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var job models.Job
	err = jobsCollection.FindOne(ctx, bson.M{
		"_id":       jobID,
		"posted_by": userID,
		"is_active": true,
	}).Decode(&job)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   true,
			"message": "Job not found or access denied",
		})
	}

	// Get interested users
	interestsCollection := config.GetCollection("job_interests")
	cursor, err := interestsCollection.Find(ctx, bson.M{"job_id": jobID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch interested users",
		})
	}
	defer cursor.Close(ctx)

	var interests []models.JobInterest
	if err = cursor.All(ctx, &interests); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to decode interests",
		})
	}

	// Populate user information
	usersCollection := config.GetCollection("users")
	for i := range interests {
		var user models.User
		err := usersCollection.FindOne(ctx, bson.M{"_id": interests[i].UserID}).Decode(&user)
		if err == nil {
			interests[i].User = user.ToResponse()
		}
	}

	return c.JSON(fiber.Map{
		"error": false,
		"data":  interests,
	})
}
