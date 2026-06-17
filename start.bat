@echo off
:: JARVIS V5.0 Startup Script for Windows
:: This script starts both backend and frontend servers

:: Start Backend Server
start powershell -NoExit -Command "cd backend; if (Test-Path venv) { .\venv\Scripts\activate } else { python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt }; uvicorn main:app --reload --port 8001"

:: Start Frontend Server
start powershell -NoExit -Command "cd app/frontend; if (!(Test-Path node_modules)) { npm install }; npm run dev"

:: Wait for servers to start
timeout /t 10 /nobreak

:: Open browser
start http://localhost:3000
