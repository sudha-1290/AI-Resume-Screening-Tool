#!/bin/bash

# Quick Deployment Script for AI Resume Screening Tool
# This script provides easy deployment options for different platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  netlify-railway    Deploy to Netlify (frontend) + Railway (backend)"
    echo "  vercel             Deploy full-stack to Vercel"
    echo "  digitalocean       Deploy to DigitalOcean App Platform"
    echo "  aws                Deploy to AWS (ECS + S3)"
    echo "  docker             Deploy using Docker Compose"
    echo "  local              Setup local development environment"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 netlify-railway"
    echo "  $0 vercel"
    echo "  $0 local"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env
        print_warning "Environment file created. Please edit .env with your configuration."
    fi
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    print_success "Environment setup completed"
}

# Function to deploy to Netlify + Railway
deploy_netlify_railway() {
    print_status "Deploying to Netlify + Railway..."
    
    # Check if environment variables are set
    if [ -z "$RAILWAY_TOKEN" ]; then
        print_error "RAILWAY_TOKEN environment variable is not set."
        print_warning "Please set your Railway token: export RAILWAY_TOKEN=your_token"
        exit 1
    fi
    
    if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
        print_error "NETLIFY_AUTH_TOKEN environment variable is not set."
        print_warning "Please set your Netlify token: export NETLIFY_AUTH_TOKEN=your_token"
        exit 1
    fi
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    # Deploy to Railway
    print_status "Deploying backend to Railway..."
    npx railway deploy
    
    # Deploy to Netlify
    print_status "Deploying frontend to Netlify..."
    npx netlify deploy --prod --dir=frontend/build
    
    print_success "Deployment to Netlify + Railway completed!"
}

# Function to deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    print_success "Deployment to Vercel completed!"
}

# Function to deploy to DigitalOcean
deploy_digitalocean() {
    print_status "Deploying to DigitalOcean App Platform..."
    
    # Check if doctl is installed
    if ! command -v doctl &> /dev/null; then
        print_error "DigitalOcean CLI (doctl) is not installed."
        print_warning "Please install doctl: https://docs.digitalocean.com/reference/doctl/how-to/install/"
        exit 1
    fi
    
    # Deploy using app spec
    doctl apps create --spec .do/app.yaml
    
    print_success "Deployment to DigitalOcean completed!"
}

# Function to deploy to AWS
deploy_aws() {
    print_status "Deploying to AWS..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed."
        print_warning "Please install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed."
        print_warning "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Run AWS deployment script
    chmod +x scripts/deploy-aws.sh
    ./scripts/deploy-aws.sh
    
    print_success "Deployment to AWS completed!"
}

# Function to deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker Compose..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed."
        print_warning "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed."
        print_warning "Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Build and start services
    docker-compose up -d --build
    
    print_success "Docker deployment completed!"
    print_status "Services are running on:"
    print_status "  Frontend: http://localhost:3001"
    print_status "  Backend: http://localhost:3000"
    print_status "  Database: localhost:5432"
    print_status "  Redis: localhost:6379"
}

# Function to setup local development
setup_local() {
    print_status "Setting up local development environment..."
    
    check_prerequisites
    setup_environment
    
    # Start database services
    print_status "Starting database services..."
    docker-compose up -d postgres redis
    
    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Run migrations
    print_status "Running database migrations..."
    npm run migrate
    
    # Seed data (optional)
    read -p "Do you want to seed the database with sample data? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run seed
    fi
    
    # Start development servers
    print_status "Starting development servers..."
    
    # Start backend in background
    npm run dev &
    BACKEND_PID=$!
    
    # Start frontend in background
    cd frontend && npm start &
    FRONTEND_PID=$!
    
    # Wait for servers to start
    sleep 5
    
    print_success "Local development environment is ready!"
    print_status "Services are running on:"
    print_status "  Frontend: http://localhost:3001"
    print_status "  Backend: http://localhost:3000"
    print_status "  API Docs: http://localhost:3000/api/docs"
    echo ""
    print_warning "Press Ctrl+C to stop all services"
    
    # Wait for user to stop
    wait $BACKEND_PID $FRONTEND_PID
}

# Main function
main() {
    echo "=========================================="
    echo "  AI Resume Screening Tool - Deployment"
    echo "=========================================="
    echo ""
    
    case "${1:-help}" in
        "netlify-railway")
            check_prerequisites
            deploy_netlify_railway
            ;;
        "vercel")
            check_prerequisites
            deploy_vercel
            ;;
        "digitalocean")
            check_prerequisites
            deploy_digitalocean
            ;;
        "aws")
            check_prerequisites
            deploy_aws
            ;;
        "docker")
            check_prerequisites
            deploy_docker
            ;;
        "local")
            setup_local
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Run main function
main "$@" 