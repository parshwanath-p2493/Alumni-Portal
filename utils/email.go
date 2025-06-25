package utils

import (
	"context"
	"fmt"
	"net/smtp"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"ete-alumni-portal/config"
	"ete-alumni-portal/models"
)

type EmailService struct {
	config *config.Config
}

func NewEmailService() *EmailService {
	return &EmailService{
		config: config.GetConfig(),
	}
}

func (e *EmailService) sendEmail(to, subject, body string) error {
	// Get SMTP configuration from config
	smtpHost := e.config.SMTPHost
	smtpPort := e.config.SMTPPort
	smtpUsername := e.config.SMTPUsername
	smtpPassword := e.config.SMTPPassword
	fromEmail := e.config.SMTPFrom
	ETE := "ete@email.com"
	// Check if SMTP is configured
	if smtpUsername == "" || smtpPassword == "" {
		fmt.Printf("⚠️  SMTP not configured. Email would be sent to %s\n", to)
		fmt.Printf("📧 Subject: %s\n", subject)
		fmt.Printf("📝 Body:\n%s\n", body)
		fmt.Println("🔧 Please configure SMTP settings in .env file to send actual emails")
		return nil // Don't return error in development
	}

	// Set up authentication
	auth := smtp.PlainAuth("", smtpUsername, smtpPassword, smtpHost)

	// Create message with proper headers
	message := fmt.Sprintf("From: ETE Alumni Portal <%s>\r\n", ETE)
	message += fmt.Sprintf("To: %s\r\n", to)
	message += fmt.Sprintf("Subject: %s\r\n", subject)
	message += "MIME-Version: 1.0\r\n"
	message += "Content-Type: text/plain; charset=UTF-8\r\n"
	message += "\r\n"
	message += body

	// Send email
	addr := fmt.Sprintf("%s:%d", smtpHost, smtpPort)
	err := smtp.SendMail(addr, auth, fromEmail, []string{to}, []byte(message))

	if err != nil {
		fmt.Printf("❌ Failed to send email to %s: %v\n", to, err)
		return fmt.Errorf("failed to send email: %v", err)
	}

	fmt.Printf("✅ Email sent successfully to %s\n", to)
	return nil
}

func (e *EmailService) logEmail(emailType models.EmailNotificationType, toEmail, subject, status, errorMessage string) {
	collection := config.GetCollection("email_logs")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log := models.EmailLog{
		ID:           primitive.NewObjectID(),
		Type:         emailType,
		ToEmail:      toEmail,
		Subject:      subject,
		Status:       status,
		ErrorMessage: errorMessage,
		RetryCount:   0,
		CreatedAt:    time.Now(),
	}

	if status == "sent" {
		now := time.Now()
		log.SentAt = &now
	}

	collection.InsertOne(ctx, log)
}

// SendOTP - Main function to send OTP emails
func (e *EmailService) SendOTP(to, otp, purpose string) error {
	var subject, body string

	switch purpose {
	case "registration":
		subject = "🔐 Verify Your Email - ETE Alumni Portal"
		body = fmt.Sprintf(`Dear User,

Welcome to the ETE Alumni Portal! 🎓

Your email verification code is: %s

⏰ This code will expire in 10 minutes.
🔒 Please enter this code to complete your registration.

If you didn't request this, please ignore this email.

Best regards,
ETE Alumni Portal Team
Dr. Ambedkar Institute of Technology, Bengaluru

---
Need help? Contact us at support@almaniportal.com`, otp)

	case "password_reset":
		subject = "🔑 Password Reset Code - ETE Alumni Portal"
		body = fmt.Sprintf(`Dear User,

You requested a password reset for your ETE Alumni Portal account.

Your password reset code is: %s

⏰ This code will expire in 10 minutes.
🔒 Please enter this code to reset your password.

If you didn't request this, please ignore this email and your password will remain unchanged.

Best regards,
ETE Alumni Portal Team
Dr. Ambedkar Institute of Technology, Bengaluru

---
Need help? Contact us at support@almaniportal.com`, otp)

	default:
		subject = "🔐 Verification Code - ETE Alumni Portal"
		body = fmt.Sprintf(`Your verification code is: %s

⏰ This code will expire in 10 minutes.

Best regards,
ETE Alumni Portal Team`, otp)
	}

	// Send email
	err := e.sendEmail(to, subject, body)
	if err != nil {
		// Log the error
		e.logEmail(models.EmailTypeWelcome, to, subject, "failed", err.Error())
		return err
	}

	// Log success
	e.logEmail(models.EmailTypeWelcome, to, subject, "sent", "")
	return nil
}

// SendJobNotification - Send job posting notifications
func (e *EmailService) SendJobNotification(to, jobTitle, company, postedBy string, emailSubject string, emailBody string) error {
	subject := fmt.Sprintf("💼 New Job Opportunity - %s at %s", jobTitle, company)
	body := fmt.Sprintf(`Dear Student,

A new job opportunity has been posted on the ETE Alumni Portal! 🎯

📋 Job Title: %s
🏢 Company: %s
👤 Posted by: %s

🔗 Login to the portal to view more details and express your interest:
%s
%s
%s
Best regards,
ETE Alumni Portal Team
Dr. Ambedkar Institute of Technology, Bengaluru

---
Need help? Contact us at support@almaniportal.com`, jobTitle, company, postedBy, e.config.FrontendURL, emailSubject, emailSubject)

	err := e.sendEmail(to, subject, body)
	if err != nil {
		e.logEmail(models.EmailTypeJobPosted, to, subject, "failed", err.Error())
		return err
	}

	e.logEmail(models.EmailTypeJobPosted, to, subject, "sent", "")
	return nil
}

// SendMessageNotification - Send message notifications
func (e *EmailService) SendMessageNotification(to, senderName, messageSubject string) error {
	subject := "💬 New Message - ETE Alumni Portal"
	body := fmt.Sprintf(`Dear User,

You have received a new message on the ETE Alumni Portal! 📨

👤 From: %s
📋 Subject: %s

🔗 Login to the portal to read and reply to the message:
%s

Best regards,
ETE Alumni Portal Team
Dr. Ambedkar Institute of Technology, Bengaluru

---
Need help? Contact us at support@almaniportal.com`, senderName, messageSubject, e.config.FrontendURL)

	err := e.sendEmail(to, subject, body)
	if err != nil {
		e.logEmail(models.EmailTypeMessageReceived, to, subject, "failed", err.Error())
		return err
	}

	e.logEmail(models.EmailTypeMessageReceived, to, subject, "sent", "")
	return nil
}

// SendTestEmail - Test email functionality
func (e *EmailService) SendTestEmail(to, subject, body string) error {
	return e.sendEmail(to, subject, body)
}
