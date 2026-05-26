@echo off
chcp 65001 >nul
echo ==========================================
echo   SnippetVault Web Preview Server
echo ==========================================
echo.
echo Starting local server at http://localhost:8080
echo Please keep this window open while previewing.
echo.

REM Check Python availability
python --version >nul 2>&1
if errorlevel 1 (
    echo [Error] Python not found. Please install Python 3 first.
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Start server in background and open browser
start /b python -m http.server 8080 >nul 2>&1
timeout /t 2 /nobreak >nul
start http://localhost:8080

REM Keep window open
echo.
echo Server is running. Press Ctrl+C to stop.
pause >nul
