@echo off

cd /d "C:\Users\sayan\OneDrive\Desktop\Spring_Boot\auth_application\auth_frontend"

echo ========================================
echo Automatic Frontend GitHub Push
echo ========================================
echo.

git add .

git diff --cached --quiet

if %errorlevel%==0 (
    echo No changes to commit.
    exit /b 0
)

git commit -m "Auto backup frontend"

git push origin main

echo.
echo ========================================
echo Frontend push completed
echo ========================================