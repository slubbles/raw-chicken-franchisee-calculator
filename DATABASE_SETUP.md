# 🗄️ Database Setup Guide - Supabase

## Step-by-Step Instructions

### 1️⃣ Create Supabase Account (2 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign in with GitHub (recommended) or email
4. Free tier is perfect for this project

---

### 2️⃣ Create New Project (3 minutes)

1. Click **"New Project"**
2. Fill in details:
   - **Name:** `calamias-chicken` (or your choice)
   - **Database Password:** Create strong password ⚠️ **SAVE THIS!**
   - **Region:** Southeast Asia (Singapore) - closest to Philippines
   - **Pricing Plan:** Free
3. Click **"Create new project"**
4. ⏳ Wait 2-3 minutes for project setup

---

### 3️⃣ Get Database Connection String (1 minute)

1. In your Supabase project dashboard:
   - Click **⚙️ Settings** (bottom left)
   - Click **"Database"** tab
   - Scroll to **"Connection string"** section
   - Select **"URI"** tab
   - Copy the connection string

2. It looks like this:
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

3. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with your actual password

---

### 4️⃣ Update Backend Environment (30 seconds)

Once you have your connection string:

**Tell me:** "I have the connection string"

Then I'll help you:
1. Update `backend/.env` file
2. Run database migrations
3. Seed sample data
4. Test the connection

---

## ✅ After Setup You'll Have:

- ✅ Live PostgreSQL database (hosted by Supabase)
- ✅ 5 tables (budgets, orders, bag_weights, costs, supplies)
- ✅ Sample data to test with
- ✅ Fully functional app
- ✅ Free tier (500MB storage, enough for years of orders!)

---

## 🆘 Need Help?

**Common Issues:**

1. **Can't find connection string?**
   - Settings → Database → Connection string → URI tab

2. **Password doesn't work?**
   - Make sure you replaced `[YOUR-PASSWORD]` with actual password
   - No spaces, use the exact password from step 2

3. **Want to reset password?**
   - Settings → Database → "Database password" section → Reset

---

## 📝 Current Status:

- ✅ Frontend running (port 3000)
- ✅ Backend running (port 3001)
- ✅ Prisma schema updated for PostgreSQL
- ⏳ **Waiting for:** Your Supabase connection string

**Let me know when you're ready!** 🚀
