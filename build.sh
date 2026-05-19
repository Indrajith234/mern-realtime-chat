#!/bin/bash
# Build script for MERN Chat App
# Usage: ./build.sh [dev|prod]

set -e

ENV=${1:-dev}

echo "🏗️ Building MERN Chat App ($ENV mode)..."

# Build frontend
echo ""
echo "📦 Building frontend..."
cd client
npm install
npm run build
echo "✅ Frontend built successfully"
cd ..

# Backend is ready (no build needed for Node.js)
echo ""
echo "✅ Backend ready (no build needed)"

echo ""
echo "🎉 Build complete!"
echo ""
echo "📝 Next steps:"
if [ "$ENV" = "prod" ]; then
  echo "1. Set environment variables in server/.env"
  echo "2. Deploy backend to Render/Railway/Heroku"
  echo "3. Update VITE_API_URL in client/.env"
  echo "4. Deploy frontend to Vercel/Netlify"
else
  echo "1. Start backend: cd server && npm run dev"
  echo "2. Start frontend: cd client && npm run dev"
  echo "3. Open http://localhost:5173"
fi
