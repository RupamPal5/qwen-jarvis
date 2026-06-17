start "JARVIS Backend" powershell -NoExit -Command "cd /d %~dp0backend &&
uvicorn main:app --reload --port 8000"



start "JARVIS Frontend" powershell -NoExit -Command "cd /d
%~dp0artifacts\jarvis-ui && npm run dev"