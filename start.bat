@echo off
:: JARVIS V5.0 Startup Script for Windows
:: This script starts both backend and frontend servers

:: Start Backend Server
start "JARVIS Backend" powershell -NoExit -Command "cd backend; if (Test-Path venv) { .\venv\Scripts\activate } else { python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt }; uvicorn main:app --reload --port 8000"

:: Start Frontend Server
start "JARVIS Frontend" powershell -NoExit -Command "cd app/frontend; if not exist node_modules ( npm install ); npm run dev"

:: Wait for servers to start
timeout /t 15 /nobreak

:: Open browser - Next.js uses port 3000 by default
start http://localhost:3000
