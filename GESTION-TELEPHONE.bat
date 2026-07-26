@echo off
title FAALA GEUN - gestion depuis le telephone
cd /d "%~dp0"

echo.
echo   ==========================================================
echo     GESTION DEPUIS LE TELEPHONE
echo   ==========================================================
echo.
echo   Ton telephone doit etre sur le MEME Wi-Fi que cet ordinateur.
echo.
echo   L'adresse a taper sur le telephone s'affiche ci-dessous,
echo   avec le code d'acces. Laisse cette fenetre OUVERTE.
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   ERREUR : Node.js n'est pas installe.
  echo   Installe-le depuis https://nodejs.org puis relance ce fichier.
  echo.
  pause
  exit /b
)

node serveur.js --reseau
pause
