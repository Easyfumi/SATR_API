param(
    [string]$RepoRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$NginxRoot = "C:\nginx",
    [string]$KafkaRoot = "C:\kafka",
    [string]$KafkaConfig = "C:\kafka\config\kraft\server.properties",
    [string]$RunDir = (Join-Path (Split-Path -Parent $PSScriptRoot) ".run"),
    [int]$KafkaReadyTimeoutSeconds = 60,
    [int]$KafkaReadyPollIntervalSeconds = 2
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

function Ensure-JarExists {
    param([string]$Name, [string]$JarPath)
    if (-not (Test-Path $JarPath)) {
        throw "$Name jar not found: $JarPath. Run scripts\build_all.ps1 first."
    }
}

function Wait-ForKafka {
    param(
        [int]$Port = 9092,
        [int]$TimeoutSeconds = 60,
        [int]$IntervalSeconds = 2
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    Write-Host "Waiting for Kafka on port $Port (timeout ${TimeoutSeconds}s)..."
    while ((Get-Date) -lt $deadline) {
        $listening = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
        if ($listening.Count -gt 0) {
            Write-Host "Kafka is ready on port $Port."
            return
        }
        Start-Sleep -Seconds $IntervalSeconds
    }
    throw "Kafka did not start listening on port $Port within ${TimeoutSeconds}s. Check Kafka logs and run scripts\rebuild_all.ps1 if storage is corrupted."
}

function Update-KafkaPidFile {
    param([string]$PidFile)
    $kafkaJava = Get-CimInstance Win32_Process -Filter "Name='java.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like '*kafka.Kafka*' } |
        Select-Object -First 1
    if ($kafkaJava) {
        $kafkaJava.ProcessId | Out-File $PidFile -Encoding ASCII
        Write-Host "Kafka PID file updated to Java process: $($kafkaJava.ProcessId)"
    } else {
        Write-Warning "Kafka Java process not found; PID file not updated."
    }
}

$kafkaPidFile = Join-Path $RunDir "kafka.pid"
$backendJar = "$RepoRoot\backend_monolithic\target\backend_monolithic-0.0.1-SNAPSHOT.jar"
$notificationJar = "$RepoRoot\notification_microservice\target\notification_microservice-0.0.1-SNAPSHOT.jar"

$existingListener = @(Get-NetTCPConnection -LocalPort 9092 -State Listen -ErrorAction SilentlyContinue)
if ($existingListener.Count -gt 0) {
    $ownerPid = ($existingListener | Select-Object -First 1).OwningProcess
    Write-Warning "Port 9092 is already in use (PID $ownerPid). Run scripts\stop_all.ps1 first."
}

Ensure-JarExists -Name "backend_monolithic" -JarPath $backendJar
Ensure-JarExists -Name "notification_microservice" -JarPath $notificationJar

# Start Kafka (KRaft)
$env:KAFKA_HEAP_OPTS = "-Xmx512M -Xms512M"
Start-ProcessWithPid `
    -Name "Kafka" `
    -FilePath "$KafkaRoot\bin\windows\kafka-run-class.bat" `
    -WorkingDirectory $KafkaRoot `
    -Arguments "kafka.Kafka `"$KafkaConfig`"" `
    -PidFile $kafkaPidFile

Wait-ForKafka -TimeoutSeconds $KafkaReadyTimeoutSeconds -IntervalSeconds $KafkaReadyPollIntervalSeconds
Update-KafkaPidFile -PidFile $kafkaPidFile

# Start backend_monolithic
Start-ProcessWithPid `
    -Name "backend_monolithic" `
    -FilePath "java" `
    -WorkingDirectory "$RepoRoot\backend_monolithic" `
    -Arguments "-jar `"$backendJar`"" `
    -PidFile (Join-Path $RunDir "backend_monolithic.pid")

# Start notification_microservice
Start-ProcessWithPid `
    -Name "notification_microservice" `
    -FilePath "java" `
    -WorkingDirectory "$RepoRoot\notification_microservice" `
    -Arguments "-jar `"$notificationJar`"" `
    -PidFile (Join-Path $RunDir "notification_microservice.pid")

# Start nginx
Start-Process -FilePath "$NginxRoot\nginx.exe" -WorkingDirectory $NginxRoot -WindowStyle Minimized
Write-Host "nginx started."
