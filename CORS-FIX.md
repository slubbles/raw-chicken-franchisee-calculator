# 🔧 CORS Fix for GitHub Codespaces

## Problem
The frontend (port 3000) can't connect to backend (port 3001) because of CORS policy.

## Solution: Make Port 3001 Public

### Method 1: Using VS Code Ports Panel
1. Open the **PORTS** tab (bottom panel in VS Code)
2. Find port **3001**
3. Right-click on it
4. Select **Port Visibility** → **Public**
5. Refresh your browser

### Method 2: Using CLI
```bash
gh codespace ports visibility 3001:public -c $CODESPACE_NAME
```

---

## Verification

After making port 3001 public, test it:

```bash
curl https://supernatural-haunting-949rv9wpq95hpxp6-3001.app.github.dev/api/health
```

You should see:
```json
{
  "status": "healthy",
  "message": "Backend is running"
}
```

---

## If Still Not Working

The backend CORS is already configured to accept all origins:
```javascript
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));
```

Both servers are running:
- ✅ Backend: http://localhost:3001 (needs to be public)
- ✅ Frontend: http://localhost:3000 (already public)

Once port 3001 is public, the CORS errors will disappear! 🎉
