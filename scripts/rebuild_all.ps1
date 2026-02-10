param(
    [string]$RepoRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$NginxRoot = "C:\nginx",
    [string]$KafkaRoot = "C:\kafka",
    [string]$KafkaConfig = "C:\kafka\config\kraft\server.properties",
    [string]$NodePath = "C:\Program Files\nodejs",
    [bool]$StartAfterBuild = $true
)

$ErrorActionPreference = "Stop"

& "$PSScriptRoot\stop_all.ps1"
Start-Sleep -Seconds 2

# Полная реинициализация Kafka (очистка логов и формат storage)
Write-Host "Re-initializing Kafka storage..."
if (Test-Path "$KafkaRoot\kafka-logs") {
    Remove-Item "$KafkaRoot\kafka-logs" -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Force -Path "$KafkaRoot\kafka-logs" | Out-Null

if (Test-Path $KafkaConfig) {
    $storageCmd = Join-Path $KafkaRoot "bin\windows\kafka-storage.bat"
    if (Test-Path $storageCmd) {
        $uuid = & $storageCmd random-uuid
        $uuid = $uuid.Trim()
        Write-Host "Generated Kafka cluster UUID: $uuid"
        & $storageCmd format -t $uuid -c $KafkaConfig
    } else {
        Write-Warning "kafka-storage.bat not found at $storageCmd. Skipping Kafka format."
    }
} else {
    Write-Warning "Kafka config not found at $KafkaConfig. Skipping Kafka format."
}

& "$PSScriptRoot\build_all.ps1" -RepoRoot $RepoRoot -NginxRoot $NginxRoot -NodePath $NodePath

if ($StartAfterBuild) {
    & "$PSScriptRoot\start_all.ps1" -RepoRoot $RepoRoot -NginxRoot $NginxRoot -KafkaRoot $KafkaRoot -KafkaConfig $KafkaConfig
}
