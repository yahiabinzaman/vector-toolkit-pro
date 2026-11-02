# ==============================================================================
# ColorLab Forma Setup Pro - Automated Installer for Windows (PowerShell)
# Developed by Yahia Bin Zaman | https://github.com/yahiabinzaman
# ==============================================================================

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ColorLab Forma Setup Pro - Automated Windows Installer   " -ForegroundColor Green
Write-Host " Developed by Yahia Bin Zaman                             " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Enable PlayerDebugMode in Windows Registry for Adobe CEP
Write-Host "[1/4] Configuring Adobe CEP PlayerDebugMode in Registry..." -ForegroundColor Gray
$csxsVersions = @(9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20)
foreach ($ver in $csxsVersions) {
    $regPath = "HKCU:\Software\Adobe\CSXS.$ver"
    if (!(Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name "PlayerDebugMode" -Value "1" -Type String -Force | Out-Null
}

# 2. Target Directory
$targetDir = "$env:APPDATA\Adobe\CEP\extensions\com.colorlab.formasetup"
$parentDir = "$env:APPDATA\Adobe\CEP\extensions"
if (!(Test-Path $parentDir)) {
    New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
}

# 3. Check if running locally or from web
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($scriptDir -and (Test-Path "$scriptDir\CSXS\manifest.xml")) {
    Write-Host "[2/4] Installing from local source files..." -ForegroundColor Gray
    if (Test-Path $targetDir) { Remove-Item -Recurse -Force $targetDir }
    Copy-Item -Path $scriptDir -Destination $targetDir -Recurse -Force
} else {
    Write-Host "[2/4] Downloading ColorLab Forma Setup Pro from GitHub..." -ForegroundColor Cyan
    $tempZip = "$env:TEMP\Forma-Setup-main.zip"
    $tempExtract = "$env:TEMP\Forma-Setup-extract"
    if (Test-Path $tempExtract) { Remove-Item -Recurse -Force $tempExtract }
    
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $url = "https://github.com/yahiabinzaman/Forma-Setup/archive/refs/heads/main.zip"
    Invoke-WebRequest -Uri $url -OutFile $tempZip -UseBasicParsing
    
    Write-Host "[3/4] Extracting and deploying extension..." -ForegroundColor Gray
    Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
    
    $extractedFolder = Get-ChildItem -Path $tempExtract | Select-Object -First 1
    if ($extractedFolder) {
        if (Test-Path $targetDir) { Remove-Item -Recurse -Force $targetDir }
        Copy-Item -Path $extractedFolder.FullName -Destination $targetDir -Recurse -Force
    }
    
    # Cleanup
    Remove-Item -Force $tempZip -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force $tempExtract -ErrorAction SilentlyContinue
}

# 4. Copy standalone JSX script to Illustrator Presets if available
Write-Host "[4/4] Registering standalone menu scripts..." -ForegroundColor Gray
$jsxSource = "$targetDir\Forma_Setup_Pro_QuickRun.jsx"
if (Test-Path $jsxSource) {
    $aiPaths = Get-ChildItem -Path "C:\Program Files\Adobe" -Filter "Adobe Illustrator*" -Directory -ErrorAction SilentlyContinue
    foreach ($ai in $aiPaths) {
        $presetScripts = Get-ChildItem -Path "$($ai.FullName)\Presets" -Recurse -Filter "Scripts" -Directory -ErrorAction SilentlyContinue
        foreach ($sDir in $presetScripts) {
            Copy-Item -Path $jsxSource -Destination $sDir.FullName -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [SUCCESS] ColorLab Forma Setup Pro installed successfully!" -ForegroundColor Green
Write-Host " Restart Adobe Illustrator and open:" -ForegroundColor Yellow
Write-Host " Window > Extensions > ColorLab Forma Setup Pro" -ForegroundColor White
Write-Host " (Or File > Scripts > Forma_Setup_Pro_QuickRun)" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

