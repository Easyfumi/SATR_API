param(
    [string]$RepoRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$NginxRoot = "C:\nginx",
    [string]$KafkaRoot = "C:\kafka",
    [string]$KafkaConfig = "C:\kafka\config\kraft\server.properties"
)

$ErrorActionPreference = "Stop"

& "$PSScriptRoot\stop_all.ps1"
Start-Sleep -Seconds 2
& "$PSScriptRoot\start_all.ps1" -RepoRoot $RepoRoot -NginxRoot $NginxRoot -KafkaRoot $KafkaRoot -KafkaConfig $KafkaConfig
