@echo off
pushd "%~dp0"
title ColorLab Forma Setup Pro - 1-Click Installer
color 0A

echo ==========================================================
echo  ColorLab Forma Setup Pro - 1-Click Installer (Windows)
echo  Developed by Yahia Bin Zaman
echo ==========================================================
echo.

set "TARGET_DIR=%APPDATA%\Adobe\CEP\extensions\com.colorlab.formasetup"

for %%V in (9 10 11 12 13 14 15 16) do (
    reg add "HKCU\Software\Adobe\CSXS.%%V" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1
)

if not exist "%APPDATA%\Adobe\CEP\extensions" mkdir "%APPDATA%\Adobe\CEP\extensions" >nul 2>&1
if exist "%TARGET_DIR%" rmdir /s /q "%TARGET_DIR%" >nul 2>&1

xcopy /E /I /H /Y /Q "%~dp0*" "%TARGET_DIR%" >nul 2>&1

:: Copy standalone script to Illustrator presets if present
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

echo ==========================================================
echo  [SUCCESS] ColorLab Forma Setup Pro installed successfully!
echo  Restart Adobe Illustrator and open:
echo  Window ^> Extensions ^> ColorLab Forma Setup Pro
echo ==========================================================
echo.
pause
popd
