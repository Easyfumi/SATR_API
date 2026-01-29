param(
    [string]$RepoRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$NginxRoot = "C:\nginx",
    [string]$KafkaRoot = "C:\kafka",
    [string]$KafkaConfig = "C:\kafka\config\kraft\server.properties",
    [string]$RunDir = (Join-Path (Split-Path -Parent $PSScriptRoot) ".run")
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $RunDir | Out-Null

function Start-ProcessWithPid {
    param(
        [string]$Name,
        [string]$FilePath,
        [string]$WorkingDirectory,
        [string]$Arguments,
        [string]$PidFile
    )
    if (Test-Path $PidFile) {
        Write-Host "$Name already started (pid file exists): $PidFile"
        return
    }
    $proc = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $WorkingDirectory -PassThru -WindowStyle Minimized
    $proc.Id | Out-File $PidFile -Encoding ASCII
    Write-Host "$Name started. PID: $($proc.Id)"
}

# Start Kafka (KRaft)
$env:KAFKA_HEAP_OPTS = "-Xmx512M -Xms512M"
Start-ProcessWithPid `
    -Name "Kafka" `
    -FilePath "$KafkaRoot\bin\windows\kafka-run-class.bat" `
    -WorkingDirectory $KafkaRoot `
    -Arguments "kafka.Kafka `"$KafkaConfig`"" `
    -PidFile (Join-Path $RunDir "kafka.pid")

# Start backend_monolithic
Start-ProcessWithPid `
    -Name "backend_monolithic" `
    -FilePath "java" `
    -WorkingDirectory "$RepoRoot\backend_monolithic" `
    -Arguments "-jar `"$RepoRoot\backend_monolithic\target\backend_monolithic-0.0.1-SNAPSHOT.jar`"" `
    -PidFile (Join-Path $RunDir "backend_monolithic.pid")

# Start notification_microservice
Start-ProcessWithPid `
    -Name "notification_microservice" `
    -FilePath "java" `
    -WorkingDirectory "$RepoRoot\notification_microservice" `
    -Arguments "-jar `"$RepoRoot\notification_microservice\target\notification_microservice-0.0.1-SNAPSHOT.jar`"" `
    -PidFile (Join-Path $RunDir "notification_microservice.pid")

# Start nginx
Start-Process -FilePath "$NginxRoot\nginx.exe" -WorkingDirectory $NginxRoot -WindowStyle Minimized
Write-Host "nginx started."
