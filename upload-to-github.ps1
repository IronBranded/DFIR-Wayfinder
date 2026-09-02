<#
.SYNOPSIS
  Places the new DFIR Analysis Academy lesson files into a local repo clone and stages them with git.

.USAGE
  Unzip this package somewhere, then from inside that unzipped folder run:

    .\upload-to-github.ps1 -RepoPath "C:\path\to\your\Microsoft-DFIR-Wayfinder-clone"

  This does NOT commit or push. It copies files and runs `git add` so you can review
  `git status` / `git diff --staged` yourself before committing anything.

.WHAT IT DOES NOT DO
  It does not touch content/manifest.json. Apply the two patches in
  MANIFEST_PATCH_NOTES\ by hand first -- until you do, scripts\validate.py will
  correctly report these 8 new files as orphaned. That is expected, not a bug.
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$RepoPath,

    [switch]$SkipGitAdd
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $RepoPath)) {
    Write-Error "RepoPath '$RepoPath' does not exist."
    exit 1
}

$gitDir = Join-Path $RepoPath ".git"
if (-not (Test-Path $gitDir)) {
    Write-Error "'$RepoPath' doesn't look like a git repo root (no .git folder found there)."
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceContent = Join-Path $scriptDir "content"

if (-not (Test-Path $sourceContent)) {
    Write-Error "Expected a 'content' folder next to this script -- run it from inside the unzipped package."
    exit 1
}

Write-Host "Copying lesson files into $RepoPath\content\levels\ ..." -ForegroundColor Cyan
Copy-Item -Path $sourceContent -Destination $RepoPath -Recurse -Force

$newFiles = Get-ChildItem -Path $sourceContent -Recurse -File
Write-Host "Copied $($newFiles.Count) files:" -ForegroundColor Green
$newFiles | ForEach-Object { Write-Host "  $($_.FullName.Substring($sourceContent.Length))" }

if (-not $SkipGitAdd) {
    Push-Location $RepoPath
    git add "content/levels/03-powershell-persistence" "content/levels/06-cloud-identity-email-defender"
    Write-Host "`nStaged. git status:" -ForegroundColor Cyan
    git status
    Pop-Location
}

Write-Host "`n---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "NEXT STEPS (manual, on purpose):" -ForegroundColor Yellow
Write-Host "  1. Apply both patches in MANIFEST_PATCH_NOTES\ to content\manifest.json" -ForegroundColor Yellow
Write-Host "  2. cd `"$RepoPath`"; python3 scripts\validate.py   -- should now pass clean" -ForegroundColor Yellow
Write-Host "  3. git add content/manifest.json" -ForegroundColor Yellow
Write-Host "  4. git commit -m `"Add PowerShell Forensics set and Defender for Endpoint module`"" -ForegroundColor Yellow
Write-Host "  5. git push" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
