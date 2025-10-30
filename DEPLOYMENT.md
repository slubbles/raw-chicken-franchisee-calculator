# 🚀 Deployment Guide - Option A: Vercel + Railway + Supabase

Complete step-by-step guide to deploy your Calamias Fried Chicken Order Calculator to production.

---

## 📋 **Prerequisites**

- GitHub account (you have this!)
- Vercel account (free tier: https://vercel.com/signup)
- Railway account (free tier: https://railway.app)
- Supabase account (free tier: https://supabase.com)

---

## 🗄️ **Step 1: Setup Supabase Database**

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Name**: `calamias-calculator`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users (e.g., Southeast Asia)
4. Click **"Create new project"** (takes ~2 minutes)

### 1.2 Get Database Connection String
1. In your Supabase project, go to **Settings** → **Database**
2. Scroll to **"Connection string"** section
3. Select **"URI"** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. **Save this URL** - you'll need it for Railway!

### 1.3 Run Database Migrations
1. Open your `.env` file in the backend folder
2. Replace `DATABASE_URL` with your Supabase URL:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
   ```
3. Run migrations from your terminal:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
4. ✅ Your database schema is now live on Supabase!

---

## 🚂 **Step 2: Deploy Backend to Railway**

### 2.1 Create Railway Project
1. Go to https://railway.app
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Authorize Railway to access your GitHub
6. Select your repository: `raw-chicken-franchisee-calculator`

### 2.2 Configure Backend Service
1. Railway will detect your monorepo. Click **"Add Service"** → **"GitHub Repo"**
2. In the service settings:
   - **Root Directory**: `/backend`
   - **Build Command**: Leave default (Railway will use `npm install && npx prisma generate`)
   - **Start Command**: `npm run deploy` (this runs migrations + starts server)

### 2.3 Add Environment Variables
1. In your Railway service, click **"Variables"** tab
2. Add these variables:

   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   FRONTEND_URL=https://your-app.vercel.app
   ```

   **Important:** 
   - Replace `DATABASE_URL` with your Supabase URL from Step 1.2
   - For `FRONTEND_URL`, use placeholder for now - we'll update it after deploying frontend

3. Click **"Deploy"**

### 2.4 Get Backend URL
1. After deployment finishes (~2 minutes), click **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy your Railway URL (e.g., `https://your-backend.up.railway.app`)
4. **Save this URL** - you'll need it for Vercel!

### 2.5 Test Backend
Open: `https://your-backend.up.railway.app/api/health`

You should see:
```json
{
  "status": "healthy",
  "service": "Franchise Reorder Calculator API",
  "database": {
    "status": "connected",
    "version": "PostgreSQL 15.x..."
  }
}
```

✅ Backend is live!

---

## 🎨 **Step 3: Deploy Frontend to Vercel**

### 3.1 Create Vercel Project
1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `raw-chicken-franchisee-calculator`
4. Vercel will detect Next.js automatically

### 3.2 Configure Project Settings
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: Click **"Edit"** and set to `frontend`
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)

### 3.3 Add Environment Variables
Click **"Environment Variables"** and add:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

**Replace** `your-backend.up.railway.app` with your Railway URL from Step 2.4

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait ~2 minutes for build to complete
3. Copy your Vercel URL (e.g., `https://calamias-calculator.vercel.app`)

### 3.5 Update Backend CORS
Now go back to Railway:
1. Open your backend service
2. Go to **"Variables"**
3. Update `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://calamias-calculator.vercel.app
   ```
4. Click **"Redeploy"** (this restarts backend with new CORS settings)

### 3.6 Test Frontend
1. Open your Vercel URL: `https://calamias-calculator.vercel.app`
2. You should see the homepage with all navigation cards
3. Click **"Create New Order"** - form should load
4. Check backend status card - should show ✅ Connected

✅ Frontend is live!

---

## 🤖 **Step 4: Setup GitHub Actions CI/CD (Optional)**

### 4.1 Get Required Tokens

**Railway Token:**
1. Go to Railway → **Account Settings** → **Tokens**
2. Click **"Create Token"**
3. Name it: `GitHub Actions`
4. Copy the token

**Vercel Tokens:**
1. Go to Vercel → **Settings** → **Tokens**
2. Create new token: `GitHub Actions`
3. Copy the token
4. Go to your project → **Settings** → **General**
5. Copy **"Project ID"** and **"Organization ID"**

### 4.2 Add GitHub Secrets
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add:
   - `RAILWAY_TOKEN`: (from Railway)
   - `VERCEL_TOKEN`: (from Vercel)
   - `VERCEL_ORG_ID`: (from Vercel project settings)
   - `VERCEL_PROJECT_ID`: (from Vercel project settings)

### 4.3 Enable Workflow
The workflow is already created in `.github/workflows/deploy.yml`. It will:
- ✅ Test backend and frontend on every PR
- ✅ Auto-deploy to production on push to `main`
- ✅ Run database migrations automatically

**To trigger it:**
```bash
git add .
git commit -m "Enable production deployment"
git push origin main
```

Watch the deployment in GitHub → **Actions** tab!

---

## 🎯 **Step 5: Verify Everything Works**

### 5.1 Test Full Flow
1. Open your Vercel URL
2. Go to **"Create New Order"**
3. Fill in the form and submit
4. Check **"View All Orders"** - your order should appear
5. Go to **"Budget Setup"** - create a budget
6. Check **"Dashboard"** - stats should load

### 5.2 Check Health Endpoints
- Backend health: `https://your-backend.railway.app/api/health`
- Database test: `https://your-backend.railway.app/api/db-test`

---

## 📊 **Architecture Overview**

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel CDN     │  ← Frontend (Next.js)
│  + Edge Network │     https://your-app.vercel.app
└────────┬────────┘
         │ API calls
         ▼
┌─────────────────┐
│  Railway Server │  ← Backend (Express.js)
│  + Node.js      │     https://your-backend.railway.app
└────────┬────────┘
         │ SQL queries
         ▼
┌─────────────────┐
│  Supabase DB    │  ← PostgreSQL Database
│  + Backups      │     Managed, auto-backup
└─────────────────┘
```

---

## 🔧 **Environment Variables Cheatsheet**

### Backend (.env on Railway)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env on Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

---

## 🐛 **Troubleshooting**

### Frontend shows "Failed to connect to backend"
1. Check Railway backend is running: `https://your-backend.railway.app/health`
2. Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Railway URL
3. Check CORS: Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly

### Database connection errors
1. Verify `DATABASE_URL` in Railway is correct
2. Check Supabase project is running (not paused)
3. Test connection: `https://your-backend.railway.app/api/db-test`

### Orders not saving
1. Check Railway logs for errors
2. Verify database migrations ran: `npx prisma migrate deploy`
3. Test Supabase connection in Supabase Studio

### GitHub Actions failing
1. Verify all secrets are set correctly in GitHub
2. Check Railway and Vercel tokens haven't expired
3. Review logs in GitHub Actions tab

---

## 💰 **Cost Estimation (Free Tiers)**

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| **Vercel** | 100GB bandwidth/month | ~5GB estimated | **$0** |
| **Railway** | $5 credit/month | ~$3-4/month | **$0-1** |
| **Supabase** | 500MB database, 2GB bandwidth | ~100MB + 1GB | **$0** |
| **GitHub** | Unlimited public repos | 1 repo | **$0** |

**Total: $0-1/month** for production deployment! 🎉

---

## 🚀 **Next Steps**

1. **Custom Domain**: Add your own domain in Vercel (e.g., `calculator.calamias.com`)
2. **Analytics**: Add Google Analytics or Vercel Analytics
3. **Error Tracking**: Setup Sentry for error monitoring
4. **Monitoring**: Use Railway metrics + Vercel analytics
5. **Backups**: Supabase auto-backs up daily (free tier: 7 days)

---

## 📚 **Useful Commands**

```bash
# Test backend locally
cd backend
npm run dev

# Test frontend locally
cd frontend
npm run dev

# Deploy backend manually
cd backend
git push  # GitHub Actions deploys automatically

# View Railway logs
railway logs --service backend

# View Vercel logs
vercel logs

# Run database migrations
cd backend
npx prisma migrate deploy
```

---

## 🎉 **You're Live!**

Your Calamias Fried Chicken Order Calculator is now:
- ✅ Deployed to production
- ✅ Using a real PostgreSQL database
- ✅ Auto-deploying on every push to main
- ✅ Monitored with health checks
- ✅ Secured with CORS whitelisting
- ✅ Scalable and fast

**Share your app:** `https://your-app.vercel.app`

Need help? Check the logs or reach out! 🐔
