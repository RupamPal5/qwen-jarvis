@echo off
:: JARVIS V5.0 Startup Script
:: This script launches the backend and frontend services for JARVIS V5.0

echo JARVIS V5.0 - Starting the God Protocol...
echo.

:: Run pre-flight checks
echo Running pre-flight checks...
python -m core.preflight
if %ERRORLEVEL% neq 0 (
    echo Pre-flight checks failed. Please fix the issues before starting JARVIS.
    pause
    exit /b 1
)
echo Pre-flight checks passed successfully.
echo.

:: Start backend service in a new PowerShell window
echo Starting backend service...
start "JARVIS Backend" powershell -NoExit -Command "cd /d %~dp0backend && echo Backend service running on http://localhost:8000 && uvicorn main:app --reload --port 8000"

:: Start frontend service in a new PowerShell window
echo Starting frontend service...
start "JARVIS Frontend" powershell -NoExit -Command "cd /d %~dp0artifacts\jarvis-ui && echo Frontend service running on http://localhost:5173 && npm run dev"

:: Wait for services to initialize
echo Waiting for services to initialize...
timeout /t 10 /nobreak >nul

:: Open browser to frontend
echo Opening JARVIS Control Plane in Chrome...
start chrome http://localhost:5173

echo JARVIS V5.0 is now running!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo The PowerShell windows will remain open. Close them to stop the services.
