# Kaizen Migration Script
# Loads .env and runs Flyway safely

if (Test-Path ".env") {
    Write-Host "Loading credentials from .env..." -ForegroundColor Cyan
    Get-Content .env | ForEach-Object {
        if ($_ -match "^(?!\s*#)(.+)=(.+)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "Env:$name" -Value $value
        }
    }
}

Write-Host "Running Flyway Migration..." -ForegroundColor Green
mvn flyway:migrate
