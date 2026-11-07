@echo off
setlocal
cd /d "%~dp0.."

echo Ouverture des deux connexions...
start "DUCK - Supabase login" cmd /k "npx.cmd --yes supabase@latest login"
start "DUCK - Firebase login" cmd /k "npx.cmd --yes firebase-tools@latest login"

echo.
echo Termine les deux authentifications dans le navigateur, puis reviens dans OpenCode.
endlocal
