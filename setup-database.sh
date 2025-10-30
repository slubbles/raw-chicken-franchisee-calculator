#!/bin/bash
# Database Setup Script
# Run this after you have your Supabase connection string

echo "🗄️  Database Setup for Calamias Fried Chicken Calculator"
echo "=========================================================="
echo ""

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=\"postgresql://postgres:" backend/.env 2>/dev/null; then
    echo "✅ DATABASE_URL found in backend/.env"
else
    echo "⚠️  DATABASE_URL not configured yet"
    echo ""
    echo "📝 Please update backend/.env with your Supabase connection string:"
    echo "   DATABASE_URL=\"postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres\""
    echo ""
    exit 1
fi

echo ""
echo "Step 1: Installing dependencies..."
cd backend
npm install

echo ""
echo "Step 2: Generating Prisma Client..."
npx prisma generate

echo ""
echo "Step 3: Running database migrations..."
echo "   This will create all 5 tables in your Supabase database"
npx prisma migrate deploy

echo ""
echo "Step 4: Seeding sample data..."
echo "   Adding a budget, sample orders, and supply tracking"
npm run prisma:seed

echo ""
echo "Step 5: Testing connection..."
sleep 2

# Test the API
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/db-test 2>/dev/null)

if [[ $HEALTH_RESPONSE == *"Database connected"* ]]; then
    echo "✅ Database connection successful!"
    echo ""
    echo "🎉 Setup Complete!"
    echo ""
    echo "📊 You now have:"
    echo "   • Live PostgreSQL database on Supabase"
    echo "   • 5 tables created (budgets, orders, bag_weights, costs, supplies)"
    echo "   • Sample data loaded"
    echo ""
    echo "🌐 Next steps:"
    echo "   1. Refresh your browser: http://localhost:3000"
    echo "   2. Navigate to 'Budgets' page"
    echo "   3. Create your first real budget!"
    echo ""
    echo "🔍 View your data:"
    echo "   • Supabase Dashboard: https://supabase.com/dashboard"
    echo "   • Prisma Studio: npm run prisma:studio"
    echo ""
else
    echo "❌ Database connection failed"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   1. Check your DATABASE_URL in backend/.env"
    echo "   2. Make sure you replaced [YOUR-PASSWORD] with actual password"
    echo "   3. Verify backend server is running: http://localhost:3001/api/health"
    echo ""
    echo "💡 Test manually:"
    echo "   cd backend && npx prisma migrate deploy"
    echo ""
fi

cd ..
