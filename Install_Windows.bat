@echo off
pushd "%~dp0"
title Vector Toolkit Pro - 1-Click Installer
color 0A

echo ==========================================================
echo  Vector Toolkit Pro - 1-Click Installer
echo  Developed by Yahia Bin Zaman
echo ==========================================================
echo.

set "TARGET_DIR=%APPDATA%\Adobe\CEP\extensions\com.colorlab.vectortoolkit"

reg add "HKCU\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1
reg add "HKCU\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1
reg add "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1
reg add "HKCU\Software\Adobe\CSXS.12" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1
reg add "HKCU\Software\Adobe\CSXS.13" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1
reg add "HKCU\Software\Adobe\CSXS.14" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1
reg add "HKCU\Software\Adobe\CSXS.15" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1
reg add "HKCU\Software\Adobe\CSXS.16" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1

if not exist "%APPDATA%\Adobe\CEP\extensions" mkdir "%APPDATA%\Adobe\CEP\extensions" >nul 2>&1
if exist "%TARGET_DIR%" rmdir /s /q "%TARGET_DIR%" >nul 2>&1
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%" >nul 2>&1

xcopy /E /I /Y /Q "%~dp0*" "%TARGET_DIR%\" >nul 2>&1

echo ==========================================================
echo  [SUCCESS] Vector Toolkit Pro installed successfully!
echo  Restart Adobe Illustrator and open:
echo  Window ^> Extensions ^> Vector Toolkit Pro
echo ==========================================================
echo.
pause
popd
