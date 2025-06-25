.PHONY: build run test clean docker-build docker-run dev

# Variables
APP_NAME=almaniportal
DOCKER_IMAGE=almaniportal-backend
PORT=8080

# Build the application
build:
	go build -o bin/$(APP_NAME) .

# Run the application
run:
	go run .

# Run in development mode with hot reload
dev:
	air

# Test the application
test:
	go test -v ./...

# Clean build artifacts
clean:
	rm -rf bin/

# Install dependencies
deps:
	go mod download
	go mod tidy

# Format code
fmt:
	go fmt ./...

# Lint code
lint:
	golangci-lint run

# Build Docker image
docker-build:
	docker build -t $(DOCKER_IMAGE) .

# Run Docker container
docker-run:
	docker run -p $(PORT):$(PORT) --env-file .env $(DOCKER_IMAGE)

# Docker compose up
docker-up:
	docker-compose up -d

# Docker compose down
docker-down:
	docker-compose down

# Generate Swagger docs
swagger:
	swag init

# Database migration
migrate-up:
	migrate -path ./migrations -database "mongodb://localhost:27017/alumni_ete_new" up

# Database migration down
migrate-down:
	migrate -path ./migrations -database "mongodb://localhost:27017/alumni_ete_new" down

# Seed database
seed:
	go run scripts/seed.go

# Help
help:
	@echo "Available commands:"
	@echo "  build       - Build the application"
	@echo "  run         - Run the application"
	@echo "  dev         - Run in development mode with hot reload"
	@echo "  test        - Run tests"
	@echo "  clean       - Clean build artifacts"
	@echo "  deps        - Install dependencies"
	@echo "  fmt         - Format code"
	@echo "  lint        - Lint code"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run  - Run Docker container"
	@echo "  docker-up   - Start with docker-compose"
	@echo "  docker-down - Stop docker-compose"
	@echo "  swagger     - Generate Swagger docs"
	@echo "  seed        - Seed database with sample data"
	@echo "  help        - Show this help message"
