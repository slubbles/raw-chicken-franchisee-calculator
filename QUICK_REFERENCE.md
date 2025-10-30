# 🚀 Quick Deployment Reference Card

Save this for quick reference during deployment!

---

## 📋 Environment Variables

### Backend (Railway)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

---

## 🔗 Important URLs

| Service | URL Pattern | Example |
|---------|-------------|---------|
| **Supabase DB** | `pooler.supabase.com:6543` | Use connection pooler |
| **Railway Backend** | `your-backend.railway.app` | Get from Railway dashboard |
| **Vercel Frontend** | `your-app.vercel.app` | Get from Vercel dashboard |

---

## ⚡ Quick Commands

```bash
# Test backend locally
cd backend && npm run dev
curl http://localhost:3001/api/health

# Test frontend locally  
cd frontend && npm run dev

# Run database migrations
cd backend && npx prisma migrate deploy

# Generate Prisma client
cd backend && npx prisma generate

# Build frontend
cd frontend && npm run build
```

---

## 🔍 Health Check Endpoints

```bash
# Simple health check
curl https://your-backend.railway.app/health

# Detailed health check
curl https://your-backend.railway.app/api/health

# Database test
curl https://your-backend.railway.app/api/db-test
```

---

## 📦 Deployment Order

1. **Supabase** → Create database (5 min)
2. **Railway** → Deploy backend (3 min)
3. **Vercel** → Deploy frontend (3 min)
4. **Update** → CORS in Railway (1 min)
5. **Test** → All endpoints working (2 min)

**Total: ~15 minutes**

---

## 🎯 GitHub Secrets (for CI/CD)

Add these in: **GitHub repo → Settings → Secrets → Actions**

```
RAILWAY_TOKEN          (from Railway account settings)
VERCEL_TOKEN           (from Vercel account settings)
VERCEL_ORG_ID          (from Vercel project settings)
VERCEL_PROJECT_ID      (from Vercel project settings)
```

---

## 🐛 Quick Troubleshooting

### CORS Error?
✅ Update `FRONTEND_URL` in Railway to exact Vercel URL (no trailing slash)

### Database Error?
✅ Check `DATABASE_URL` uses port 6543 (pooler, not 5432)

### Can't Connect?
✅ Verify Railway and Vercel are both deployed and running

### Migrations Failed?
✅ Run manually: `cd backend && npx prisma migrate deploy`

---

## 📊 Cost Summary

- **Vercel**: $0 (Hobby tier)
- **Railway**: $0 (with $5 credit)
- **Supabase**: $0 (Free tier)
- **GitHub**: $0 (Free tier)

**Total: $0/month** 🎉

---

## 🎓 Support Resources

- **Deployment Guide**: `DEPLOYMENT.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Complete Summary**: `DEPLOYMENT_COMPLETE.md`
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs

---

**Save this file for quick reference!** 📌
