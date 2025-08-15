Write-Host "Starting NannyRadar Test Backend..." -ForegroundColor Green
Write-Host "Working Directory: $(Get-Location)" -ForegroundColor Yellow

if (Test-Path "test-server.js") {
    Write-Host "Found test-server.js, starting server..." -ForegroundColor Green
    node test-server.js
} else {
    Write-Host "test-server.js not found!" -ForegroundColor Red
    Get-ChildItem -Name "*.js" | Write-Host
}

Read-Host "Press Enter to continue..."
