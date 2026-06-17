@echo off
setlocal enabledelayedexpansion

:: JARVIS V5.0 One-Click Launcher for Windows
:: This script launches both backend and frontend services

echo Starting JARVIS V5.0 God Protocol...
echo.

:: Start Backend in a new PowerShell window
start "JARVIS Backend" powershell -NoExit -Command "cd /d %~dp0backend; echo Starting JARVIS Backend...; python -m uvicorn main:app --reload --port 8000; echo Backend process ended. Press Enter to close this window...; read"

:: Start Frontend in a new PowerShell window
start "JARVIS Frontend" powershell -NoExit -Command "cd /d %~dp0artifacts\jarvis-ui; echo Starting JARVIS Frontend...; pnpm run dev; echo Frontend process ended. Press Enter to close this window...; read"

:: Wait for servers to start
echo Waiting for services to initialize...
timeout /t 8 /nobreak >nul

:: Open Chrome to the frontend
echo Opening JARVIS Control Plane...
start chrome http://localhost:5173

echo JARVIS V5.0 is now running!
echo You can close this window - the backend and frontend will continue running.
echo.
pause
