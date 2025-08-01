#!/bin/bash

# NannyRadar GitHub Repository Setup Script
# This script helps set up the GitHub repository for the NannyRadar project

echo "🚀 Setting up NannyRadar GitHub Repository..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI is not installed. You'll need to create the repository manually."
    echo "📝 Please create a new repository at: https://github.com/new"
    echo "   Repository name: nannyradar"
    echo "   Description: Smart babysitting platform connecting parents with trusted sitters"
    echo "   Make it Public or Private as needed"
    echo ""
    echo "After creating the repository, run these commands:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/nannyradar.git"
    echo "git branch -M main"
    echo "git push -u origin main"
else
    echo "✅ GitHub CLI found. Creating repository..."
    
    # Create GitHub repository
    gh repo create nannyradar \
        --description "Smart babysitting platform connecting parents with trusted sitters" \
        --public \
        --source=. \
        --remote=origin \
        --push
    
    if [ $? -eq 0 ]; then
        echo "✅ Repository created successfully!"
        echo "🌐 Repository URL: https://github.com/$(gh api user --jq .login)/nannyradar"
    else
        echo "❌ Failed to create repository. Please create it manually."
    fi
fi

echo ""
echo "📋 Next steps:"
echo "1. Set up GitHub Actions secrets for CI/CD"
echo "2. Configure branch protection rules"
echo "3. Set up issue templates"
echo "4. Configure project settings"
echo ""
echo "🔗 Repository will be available at: https://github.com/YOUR_USERNAME/nannyradar" 