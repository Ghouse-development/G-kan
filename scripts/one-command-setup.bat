@echo off
echo ========================================
echo G-kan One-Command Setup
echo ========================================
echo.

REM Check if Node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install

echo.
echo [2/5] Installing Supabase CLI...
call npm install -g supabase

echo.
echo [3/5] Linking to Supabase project...
call supabase login
call supabase link --project-ref dtdtexkwbirnpqkwzzxl

echo.
echo [4/5] Pushing database migrations...
call supabase db push

echo.
echo [5/5] Creating storage bucket...
call npm run setup:db

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. (Optional) Set OPENAI_API_KEY in .env.local
echo 2. Run: npm run dev
echo 3. Visit: http://localhost:3000
echo.
pause
