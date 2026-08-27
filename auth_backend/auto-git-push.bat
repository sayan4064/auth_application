@echo off

cd /d "C:\Users\sayan\Downloads\auth_application"

echo ========================================
echo Automatic GitHub Push
echo ========================================
echo.

git status

echo.
echo Adding changes...
git add .

git diff --cached --quiet

if %errorlevel%==0 (
    echo.
    echo No changes to commit.
    exit /b 0
)

echo.
echo Creating commit...
git commit -m "Auto backup"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Automatic push completed.
echo ========================================
