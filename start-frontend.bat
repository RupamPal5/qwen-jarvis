@echo off
cd app/frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)
echo Starting Next.js development server...
npm run dev
