@echo off
echo ================================================
echo   AI-Powered Data Insights Application
echo ================================================
echo.
echo Starting servers...
echo.

REM Start backend server in a new window
echo [1/2] Starting Backend Server (Port 8000)...
start "Backend Server - Port 8000" cmd /k "cd backend && python main.py"
timeout /t 3 /nobreak > nul

REM Start frontend server in a new window
echo [2/2] Starting Frontend Server (Port 3000)...
start "Frontend Server - Port 3000" cmd /k "python start_frontend.py"
timeout /t 2 /nobreak > nul

echo.
echo ================================================
echo   Servers Started Successfully!
echo ================================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend App: http://localhost:3000/insights.html
echo.
echo Opening application in your default browser...
timeout /t 3 /nobreak > nul
start http://localhost:3000/insights.html
echo.
echo To stop the servers, close the command windows.
echo.
pause
