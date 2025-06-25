package handlers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"

	"ete-alumni-portal/config"
	"ete-alumni-portal/models"
)

type AnalyticsHandler struct{}

func NewAnalyticsHandler() *AnalyticsHandler {
	return &AnalyticsHandler{}
}

type AnalyticsData struct {
	UserStats    UserStats    `json:"user_stats"`
	ProjectStats ProjectStats `json:"project_stats"`
	JobStats     JobStats     `json:"job_stats"`
	EventStats   EventStats   `json:"event_stats"`
	GrowthStats  GrowthStats  `json:"growth_stats"`
	ActivityLog  []Activity   `json:"activity_log"`
}

type UserStats struct {
	TotalUsers    int64 `json:"total_users"`
	StudentsCount int64 `json:"students_count"`
	AlumniCount   int64 `json:"alumni_count"`
	FacultyCount  int64 `json:"faculty_count"`
	ActiveUsers   int64 `json:"active_users"`
	VerifiedUsers int64 `json:"verified_users"`
}

type ProjectStats struct {
	TotalProjects  int64 `json:"total_projects"`
	MajorProjects  int64 `json:"major_projects"`
	MiniProjects   int64 `json:"mini_projects"`
	RecentProjects int64 `json:"recent_projects"`
}

type JobStats struct {
	TotalJobs   int64 `json:"total_jobs"`
	ActiveJobs  int64 `json:"active_jobs"`
	ExpiredJobs int64 `json:"expired_jobs"`
	RecentJobs  int64 `json:"recent_jobs"`
}

type EventStats struct {
	TotalEvents    int64 `json:"total_events"`
	UpcomingEvents int64 `json:"upcoming_events"`
	PastEvents     int64 `json:"past_events"`
	RecentEvents   int64 `json:"recent_events"`
}

type GrowthStats struct {
	UsersGrowth    float64 `json:"users_growth"`
	ProjectsGrowth float64 `json:"projects_growth"`
	JobsGrowth     float64 `json:"jobs_growth"`
	EventsGrowth   float64 `json:"events_growth"`
}

type Activity struct {
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	UserID    string    `json:"user_id,omitempty"`
	UserName  string    `json:"user_name,omitempty"`
	Severity  string    `json:"severity"`
	CreatedAt time.Time `json:"created_at"`
}

func (h *AnalyticsHandler) GetDashboardAnalytics(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	analytics := AnalyticsData{}

	// Get user statistics
	userStats, err := h.getUserStats(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch user statistics",
		})
	}
	analytics.UserStats = userStats

	// Get project statistics
	projectStats, err := h.getProjectStats(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch project statistics",
		})
	}
	analytics.ProjectStats = projectStats

	// Get job statistics
	jobStats, err := h.getJobStats(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch job statistics",
		})
	}
	analytics.JobStats = jobStats

	// Get event statistics
	eventStats, err := h.getEventStats(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch event statistics",
		})
	}
	analytics.EventStats = eventStats

	// Get growth statistics
	growthStats, err := h.getGrowthStats(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch growth statistics",
		})
	}
	analytics.GrowthStats = growthStats

	// Get recent activity
	activityLog, err := h.getRecentActivity(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch activity log",
		})
	}
	analytics.ActivityLog = activityLog

	return c.JSON(fiber.Map{
		"error": false,
		"data":  analytics,
	})
}

func (h *AnalyticsHandler) getUserStats(ctx context.Context) (UserStats, error) {
	collection := config.GetCollection("users")

	stats := UserStats{}

	// Total users
	total, err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return stats, err
	}
	stats.TotalUsers = total

	// Students count
	students, err := collection.CountDocuments(ctx, bson.M{"role": models.RoleStudent})
	if err != nil {
		return stats, err
	}
	stats.StudentsCount = students

	// Alumni count
	alumni, err := collection.CountDocuments(ctx, bson.M{"role": models.RoleAlumni})
	if err != nil {
		return stats, err
	}
	stats.AlumniCount = alumni

	// Faculty count
	faculty, err := collection.CountDocuments(ctx, bson.M{"role": models.RoleFaculty})
	if err != nil {
		return stats, err
	}
	stats.FacultyCount = faculty

	// Active users
	active, err := collection.CountDocuments(ctx, bson.M{"is_active": true})
	if err != nil {
		return stats, err
	}
	stats.ActiveUsers = active

	// Verified users
	verified, err := collection.CountDocuments(ctx, bson.M{"is_verified": true})
	if err != nil {
		return stats, err
	}
	stats.VerifiedUsers = verified

	return stats, nil
}

func (h *AnalyticsHandler) getProjectStats(ctx context.Context) (ProjectStats, error) {
	collection := config.GetCollection("projects")

	stats := ProjectStats{}

	// Total projects
	total, err := collection.CountDocuments(ctx, bson.M{"is_active": true})
	if err != nil {
		return stats, err
	}
	stats.TotalProjects = total

	// Major projects
	major, err := collection.CountDocuments(ctx, bson.M{
		"is_active":    true,
		"project_type": models.ProjectTypeMajor,
	})
	if err != nil {
		return stats, err
	}
	stats.MajorProjects = major

	// Mini projects
	mini, err := collection.CountDocuments(ctx, bson.M{
		"is_active":    true,
		"project_type": models.ProjectTypeMini,
	})
	if err != nil {
		return stats, err
	}
	stats.MiniProjects = mini

	// Recent projects (last 30 days)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	recent, err := collection.CountDocuments(ctx, bson.M{
		"is_active":  true,
		"created_at": bson.M{"$gte": thirtyDaysAgo},
	})
	if err != nil {
		return stats, err
	}
	stats.RecentProjects = recent

	return stats, nil
}

func (h *AnalyticsHandler) getJobStats(ctx context.Context) (JobStats, error) {
	collection := config.GetCollection("jobs")

	stats := JobStats{}

	// Total jobs
	total, err := collection.CountDocuments(ctx, bson.M{"is_active": true})
	if err != nil {
		return stats, err
	}
	stats.TotalJobs = total

	// Active jobs (not expired)
	now := time.Now()
	active, err := collection.CountDocuments(ctx, bson.M{
		"is_active": true,
		"$or": []bson.M{
			{"expires_at": bson.M{"$gt": now}},
			{"expires_at": nil},
		},
	})
	if err != nil {
		return stats, err
	}
	stats.ActiveJobs = active

	// Expired jobs
	stats.ExpiredJobs = total - active

	// Recent jobs (last 30 days)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	recent, err := collection.CountDocuments(ctx, bson.M{
		"is_active":  true,
		"created_at": bson.M{"$gte": thirtyDaysAgo},
	})
	if err != nil {
		return stats, err
	}
	stats.RecentJobs = recent

	return stats, nil
}

func (h *AnalyticsHandler) getEventStats(ctx context.Context) (EventStats, error) {
	collection := config.GetCollection("events")

	stats := EventStats{}

	// Total events
	total, err := collection.CountDocuments(ctx, bson.M{"is_active": true})
	if err != nil {
		return stats, err
	}
	stats.TotalEvents = total

	// Upcoming events
	now := time.Now()
	upcoming, err := collection.CountDocuments(ctx, bson.M{
		"is_active":  true,
		"event_date": bson.M{"$gte": now},
	})
	if err != nil {
		return stats, err
	}
	stats.UpcomingEvents = upcoming

	// Past events
	stats.PastEvents = total - upcoming

	// Recent events (last 30 days)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	recent, err := collection.CountDocuments(ctx, bson.M{
		"is_active":  true,
		"created_at": bson.M{"$gte": thirtyDaysAgo},
	})
	if err != nil {
		return stats, err
	}
	stats.RecentEvents = recent

	return stats, nil
}

func (h *AnalyticsHandler) getGrowthStats(ctx context.Context) (GrowthStats, error) {
	stats := GrowthStats{}

	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	sixtyDaysAgo := now.AddDate(0, 0, -60)

	// Users growth
	usersCollection := config.GetCollection("users")
	currentUsers, _ := usersCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{"$gte": thirtyDaysAgo},
	})
	previousUsers, _ := usersCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{
			"$gte": sixtyDaysAgo,
			"$lt":  thirtyDaysAgo,
		},
	})
	if previousUsers > 0 {
		stats.UsersGrowth = float64(currentUsers-previousUsers) / float64(previousUsers) * 100
	}

	// Projects growth
	projectsCollection := config.GetCollection("projects")
	currentProjects, _ := projectsCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{"$gte": thirtyDaysAgo},
		"is_active":  true,
	})
	previousProjects, _ := projectsCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{
			"$gte": sixtyDaysAgo,
			"$lt":  thirtyDaysAgo,
		},
		"is_active": true,
	})
	if previousProjects > 0 {
		stats.ProjectsGrowth = float64(currentProjects-previousProjects) / float64(previousProjects) * 100
	}

	// Jobs growth
	jobsCollection := config.GetCollection("jobs")
	currentJobs, _ := jobsCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{"$gte": thirtyDaysAgo},
		"is_active":  true,
	})
	previousJobs, _ := jobsCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{
			"$gte": sixtyDaysAgo,
			"$lt":  thirtyDaysAgo,
		},
		"is_active": true,
	})
	if previousJobs > 0 {
		stats.JobsGrowth = float64(currentJobs-previousJobs) / float64(previousJobs) * 100
	}

	// Events growth
	eventsCollection := config.GetCollection("events")
	currentEvents, _ := eventsCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{"$gte": thirtyDaysAgo},
		"is_active":  true,
	})
	previousEvents, _ := eventsCollection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{
			"$gte": sixtyDaysAgo,
			"$lt":  thirtyDaysAgo,
		},
		"is_active": true,
	})
	if previousEvents > 0 {
		stats.EventsGrowth = float64(currentEvents-previousEvents) / float64(previousEvents) * 100
	}

	return stats, nil
}

func (h *AnalyticsHandler) getRecentActivity(ctx context.Context) ([]Activity, error) {
	_ = ctx
	// This would typically come from an activity log collection
	// For now, we'll return mock data
	activities := []Activity{
		{
			Type:      "user_registered",
			Message:   "New student registered",
			Severity:  "info",
			CreatedAt: time.Now().Add(-2 * time.Hour),
		},
		{
			Type:      "job_posted",
			Message:   "New job posting created",
			Severity:  "success",
			CreatedAt: time.Now().Add(-4 * time.Hour),
		},
		{
			Type:      "project_uploaded",
			Message:   "Student uploaded new project",
			Severity:  "info",
			CreatedAt: time.Now().Add(-6 * time.Hour),
		},
		{
			Type:      "system_error",
			Message:   "Email service temporarily unavailable",
			Severity:  "error",
			CreatedAt: time.Now().Add(-1 * 24 * time.Hour),
		},
	}

	return activities, nil
}
