#!/bin/bash

# NannyRadar Local Development Setup Script
# This script will set up the complete local development environment

set -e

echo "🚀 Setting up NannyRadar Local Development Environment"
echo "=================================================="

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

# Check if required software is installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) is installed"
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL 14+ from https://www.postgresql.org/download/"
        exit 1
    fi
    print_success "PostgreSQL is installed"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git from https://git-scm.com/"
        exit 1
    fi
    print_success "Git is installed"
    
    # Check Expo CLI
    if ! command -v expo &> /dev/null; then
        print_warning "Expo CLI is not installed. Installing..."
        npm install -g @expo/cli
    fi
    print_success "Expo CLI is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd babysitting-app
    npm install
    cd ..
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Create databases
    if createdb nannyradar 2>/dev/null; then
        print_success "Created nannyradar database"
    else
        print_warning "Database nannyradar already exists"
    fi
    
    if createdb nannyradar_test 2>/dev/null; then
        print_success "Created nannyradar_test database"
    else
        print_warning "Database nannyradar_test already exists"
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    cd backend
    npm run migration:run
    cd ..
    
    # Seed database
    print_status "Seeding database with test data..."
    cd backend
    npm run seed
    cd ..
    
    print_success "Database setup completed"
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        cat > backend/.env << EOF
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/nannyradar

# JWT
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development

# Server
PORT=3001
NODE_ENV=development

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (optional for development)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Security
ENCRYPTION_KEY=your-32-byte-encryption-key-for-dev
EOF
        print_success "Created backend/.env"
    else
        print_warning "backend/.env already exists"
    fi
    
    # Frontend .env
    if [ ! -f babysitting-app/.env ]; then
        cat > babysitting-app/.env << EOF
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3001

# Google Maps (optional)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Firebase (optional)
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EOF
        print_success "Created babysitting-app/.env"
    else
        print_warning "babysitting-app/.env already exists"
    fi
}

# Display credentials
show_credentials() {
    echo ""
    echo "🔑 Admin Testing Credentials"
    echo "============================"
    echo ""
    echo "Admin Account:"
    echo "  Email: admin@nannyradar.com"
    echo "  Password: admin123"
    echo "  Role: ADMIN"
    echo ""
    echo "Parent Test Accounts:"
    echo "  Email: sarah.johnson@example.com"
    echo "  Password: password123"
    echo "  Role: PARENT"
    echo ""
    echo "  Email: mike.chen@example.com"
    echo "  Password: password123"
    echo "  Role: PARENT"
    echo ""
    echo "Sitter Test Accounts:"
    echo "  Email: emma.wilson@example.com"
    echo "  Password: password123"
    echo "  Role: SITTER"
    echo "  Hourly Rate: \$25"
    echo ""
    echo "  Email: james.rodriguez@example.com"
    echo "  Password: password123"
    echo "  Role: SITTER"
    echo "  Hourly Rate: \$30"
    echo ""
    echo "  Email: lisa.thompson@example.com"
    echo "  Password: password123"
    echo "  Role: SITTER"
    echo "  Hourly Rate: \$28"
    echo ""
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🚀 Next Steps"
    echo "============="
    echo ""
    echo "1. Start the backend server:"
    echo "   cd backend && npm run start:dev"
    echo ""
    echo "2. Start the frontend:"
    echo "   cd babysitting-app && npx expo start"
    echo ""
    echo "3. Access the application:"
    echo "   - Backend API: http://localhost:3001"
    echo "   - API Documentation: http://localhost:3001/api/docs"
    echo "   - Frontend: Scan QR code or press 'w' for web"
    echo ""
    echo "4. Test the application:"
    echo "   - Login with the provided credentials"
    echo "   - Test both parent and sitter sides"
    echo "   - Explore all features and security functions"
    echo ""
    echo "📱 Mobile Testing Options:"
    echo "  - Install Expo Go app on your phone"
    echo "  - Scan QR code from expo start"
    echo "  - Or use iOS Simulator (Mac) / Android Emulator"
    echo ""
}

# Main execution
main() {
    echo "Starting NannyRadar local development setup..."
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_database
    create_env_files
    show_credentials
    show_next_steps
    
    echo ""
    print_success "🎉 NannyRadar local development environment is ready!"
    echo ""
    echo "Happy testing! 🚀"
}

# Run main function
main "$@" 