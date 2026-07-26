@echo off
title FAALA GEUN - application
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js n'est pas installe : ouverture simple de l'application.
  echo.
  start "" "%~dp0index.html"
  pause
  exit /b
)

start "" http://localhost:8080/index.html
node serveur.js
pause
