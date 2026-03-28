@echo off

rem Change to project directory
cd /d d:\neiroQC\NeiroWork

echo Starting NeiroWork application...
echo ================================

echo Starting backend server...
start "Backend Server" cmd /k "npm run dev:backend"

echo Starting frontend server...
start "Frontend Server" cmd /k "npm run dev:frontend"

echo ================================
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo ================================
pause