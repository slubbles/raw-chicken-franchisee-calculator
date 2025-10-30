#!/bin/bash

# Startup Script - Run both backend and frontend servers
# This script starts both servers in parallel

echo "🚀 Starting Franchise Reorder Calculator..."
echo ""

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
pkill -f "nodemon" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 1

# Start backend in background
echo "📦 Starting backend server (port 3001)..."
cd backend && PORT=3001 npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo "🎨 Starting frontend server (port 3000)..."
cd ../frontend && npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for servers to initialize
sleep 3

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "📡 Backend:  http://localhost:3001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "📋 Codespaces URLs:"
echo "   Backend:  https://supernatural-haunting-949rv9wpq95hpxp6-3001.app.github.dev"
echo "   Frontend: https://supernatural-haunting-949rv9wpq95hpxp6-3000.app.github.dev"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "⏹️  To stop: Run ./stop.sh or press Ctrl+C twice"
echo ""

# Keep script running
wait
