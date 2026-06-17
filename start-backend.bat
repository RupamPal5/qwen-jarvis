@echo off
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing dependencies...
pip install -r requirements.txt
echo Starting FastAPI server on port 8000...
uvicorn main:app --reload --port 8000
