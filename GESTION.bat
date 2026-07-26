@echo off
title FAALA GEUN - Espace de gestion
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   ERREUR : Node.js n'est pas installe sur cet ordinateur.
  echo   Sans lui, l'enregistrement direct est impossible.
  echo.
  echo   Installe-le depuis https://nodejs.org puis relance ce fichier.
  echo.
  pause
  exit /b
)

start "" http://localhost:8080/admin.html
node serveur.js
pause
