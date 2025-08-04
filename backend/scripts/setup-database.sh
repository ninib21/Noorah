#!/bin/bash

# NannyRadar Database Setup Script
echo "🚀 Setting up NannyRadar database..."

# Database configuration
DB_NAME="nannyradar_prod"
DB_USER="nannyradar_user"
DB_PASSWORD="secure_password_123"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Create database and user
echo "📦 Creating database and user..."

# Create user (if not exists)
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "User already exists"

# Create database (if not exists)
psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || echo "Database already exists"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -U postgres -c "ALTER USER $DB_USER CREATEDB;"

echo "✅ Database setup completed!"
echo "📊 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo ""
echo "🔧 Next steps:"
echo "1. Copy env.example to .env"
echo "2. Update .env with your database credentials"
echo "3. Run: npm run migration:run"
echo "4. Run: npm run seed"
echo "5. Run: npm run start:dev" 