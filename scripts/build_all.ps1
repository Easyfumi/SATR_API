param(
    [string]$RepoRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$NginxRoot = "C:\nginx",
    [string]$NodePath = "C:\Program Files\nodejs"
)

$ErrorActionPreference = "Stop"

function Ensure-Command {
    param([string]$Name, [string]$Hint)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Command '$Name' not found. $Hint"
    }
}

Write-Host "Repo root: $RepoRoot"

# Ensure Node.js is available for frontend build
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    if (Test-Path $NodePath) {
        $env:Path += ";$NodePath"
    }
}
Ensure-Command "npm" "Install Node.js LTS or set -NodePath."

# Build backend_monolithic
Write-Host "Building backend_monolithic..."
Set-Location "$RepoRoot\backend_monolithic"
.\mvnw.cmd -DskipTests package

# Build notification_microservice
Write-Host "Building notification_microservice..."
Set-Location "$RepoRoot\notification_microservice"
.\mvnw.cmd -DskipTests package

# Build frontend and copy to nginx
Write-Host "Building frontend_v2..."
Set-Location "$RepoRoot\frontend_v2"
npm install
npm run build

$frontendBuild = "$RepoRoot\frontend_v2\build"
$nginxWebRoot = Join-Path $NginxRoot "www\frontend_v2\build"

Write-Host "Copying frontend build to $nginxWebRoot"
New-Item -ItemType Directory -Force -Path $nginxWebRoot | Out-Null
Remove-Item "$nginxWebRoot\*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$frontendBuild\*" -Destination $nginxWebRoot -Recurse -Force

Write-Host "Build completed."
