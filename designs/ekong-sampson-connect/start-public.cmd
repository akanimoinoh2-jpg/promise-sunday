@echo off
REM Ekong Sampson Connect - run website + admin portal with public internet access
REM Usage: double-click this file (or run from a terminal).
REM It starts the backend, then opens a secure public tunnel.
REM Anyone on the internet can then open the printed HTTPS URL and sign in
REM with the team credentials (username: senator).

cd /d "%~dp0"

echo Starting Ekong Sampson Connect backend...
start "EkongSampson-Backend" /min cmd /c "node server.js"

timeout /t 2 /nobreak >nul

echo Starting public internet tunnel...
echo.
echo === SHARE THE HTTPS URL BELOW. The admin portal is at that URL /admin.html ===
echo.
npx --yes localtunnel --port 4000

echo.
echo Tunnel closed. Press any key to exit.
pause >nul
