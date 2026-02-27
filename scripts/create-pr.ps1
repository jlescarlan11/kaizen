param(
    [string]$Base = "main",
    [string]$Title = "",
    [string]$BodyFile = "",
    [switch]$Draft
)

$ErrorActionPreference = "Stop"
# Avoid treating stderr text from native tools (for example git fetch progress)
# as terminating PowerShell errors; rely on explicit exit code checks instead.
$PSNativeCommandUseErrorActionPreference = $false

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

if ([string]::IsNullOrWhiteSpace($BodyFile)) {
    if (Test-Path -Path ".github/.smart-pr-body.md" -PathType Leaf) {
        $BodyFile = ".github/.smart-pr-body.md"
    } else {
        $BodyFile = ".github/pull_request_template.md"
    }
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
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    git push -u origin $currentBranch 2>$null | Out-Null
    $pushUpstreamExitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorActionPreference
    if ($pushUpstreamExitCode -ne 0) {
        Write-Error "Failed to push and set upstream for '$currentBranch'."
    }
}

# Always push current local commits before comparing remote refs.
$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
git push origin $currentBranch 2>$null | Out-Null
$pushExitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference
if ($pushExitCode -ne 0) {
    Write-Error "Failed to push '$currentBranch' to origin."
}

$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
git fetch origin $Base $currentBranch 2>$null | Out-Null
$fetchExitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference
if ($fetchExitCode -ne 0) {
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
