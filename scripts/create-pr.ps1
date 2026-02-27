param(
    [string]$Base = "main",
    [string]$Title = "",
    [string]$BodyFile = ".github/pull_request_template.md",
    [switch]$Draft
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) is not installed or not in PATH."
}

git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "This command must be run inside a git repository."
}

$currentBranch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    Write-Error "Could not determine current git branch."
}

if ($currentBranch -eq $Base) {
    Write-Error "Current branch is '$Base'. Switch to a feature branch before creating a PR."
}

if (-not (Test-Path -Path $BodyFile -PathType Leaf)) {
    Write-Error "Body file '$BodyFile' was not found."
}

if ([string]::IsNullOrWhiteSpace($Title)) {
    $Title = (git log -1 --pretty=%s).Trim()
}

if ([string]::IsNullOrWhiteSpace($Title)) {
    Write-Error "Could not infer PR title from latest commit. Provide -Title explicitly."
}

git remote get-url origin *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Git remote 'origin' is not configured."
}

git rev-parse --abbrev-ref --symbolic-full-name "@{u}" *> $null
if ($LASTEXITCODE -ne 0) {
    git push -u origin $currentBranch
}

git fetch origin $Base $currentBranch *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to fetch origin refs for '$Base' and '$currentBranch'."
}

$aheadCount = [int](git rev-list --count ("origin/" + $Base + "..origin/" + $currentBranch))
if ($aheadCount -eq 0) {
    Write-Error "No commits to open a PR: '$currentBranch' has no commits ahead of '$Base' on origin. The branch may already be merged."
}

$arguments = @(
    "pr", "create",
    "--base", $Base,
    "--title", $Title,
    "--body-file", $BodyFile
)

if ($Draft) {
    $arguments += "--draft"
}

gh @arguments
