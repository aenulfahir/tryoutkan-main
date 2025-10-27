#!/bin/bash

# Deployment Script for Tryoutkan to EasyPanel
# This script automates the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_USER="your-username"
VPS_IP="your-vps-ip"
VPS_PATH="/var/www/tryoutkan"
DOMAIN="your-domain.com"

echo -e "${GREEN}Starting deployment process...${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_files() {
    print_status "Checking required files..."
    
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found!"
        exit 1
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found!"
        exit 1
    fi
    
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production not found. Creating from example..."
        cp .env.example .env.production
        print_warning "Please update .env.production with your production values!"
        exit 1
    fi
    
    print_status "All required files found."
}

# Build the application locally
build_local() {
    print_status "Building application locally..."
    
    # Clean previous build
    if [ -d "dist" ]; then
        rm -rf dist
    fi
    
    # Install dependencies
    npm ci
    
    # Build application
    npm run build
    
    print_status "Local build completed."
}

# Deploy to VPS
deploy_to_vps() {
    print_status "Deploying to VPS..."
    
    # Create directory on VPS if it doesn't exist
    ssh $VPS_USER@$VPS_IP "sudo mkdir -p $VPS_PATH && sudo chown $VPS_USER:$VPS_USER $VPS_PATH"
    
    # Copy files to VPS
    print_status "Copying files to VPS..."
    rsync -avz --exclude='node_modules' --exclude='.git' --exclude='dist' \
          --exclude='.env.local' --exclude='.env.development.local' \
          ./ $VPS_USER@$VPS_IP:$VPS_PATH/
    
    # Build and run on VPS
    print_status "Building and running on VPS..."
    ssh $VPS_USER@$VPS_IP "cd $VPS_PATH && \
        docker-compose down && \
        docker-compose build --no-cache && \
        docker-compose up -d"
    
    print_status "Deployment completed successfully!"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f -s http://$DOMAIN > /dev/null; then
        print_status "Application is running successfully!"
    else
        print_error "Health check failed! Application may not be running properly."
        exit 1
    fi
}

# Main execution
main() {
    print_status "Starting deployment of Tryoutkan to EasyPanel..."
    
    # Check configuration
    if [ "$VPS_USER" = "your-username" ] || [ "$VPS_IP" = "your-vps-ip" ] || [ "$DOMAIN" = "your-domain.com" ]; then
        print_error "Please update the configuration variables in this script!"
        exit 1
    fi
    
    check_files
    build_local
    deploy_to_vps
    health_check
    
    print_status "Deployment completed successfully!"
    print_status "Your application should now be available at: http://$DOMAIN"
}

# Run main function
main "$@"