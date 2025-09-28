# Noorah Startup Script
Write-Host "Starting Noorah..." -ForegroundColor Cyan

# Start backend in background
Write-Host "Starting backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoLogo", "-NoProfile", "-Command", "cd 'C:\000babysitting app - Copy\backend'; npm run start:dev" -WindowStyle Hidden

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoLogo", "-NoProfile", "-Command", "cd 'C:\000babysitting app - Copy\frontend'; npx expo start --web --port 3000" -WindowStyle Hidden

Write-Host "`nNoorah is starting up!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nGive it a few moments to fully start..." -ForegroundColor Yellow
