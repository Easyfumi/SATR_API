param(
    [string]$RunDir = (Join-Path (Split-Path -Parent $PSScriptRoot) ".run")
)

$ErrorActionPreference = "Stop"

function Stop-ProcessFromPid {
    param([string]$Name, [string]$PidFile)
    if (-not (Test-Path $PidFile)) {
        Write-Host "$Name not running (pid file not found)."
        return
    }
    $pid = Get-Content $PidFile -ErrorAction SilentlyContinue
    if ($pid) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "$Name stopped. PID: $pid"
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

Stop-ProcessFromPid -Name "backend_monolithic" -PidFile (Join-Path $RunDir "backend_monolithic.pid")
Stop-ProcessFromPid -Name "notification_microservice" -PidFile (Join-Path $RunDir "notification_microservice.pid")
Stop-ProcessFromPid -Name "Kafka" -PidFile (Join-Path $RunDir "kafka.pid")

# Stop nginx
Stop-Process -Name nginx -Force -ErrorAction SilentlyContinue
Write-Host "nginx stopped."
