# NannyRadar GitHub Repository Setup Script (PowerShell)
# This script helps set up the GitHub repository for the NannyRadar project

Write-Host "🚀 Setting up NannyRadar GitHub Repository..." -ForegroundColor Green

# Check if git is installed
try {
    git --version | Out-Null
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if GitHub CLI is installed
try {
    gh --version | Out-Null
    Write-Host "✅ GitHub CLI is installed" -ForegroundColor Green
    
    Write-Host "Creating GitHub repository..." -ForegroundColor Yellow
    
    # Create GitHub repository
    gh repo create nannyradar `
        --description "Smart babysitting platform connecting parents with trusted sitters - NannyRadar" `
        --public `
        --source=. `
        --remote=origin `
        --push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Repository created successfully!" -ForegroundColor Green
        
        # Get the repository URL
        $username = gh api user --jq .login
        Write-Host "🌐 Repository URL: https://github.com/$username/nannyradar" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to create repository. Please create it manually." -ForegroundColor Red
    }
    
} catch {
    Write-Host "⚠️  GitHub CLI is not installed. You'll need to create the repository manually." -ForegroundColor Yellow
    Write-Host "📝 Please create a new repository at: https://github.com/new" -ForegroundColor White
    Write-Host "   Repository name: nannyradar" -ForegroundColor White
    Write-Host "   Description: Smart babysitting platform connecting parents with trusted sitters - NannyRadar" -ForegroundColor White
    Write-Host "   Make it Public or Private as needed" -ForegroundColor White
    Write-Host ""
    Write-Host "After creating the repository, run these commands:" -ForegroundColor White
    Write-Host "git remote add origin https://github.com/YOUR_USERNAME/nannyradar.git" -ForegroundColor Cyan
    Write-Host "git branch -M main" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Set up GitHub Actions secrets for CI/CD" -ForegroundColor White
Write-Host "2. Configure branch protection rules" -ForegroundColor White
Write-Host "3. Set up issue templates" -ForegroundColor White
Write-Host "4. Configure project settings" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Repository will be available at: https://github.com/YOUR_USERNAME/nannyradar" -ForegroundColor Cyan 