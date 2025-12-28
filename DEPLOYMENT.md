# IIN Platform - Deployment Guide

## 🚀 Automatic Deployment Setup

This project uses **automatic deployments** with zero manual intervention:

### Frontend (Vercel)
- **URL:** https://iinedu.vercel.app
- **Auto-deploys:** Every push to `main` branch
- **Files deployed:** HTML, CSS, JS from `/frontend` folder
- **Build time:** ~30 seconds

### Backend (Railway)
- **URL:** https://iin-production.up.railway.app
- **Auto-deploys:** Every push to `main` branch
- **Files deployed:** Node.js server from `/backend` folder
- **Build time:** ~2 minutes

---

## ✅ What's Configured

### Vercel Configuration (`vercel.json`)
- ✅ Static file serving
- ✅ Clean URLs (no `.html` extension needed)
- ✅ Proper routing for all pages
- ✅ Cache optimization for CSS/JS
- ✅ Security headers
- ✅ Ignores backend files (`.vercelignore`)

### Railway Configuration
- ✅ Automatic Node.js detection
- ✅ MySQL database connection
- ✅ Environment variables from Railway dashboard
- ✅ Auto-restart on crashes

---

## 🔧 How to Deploy Changes

### Option 1: Automatic (Recommended)
```bash
# Make your changes
git add .
git commit -m "Your change description"
git push origin main

# Wait 2-3 minutes
# ✅ Vercel deploys frontend automatically
# ✅ Railway deploys backend automatically
```

### Option 2: Manual Redeploy (If needed)

**Vercel:**
1. Go to https://vercel.com/dashboard
2. Select "iin" project
3. Click "Deployments" tab
4. Click "⋯" menu → "Redeploy"

**Railway:**
1. Go to https://railway.app/dashboard
2. Select "iin-production" project
3. Click "Deployments" tab
4. Click "Deploy" button

---

## 🐛 Troubleshooting Deployment Failures

### ❌ Vercel Deployment Failed

**Common causes:**
1. **Build errors** - Check Vercel logs
2. **Missing files** - Ensure HTML files exist
3. **Syntax errors** - Validate HTML/CSS/JS

**Solutions:**
```bash
# Check if files exist locally
ls -la admin-dashboard-v2.html
ls -la frontend/js/

# Test locally first
open admin-dashboard-v2.html

# Push again
git push origin main --force
```

### ❌ Railway Deployment Failed

**Common causes:**
1. **Node.js errors** - Check Railway logs
2. **Database connection** - Verify MySQL credentials
3. **Port issues** - Railway uses PORT environment variable

**Solutions:**
- Check Railway logs in dashboard
- Verify environment variables:
  - `DATABASE_URL`
  - `PORT` (auto-set by Railway)
  - `RAZORPAY_API_KEY`
  - `RAZORPAY_API_SECRET`

---

## 📊 Monitoring Deployments

### Check Deployment Status

**Frontend (Vercel):**
```bash
# Check if live
curl https://iinedu.vercel.app/health

# Check specific page
curl https://iinedu.vercel.app/admin-dashboard-v2.html
```

**Backend (Railway):**
```bash
# Health check
curl https://iin-production.up.railway.app/health

# API endpoints
curl https://iin-production.up.railway.app/api/admin/profile
curl https://iin-production.up.railway.app/api/admin/notifications/count
```

### View Logs

**Vercel Logs:**
- Go to: https://vercel.com/harshbuddy01/iin/deployments
- Click on latest deployment
- View "Build Logs" and "Function Logs"

**Railway Logs:**
- Go to: https://railway.app/project/iin-production
- Click "Deployments" tab
- Click "View Logs"

---

## 🛡️ Prevention Checklist

Before pushing changes, verify:

- [ ] **Frontend changes:** Test in browser locally
- [ ] **Backend changes:** Run `node backend/server.js` locally
- [ ] **No syntax errors:** Check console for errors
- [ ] **Files committed:** `git status` shows all changes
- [ ] **Clean commit message:** Descriptive message

---

## 🎯 Quick Commands

```bash
# Test backend locally
cd backend
node server.js
# Should see: ✅ Listening on 0.0.0.0:8080

# Test frontend locally (open in browser)
open admin-dashboard-v2.html

# Check what will be deployed
git status
git diff

# Deploy everything
git add .
git commit -m "Update: [description]"
git push origin main

# Force redeploy if stuck
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

---

## 📞 Support

If deployment fails:
1. Check this guide first
2. View logs on Vercel/Railway dashboards
3. Test locally before pushing
4. Use `git commit --allow-empty` to trigger redeploy

---

## ✨ Deployment is now automated!

**You don't need to do anything manually.** Just:
1. Make changes
2. Commit & push
3. Wait 2-3 minutes
4. Changes are live! 🎉

**Last updated:** 2025-12-28
