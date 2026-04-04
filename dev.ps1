# dev.ps1 - Development script for Kaizen
# Loads .env variables and runs Maven or Docker commands

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$CommandArgs
)

# 1. Load .env file (if it exists)
$envFile = "backend/.env"
if (Test-Path $envFile) {
    Write-Host "Loading environment from $envFile..." -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        # Skip empty lines and comments
        if ($_ -match "^(?!\s*#)(.+)=(.+)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Set for current session
            Set-Item -Path "Env:$key" -Value $value
        }
    }
} else {
    Write-Warning "$envFile not found. Proceeding with default environment."
}

# 2. If no command is provided, default to starting Docker and Spring Boot
if ($null -eq $CommandArgs -or $CommandArgs.Count -eq 0) {
    Write-Host "No command specified. Starting Docker Compose and Spring Boot..." -ForegroundColor Green
    Set-Location backend
    docker compose up -d
    ./mvnw spring-boot:run
} else {
    # 3. Execute the passed command
    Write-Host "Executing: $($CommandArgs -join ' ')" -ForegroundColor Green
    Set-Location backend
    & $CommandArgs
}
