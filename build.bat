@echo off
REM Build script for MERN Chat App (Windows)
REM Usage: build.bat [dev^|prod]

setlocal enabledelayedexpansion
set ENV=%1
if "!ENV!"=="" set ENV=dev

echo.
echo 🏗️  Building MERN Chat App (!ENV! mode)...
echo.

REM Build frontend
echo 📦 Building frontend...
cd client
call npm install
if !errorlevel! neq 0 (
  echo ❌ Frontend install failed
  exit /b 1
)

call npm run build
if !errorlevel! neq 0 (
  echo ❌ Frontend build failed
  exit /b 1
)
echo ✅ Frontend built successfully
cd ..

REM Backend is ready
echo.
echo ✅ Backend ready (no build needed)

echo.
echo 🎉 Build complete!
echo.
echo 📝 Next steps:
if "!ENV!"=="prod" (
  echo 1. Set environment variables in server\.env
  echo 2. Deploy backend to Render/Railway/Heroku
  echo 3. Update VITE_API_URL in client\.env
  echo 4. Deploy frontend to Vercel/Netlify
) else (
  echo 1. Start backend: cd server ^&^& npm run dev
  echo 2. Start frontend: cd client ^&^& npm run dev
  echo 3. Open http://localhost:5173
)

endlocal
