@echo off
title FAALA GEUN - autorisation Netlify (une seule fois)
cd /d "%~dp0"

echo.
echo   ==========================================================
echo     AUTORISATION NETLIFY - a faire UNE SEULE FOIS
echo   ==========================================================
echo.
echo   Une page va s'ouvrir dans ton navigateur.
echo   Clique sur le bouton "Authorize" (Autoriser).
echo.
echo   Ensuite tu pourras publier ton site d'un seul clic,
echo   depuis le bouton "Publier en ligne" de l'espace de gestion.
echo.
echo   ----------------------------------------------------------
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   ERREUR : Node.js n'est pas installe.
  echo   Installe-le depuis https://nodejs.org puis relance ce fichier.
  echo.
  pause
  exit /b
)

call npx --yes netlify-cli login

echo.
echo   ----------------------------------------------------------
echo.
echo   C'est fait. Ferme cette fenetre, puis lance GESTION.bat.
echo.
pause
