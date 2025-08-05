#!/bin/bash

# AI Resume Screening Tool Setup Script
# This script sets up the development environment for the AI Resume Screening Tool

set -e

echo "🚀 Setting up AI Resume Screening Tool..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not work without Docker."
    else
        print_success "Docker $(docker --version) is installed"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose is not installed. Some features may not work without Docker Compose."
    else
        print_success "Docker Compose $(docker-compose --version) is installed"
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_warning "Python 3 is not installed. ML service features may not work."
    else
        print_success "Python $(python3 --version) is installed"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p uploads/{pdfs,docx,docs,others}
    mkdir -p logs
    mkdir -p frontend/src
    mkdir -p ml-service/{models,data,logs}
    mkdir -p docker/{postgres,mongodb,nginx}
    
    print_success "Directories created successfully"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Backend dependencies installed"
    else
        print_error "package.json not found in backend directory"
        exit 1
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    else
        print_warning "Frontend directory or package.json not found"
    fi
}

# Install ML service dependencies
install_ml_deps() {
    print_status "Installing ML service dependencies..."
    
    if [ -d "ml-service" ] && [ -f "ml-service/requirements.txt" ]; then
        cd ml-service
        
        # Create virtual environment if Python is available
        if command -v python3 &> /dev/null; then
            python3 -m venv venv
            source venv/bin/activate
            pip install --upgrade pip
            pip install -r requirements.txt
            print_success "ML service dependencies installed"
        else
            print_warning "Python 3 not available, skipping ML service setup"
        fi
        
        cd ..
    else
        print_warning "ML service directory or requirements.txt not found"
    fi
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        cp env.example .env
        print_success "Environment file created from template"
        print_warning "Please edit .env file with your configuration"
    else
        print_warning ".env file already exists"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if Docker is available
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        print_status "Starting database services with Docker..."
        docker-compose up -d postgres redis mongodb
        
        # Wait for services to be ready
        print_status "Waiting for database services to be ready..."
        sleep 10
        
        # Run database migrations
        print_status "Running database migrations..."
        npm run migrate
        
        print_success "Database setup completed"
    else
        print_warning "Docker not available, skipping database setup"
        print_warning "Please manually start PostgreSQL, Redis, and MongoDB"
    fi
}

# Build the application
build_application() {
    print_status "Building the application..."
    
    # Build backend
    print_status "Building backend..."
    npm run build
    
    # Build frontend
    if [ -d "frontend" ]; then
        print_status "Building frontend..."
        cd frontend
        npm run build
        cd ..
    fi
    
    print_success "Application built successfully"
}

# Setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    if [ -d ".git" ]; then
        # Install husky if available
        if [ -f "package.json" ] && grep -q "husky" package.json; then
            npm run prepare
            print_success "Git hooks configured"
        else
            print_warning "Husky not configured, skipping Git hooks setup"
        fi
    else
        print_warning "Not a Git repository, skipping Git hooks setup"
    fi
}

# Create initial data
create_initial_data() {
    print_status "Creating initial data..."
    
    # Check if database is available
    if command -v docker &> /dev/null && docker ps | grep -q "postgres"; then
        print_status "Seeding database with initial data..."
        npm run seed
        print_success "Initial data created"
    else
        print_warning "Database not available, skipping initial data creation"
    fi
}

# Main setup function
main() {
    echo "=========================================="
    echo "  AI Resume Screening Tool Setup"
    echo "=========================================="
    echo ""
    
    check_requirements
    create_directories
    setup_env
    install_backend_deps
    install_frontend_deps
    install_ml_deps
    setup_database
    build_application
    setup_git_hooks
    create_initial_data
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Start the application: npm run dev"
    echo "3. Access the application at http://localhost:3001"
    echo ""
    echo "For more information, see the README.md file"
    echo ""
}

# Run main function
main "$@" 