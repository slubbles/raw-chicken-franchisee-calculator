#!/bin/bash
# Development Startup Script
# Starts both frontend and backend servers

echo "🐔 Starting Calamias Fried Chicken Order Calculator..."
echo ""

# Check if ports are already in use
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Backend already running on port 3001"
else
    echo "🔧 Starting backend server (port 3001)..."
    cd backend
    npm run dev > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "   Backend PID: $BACKEND_PID"
    cd ..
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Frontend already running on port 3000"
else
    echo "🎨 Starting frontend server (port 3000)..."
    cd frontend
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "   Frontend PID: $FRONTEND_PID"
    cd ..
fi

echo ""
echo "⏳ Waiting for servers to start..."
sleep 8

echo ""
echo "✅ Development environment ready!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend:  http://localhost:3001/api"
echo "❤️  Health:   http://localhost:3001/api/health"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend/backend.log"
echo "   Frontend: tail -f frontend/frontend.log"
echo ""
echo "🛑 To stop: pkill -f 'npm run dev'"
echo ""
