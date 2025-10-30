# ✅ Pre-Deployment Checklist

Use this checklist before deploying to production.

## 🔍 Backend Verification

- [ ] ✅ CORS configured for production (whitelist frontend URL)
- [ ] ✅ Environment variables documented in `.env.example`
- [ ] ✅ Health check endpoints working (`/health`, `/api/health`)
- [ ] ✅ Database migrations ready (`npx prisma migrate deploy`)
- [ ] ✅ Railway configuration created (`railway.json`)
- [ ] ✅ Production scripts added to `package.json`

**Test locally:**
```bash
cd backend
npm run dev
curl http://localhost:3001/api/health
```

Expected: `{"status": "healthy", ...}`

---

## 🎨 Frontend Verification

- [ ] ✅ Vercel configuration created (`vercel.json`)
- [ ] ✅ API URL configurable via environment variable
- [ ] ✅ All pages working (home, orders, budgets, supplies, dashboard)
- [ ] ✅ Dark mode UI complete
- [ ] ✅ Mobile responsive design

**Test locally:**
```bash
cd frontend
npm run dev
# Open http://localhost:3000
# Test creating an order, viewing dashboard
```

---

## 🔐 Security Checklist

- [ ] ✅ `.env` files added to `.gitignore` (never commit secrets!)
- [ ] ✅ CORS whitelist configured (no `origin: true` in production)
- [ ] ✅ Security headers added in `vercel.json`
- [ ] ✅ Database credentials secure (use Supabase connection pooler)
- [ ] ✅ No API keys or secrets hardcoded in frontend

---

## 🚀 Deployment Steps

### Step 1: Setup Supabase (5 minutes)
- [ ] Create Supabase project
- [ ] Copy database connection string
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Test connection: Check Supabase dashboard

### Step 2: Deploy Backend to Railway (3 minutes)
- [ ] Create Railway project from GitHub
- [ ] Set root directory to `/backend`
- [ ] Add environment variables (DATABASE_URL, FRONTEND_URL, etc.)
- [ ] Deploy and get Railway URL
- [ ] Test: `https://your-backend.railway.app/api/health`

### Step 3: Deploy Frontend to Vercel (3 minutes)
- [ ] Create Vercel project from GitHub
- [ ] Set root directory to `/frontend`
- [ ] Add environment variable: `NEXT_PUBLIC_API_URL`
- [ ] Deploy and get Vercel URL
- [ ] Test: Open Vercel URL in browser

### Step 4: Update CORS (1 minute)
- [ ] Go back to Railway
- [ ] Update `FRONTEND_URL` with Vercel URL
- [ ] Redeploy backend

### Step 5: Enable CI/CD (2 minutes)
- [ ] Get Railway token
- [ ] Get Vercel token, org ID, project ID
- [ ] Add GitHub secrets
- [ ] Push to main to trigger workflow

---

## ✅ Post-Deployment Tests

### Frontend Tests
- [ ] Homepage loads correctly
- [ ] Navigation cards clickable
- [ ] Backend status shows "Connected"
- [ ] Can create new order
- [ ] Orders list displays
- [ ] Budget setup works
- [ ] Dashboard shows stats
- [ ] Supplies inventory loads

### Backend Tests
- [ ] Health check: `GET /api/health` → 200 OK
- [ ] Database test: `GET /api/db-test` → Shows table counts
- [ ] Create order: `POST /api/orders` → 201 Created
- [ ] Get orders: `GET /api/orders` → Returns array
- [ ] Get budgets: `GET /api/budgets` → Returns array

### Integration Tests
- [ ] Frontend can fetch orders from backend
- [ ] Form submissions save to database
- [ ] Dashboard loads real data
- [ ] No CORS errors in browser console

---

## 🐛 Troubleshooting

### "Failed to connect to backend"
1. Check Railway URL is correct in Vercel env vars
2. Check Railway service is running (not crashed)
3. Test health endpoint directly: `curl https://your-backend.railway.app/api/health`

### "CORS error" in browser
1. Check `FRONTEND_URL` in Railway matches Vercel URL exactly
2. No trailing slash in URLs
3. Check Railway logs for CORS errors
4. Redeploy backend after updating FRONTEND_URL

### "Database not connected"
1. Check `DATABASE_URL` in Railway is correct
2. Verify Supabase project is active (not paused)
3. Test in Supabase SQL Editor: `SELECT 1;`
4. Check Railway logs for database errors

### "Migrations failed"
1. Check Prisma schema is valid: `npx prisma validate`
2. Ensure `DATABASE_URL` uses connection pooler (port 6543)
3. Run manually: `npx prisma migrate deploy`
4. Check Railway build logs

---

## 📊 Monitoring

After deployment, monitor:

- [ ] Railway metrics (CPU, memory, requests)
- [ ] Vercel analytics (page views, performance)
- [ ] Supabase database size
- [ ] GitHub Actions workflow runs
- [ ] Error logs (Railway + Vercel)

**Set up alerts:**
- Railway: Enable email alerts for crashes
- Vercel: Enable deployment notifications
- Supabase: Monitor database usage

---

## 🎉 Launch Checklist

Ready to go live? Final checks:

- [ ] All tests passing
- [ ] Health checks green
- [ ] No errors in logs
- [ ] CORS working correctly
- [ ] Database connected
- [ ] CI/CD pipeline working
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

**You're ready to launch!** 🚀

Share your app: `https://your-app.vercel.app`
