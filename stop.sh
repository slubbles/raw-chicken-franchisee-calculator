#!/bin/bash

# Stop Script - Kill both backend and frontend servers

echo "⏹️  Stopping all servers..."

pkill -f "nodemon"
pkill -f "next dev"

sleep 1

echo "✅ All servers stopped!"
