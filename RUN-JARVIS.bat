@echo off
:: JARVIS V5.0 Quick Start Script

:: Start Backend Server
start "JARVIS Backend" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Start Frontend Server
start "JARVIS Frontend" cmd /k "cd app\frontend && npm run dev"

:: Wait for servers to start
timeout /t 10 /nobreak

:: Open browser
start http://localhost:3000
