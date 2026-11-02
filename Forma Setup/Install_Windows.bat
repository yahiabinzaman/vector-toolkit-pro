@echo off
pushd "%~dp0"
title ColorLab Forma Setup Pro - 1-Click Installer
color 0A

echo ==========================================================
echo  ColorLab Forma Setup Pro - 1-Click Installer (Windows)
echo  Developed by Yahia Bin Zaman ^| https://github.com/yahiabinzaman
echo ==========================================================
echo.

:: 1. Enable PlayerDebugMode for all CSXS versions
echo [1/3] Configuring Adobe CEP PlayerDebugMode in Registry...
for %%V in (9 10 11 12 13 14 15 16 17 18 19 20) do (
    reg add "HKCU\Software\Adobe\CSXS.%%V" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1
)

:: 2. Target Directory
echo [2/3] Deploying extension to Adobe CEP directory...
set "TARGET_DIR=%APPDATA%\Adobe\CEP\extensions\com.colorlab.formasetup"
if not exist "%APPDATA%\Adobe\CEP\extensions" mkdir "%APPDATA%\Adobe\CEP\extensions" >nul 2>&1
if exist "%TARGET_DIR%" rmdir /s /q "%TARGET_DIR%" >nul 2>&1

:: 3. Copy files
xcopy /E /I /H /Y /Q "%~dp0*" "%TARGET_DIR%" >nul 2>&1

:: 4. Copy standalone script to Illustrator presets if present
echo [3/3] Registering menu scripts...
if exist "%~dp0Forma_Setup_Pro_QuickRun.jsx" (
    for /d %%D in ("%PROGRAMFILES%\Adobe\Adobe Illustrator*") do (
        if exist "%%D\Presets" (
            for /d %%P in ("%%D\Presets\*") do (
                if exist "%%P\Scripts" (
                    copy /Y "%~dp0Forma_Setup_Pro_QuickRun.jsx" "%%P\Scripts\" >nul 2>&1
                )
            )
        )
    )
)

echo.
echo ==========================================================
echo  [SUCCESS] ColorLab Forma Setup Pro installed successfully!
echo  Restart Adobe Illustrator and open:
echo  Window ^> Extensions ^> ColorLab Forma Setup Pro
echo  (Or File ^> Scripts ^> Forma_Setup_Pro_QuickRun)
echo ==========================================================
echo.
pause
popd
