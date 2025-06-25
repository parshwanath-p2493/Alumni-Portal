#!/bin/bash

# AlmaniPortal Deployment Script
set -e

echo "🚀 Starting AlmaniPortal Deployment..."

# Configuration
PROJECT_NAME="almaniportal"
BACKEND_IMAGE="${PROJECT_NAME}-backend"
FRONTEND_IMAGE="${PROJECT_NAME}-frontend"
VERSION=${1:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✅"
}

# Build images
build_images() {
    log_info "Building Docker images..."
    
    # Build backend
    log_info "Building backend image..."
    cd backend
    docker build -t ${BACKEND_IMAGE}:${VERSION} .
    cd ..
    
    # Build frontend
    log_info "Building frontend image..."
    cd frontend
    docker build -f Dockerfile.frontend -t ${FRONTEND_IMAGE}:${VERSION} .
    cd ..
    
    log_info "Images built successfully ✅"
}

# Deploy services
deploy_services() {
    log_info "Deploying services..."
    
    # Stop existing services
    docker-compose down
    
    # Start new services
    docker-compose up -d --build
    
    log_info "Services deployed successfully ✅"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        log_info "Backend health check passed ✅"
    else
        log_error "Backend health check failed ❌"
        return 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "Frontend health check passed ✅"
    else
        log_error "Frontend health check failed ❌"
        return 1
    fi
    
    log_info "All health checks passed ✅"
}

# Backup
backup_data() {
    log_info "Creating backup..."
    
    BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"
    mkdir -p ${BACKUP_DIR}
    
    # Backup MongoDB
    docker exec ${PROJECT_NAME}-mongodb mongodump --out /backup
    docker cp ${PROJECT_NAME}-mongodb:/backup ${BACKUP_DIR}/mongodb
    
    # Backup uploads
    docker cp ${PROJECT_NAME}-backend:/app/uploads ${BACKUP_DIR}/uploads
    
    log_info "Backup created at ${BACKUP_DIR} ✅"
}

# Main deployment process
main() {
    log_info "🎯 AlmaniPortal Deployment Started"
    
    check_prerequisites
    backup_data
    build_images
    deploy_services
    health_check
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend: http://localhost:8080"
    log_info "MongoDB: localhost:27017"
}

# Run main function
main "$@"
