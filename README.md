# 🎓 AlumniPortal - Alumni Management System

A comprehensive full-stack web application for managing alumni networks, built for the Electronics and Telecommunication Department (ETE) at Dr. Ambedkar Institute of Technology, Bengaluru.

## 🏗️ Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Go + Fiber Framework
- **Database**: MongoDB
- **Real-time**: WebSocket connections
- **Authentication**: JWT tokens + Email OTP
- **File Storage**: Local storage with upload validation

## 🚀 Features

### 👥 Multi-Role System
- **Students**: Post projects, apply for jobs, network with alumni
- **Alumni**: Post job opportunities, mentor students, share experiences
- **Faculty**: Manage events, moderate content, guide students
- **Admin**: System administration, user management, analytics

### 🔧 Core Functionality
- **Real-time Messaging**: WebSocket-powered chat system
- **Project Showcase**: Students can showcase their academic projects
- **Job Portal**: Alumni can post job opportunities
- **Event Management**: Faculty can organize and manage events
- **Gallery**: Photo sharing for events and achievements
- **Email Notifications**: Automated email alerts for important activities

## 📋 Prerequisites

Before running the application, ensure you have:

- **Go 1.21+** installed
- **Node.js 18+** and npm/yarn
- **MongoDB 7.0+** running locally or connection string
- **SMTP credentials** for email functionality (Gmail recommended)

## 🛠️ Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd almaniportal
\`\`\`

### 2. Backend Setup

\`\`\`bash
# Navigate to backend directory
cd backend

# Install Go dependencies
go mod tidy

# Copy environment file
cp .env.example .env

# Edit .env file with your configurations
nano .env
\`\`\`

**Required Environment Variables:**

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/alumni_ete_new
DB_NAME=alumni_ete_new

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h
REFRESH_EXPIRATION=168h

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@almaniportal.com

# Rate Limiting
RATE_LIMIT_LOGIN=5
RATE_LIMIT_REGISTER=3
RATE_LIMIT_REFRESH=10
RATE_LIMIT_WINDOW=1m

# File Upload
MAX_FILE_SIZE=5242880

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
\`\`\`

### 3. Frontend Setup

\`\`\`bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit environment file
nano .env.local
\`\`\`

**Frontend Environment Variables:**

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
\`\`\`

### 4. Database Setup

\`\`\`bash
# Start MongoDB (if running locally)
mongod

# Create database and collections (run from backend directory)
go run scripts/setup_db.go
\`\`\`

## 🚀 Running the Application

### Option 1: Manual Setup (Development)

**Terminal 1 - Start MongoDB:**
\`\`\`bash
mongod
\`\`\`

**Terminal 2 - Start Backend:**
\`\`\`bash
cd backend
go run main.go
\`\`\`

**Terminal 3 - Start Frontend:**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

**Access URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MongoDB: localhost:27017

### Option 2: Using Docker Compose (Recommended)

\`\`\`bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

**Docker Access URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MongoDB: localhost:27017

## 🧪 Testing

### Run Backend Tests

\`\`\`bash
cd backend
go test ./internal/tests/... -v
\`\`\`

### Run Frontend Tests

\`\`\`bash
cd frontend
npm test
\`\`\`

### Test Coverage

\`\`\`bash
# Backend test coverage
cd backend
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Frontend test coverage
cd frontend
npm run test:coverage
\`\`\`

## 📦 Production Deployment

### 1. Build Docker Images

\`\`\`bash
# Build backend image
cd backend
docker build -t almaniportal-backend:latest .

# Build frontend image
cd ../frontend
docker build -t almaniportal-frontend:latest .
\`\`\`

### 2. Save and Share Images

\`\`\`bash
# Save images to files
docker save almaniportal-backend:latest > almaniportal-backend.tar
docker save almaniportal-frontend:latest > almaniportal-frontend.tar

# Transfer files to target server
scp almaniportal-*.tar user@server:/path/to/deployment/

# Load images on target server
docker load < almaniportal-backend.tar
docker load < almaniportal-frontend.tar
\`\`\`

### 3. Production Docker Compose

Create `docker-compose.prod.yml`:

\`\`\`yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: almaniportal-mongodb-prod
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: alumni_ete_new
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - almaniportal-network

  backend:
    image: almaniportal-backend:latest
    container_name: almaniportal-backend-prod
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - MONGODB_URI=mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb:27017/alumni_ete_new?authSource=admin
      - DB_NAME=alumni_ete_new
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USERNAME=${SMTP_USERNAME}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - ENVIRONMENT=production
    depends_on:
      - mongodb
    networks:
      - almaniportal-network

  frontend:
    image: almaniportal-frontend:latest
    container_name: almaniportal-frontend-prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080/api/v1
      - NEXT_PUBLIC_WS_URL=ws://backend:8080/ws
    depends_on:
      - backend
    networks:
      - almaniportal-network

  nginx:
    image: nginx:alpine
    container_name: almaniportal-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - almaniportal-network

volumes:
  mongodb_data:

networks:
  almaniportal-network:
    driver: bridge
\`\`\`

### 4. Deploy to Production

\`\`\`bash
# Create production environment file
cp .env.example .env.prod

# Edit with production values
nano .env.prod

# Deploy
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
\`\`\`

## 🔧 Configuration

### SMTP Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `SMTP_PASSWORD`

### MongoDB Configuration

For production, consider:
- Setting up MongoDB Atlas (cloud)
- Configuring replica sets
- Setting up proper indexes
- Implementing backup strategies

## 📊 Monitoring & Maintenance

### Health Checks

\`\`\`bash
# Check backend health
curl http://localhost:8080/health

# Check database connection
curl http://localhost:8080/api/v1/health/db

# Check WebSocket connection
wscat -c ws://localhost:8080/ws
\`\`\`

### Logs

\`\`\`bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# View specific service logs
docker logs almaniportal-backend-prod
\`\`\`

### Backup

\`\`\`bash
# Backup MongoDB
docker exec almaniportal-mongodb-prod mongodump --out /backup

# Backup uploaded files
docker cp almaniportal-backend-prod:/app/uploads ./backup/uploads
\`\`\`

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in .env
   - Check network connectivity

2. **SMTP Authentication Failed**
   - Verify Gmail App Password
   - Check SMTP settings
   - Ensure 2FA is enabled

3. **WebSocket Connection Failed**
   - Check if backend is running
   - Verify WebSocket URL
   - Check firewall settings

4. **File Upload Failed**
   - Check file size limits
   - Verify upload directory permissions
   - Check available disk space

### Debug Mode

\`\`\`bash
# Run backend in debug mode
cd backend
go run main.go --debug

# Run frontend in debug mode
cd frontend
npm run dev -- --debug
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Dr. Ambedkar Institute of Technology, Bengaluru
- Electronics and Telecommunication Department (ETE)
- All contributors and testers

## 📞 Support

For support and questions:
- Email: support@almaniportal.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/almaniportal/issues)

---

**Built with ❤️ for the ETE Alumni Community**
\`\`\`

## Part 3: Docker Configuration Files
