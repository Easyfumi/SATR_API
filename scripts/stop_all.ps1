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
    $processId = Get-Content $PidFile -ErrorAction SilentlyContinue
    if ($processId) {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Host "$Name stopped. PID: $processId"
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

function Stop-KafkaJavaProcesses {
    $kafkaProcesses = @(Get-CimInstance Win32_Process -Filter "Name='java.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like '*kafka.Kafka*' })
    if ($kafkaProcesses.Count -eq 0) {
        Write-Host "No Kafka Java processes found."
        return
    }
    foreach ($proc in $kafkaProcesses) {
        Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Host "Kafka Java process stopped. PID: $($proc.ProcessId)"
    }
}

Stop-ProcessFromPid -Name "backend_monolithic" -PidFile (Join-Path $RunDir "backend_monolithic.pid")
Stop-ProcessFromPid -Name "notification_microservice" -PidFile (Join-Path $RunDir "notification_microservice.pid")
Stop-ProcessFromPid -Name "Kafka" -PidFile (Join-Path $RunDir "kafka.pid")
Stop-KafkaJavaProcesses

# Stop nginx
Stop-Process -Name nginx -Force -ErrorAction SilentlyContinue
Write-Host "nginx stopped."
