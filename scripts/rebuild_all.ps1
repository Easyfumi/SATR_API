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
& "$PSScriptRoot\build_all.ps1" -RepoRoot $RepoRoot -NginxRoot $NginxRoot -NodePath $NodePath

if ($StartAfterBuild) {
    & "$PSScriptRoot\start_all.ps1" -RepoRoot $RepoRoot -NginxRoot $NginxRoot -KafkaRoot $KafkaRoot -KafkaConfig $KafkaConfig
}
