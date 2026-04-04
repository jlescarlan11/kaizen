# migrate.ps1
# 1. Move to backend directory
Set-Location backend

# 2. Load .env into the shell environment
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match "^(?!\s*#)(.+)=(.+)$") {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim()
            Set-Item -Path "Env:$key" -Value $val
            Write-Host "Set $key" -ForegroundColor Gray
        }
    }
}

# 3. Run Flyway migration
Write-Host "Running Flyway Migration..." -ForegroundColor Cyan
mvn flyway:migrate
