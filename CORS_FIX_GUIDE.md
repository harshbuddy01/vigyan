# 🚫 CORS Error Fix Guide - Vigyan.prep

## 🔴 Current Problem

The admin login page at `https://vigyanprep.com/admin-login.html` is getting **CORS (Cross-Origin Request Blocked)** errors when trying to reach the backend at `https://vigyan-production.up.railway.app`.

### Error Messages in Console:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at 
https://xqhrh218.up.railway.app/api/admin/auth/login. 
(Reason: CORS Header 'Access-Control-Allow-Origin' missing).
```

---

## ✅ What Was Fixed

### 1. **Updated API URL in admin-login.html** 
**Changed from:** `https://xqhrh218.up.railway.app` (old, wrong URL)  
**Changed to:** `https://vigyan-production.up.railway.app` (correct URL)

**Git Commit:** `4d174e10bafbab01fc2db11a5bf16127fd4007eb`

---

## 🛠️ Backend CORS Configuration Check

Your `backend/server.js` already has CORS configured correctly:

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
        'https://vigyanprep.com',
        'https://www.vigyanprep.com',
        'https://vigyan-production.up.railway.app'
      ]
      : ['http://localhost:3000', '*'];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

✅ **This configuration is CORRECT**

---

## 🔍 Why CORS Errors Still Occur

### Possible Causes:

1. **Railway Environment Variable Issue**
   - `NODE_ENV` may not be set to `production` in Railway
   - If `NODE_ENV !== 'production'`, the CORS function checks for localhost origins instead

2. **Railway Deployment Not Updated**
   - The latest code may not be deployed on Railway
   - Railway may be running old code with different CORS settings

3. **CDN/Proxy Cache**
   - If using a CDN, old responses might be cached
   - Browser cache might have old CORS headers

4. **Backend Not Running**
   - Railway service might be sleeping or crashed
   - Check if `https://vigyan-production.up.railway.app/health` responds

---

## ✅ Solution Steps

### Step 1: Verify Railway Environment Variables

1. Go to **Railway Dashboard**
2. Select your **vigyan-production** project
3. Go to **Variables** tab
4. **Check/Add these variables:**

```bash
NODE_ENV=production
FRONTEND_URL=https://vigyanprep.com
API_URL=https://vigyan-production.up.railway.app
MONGODB_URI=<your_mongodb_uri>
RAZORPAY_API_KEY=<your_key>
RAZORPAY_API_SECRET=<your_secret>
```

⚠️ **CRITICAL:** `NODE_ENV` MUST be set to `production`

---

### Step 2: Redeploy Backend on Railway

**Option A: Redeploy via Railway Dashboard**
1. Go to Railway Dashboard
2. Click on your backend service
3. Go to **Deployments** tab
4. Click **Deploy** or **Redeploy**

**Option B: Redeploy via Git Push**
```bash
git add .
git commit -m "Force redeploy with CORS fix"
git push origin main
```

Railway will auto-deploy on push.

---

### Step 3: Test Backend Directly

Open these URLs in your browser:

**1. Health Check:**
```
https://vigyan-production.up.railway.app/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "database": "MongoDB",
  "timestamp": "...",
  "environment": "production",
  "cors": "Allowing all origins"
}
```

**2. API Info:**
```
https://vigyan-production.up.railway.app/api
```

**3. Check CORS Headers:**
Open DevTools → Network Tab → Click on any failed request → Check **Response Headers**

Should see:
```
Access-Control-Allow-Origin: https://vigyanprep.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

---

### Step 4: Clear Browser Cache

```bash
# Chrome/Edge
1. Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Select "Cached images and files"
3. Click "Clear data"

# Or Hard Reload
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

### Step 5: Test Login Again

1. Go to: `https://vigyanprep.com/admin-login.html`
2. Open DevTools (F12) → Console tab
3. Enter username/password
4. Click **Sign In**
5. Watch console for:
   - ✅ `🔐 Attempting login to: https://vigyan-production.up.railway.app/api/admin/auth/login`
   - ✅ `📡 Response status: 200`
   - ✅ `✅ Login successful`

---

## 🔧 Alternative Fix: Temporary Allow All Origins

If the issue persists, temporarily allow ALL origins for debugging:

**Edit `backend/server.js`:**

```javascript
// TEMPORARY FIX - Replace corsOptions with:
const corsOptions = {
  origin: '*',  // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
```

⚠️ **WARNING:** This is NOT secure for production! Use only for testing.

After confirming login works, revert to the proper CORS configuration.

---

## 🧠 Debug CORS Issues

### Test CORS Headers with cURL:

```bash
curl -I -X OPTIONS \
  'https://vigyan-production.up.railway.app/api/admin/auth/login' \
  -H 'Origin: https://vigyanprep.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type'
```

**Expected Response Headers:**
```
HTTP/2 200
Access-Control-Allow-Origin: https://vigyanprep.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
```

If you DON'T see these headers, the backend CORS is not working.

---

## 🔴 If CORS Still Fails

### Option 1: Check Railway Logs

```bash
# If you have Railway CLI installed
railway logs

# Or check in Railway Dashboard
# Go to your service → Deployments → View Logs
```

Look for:
- ❌ CORS errors
- ⚠️ Environment variable warnings
- ❌ MongoDB connection errors

### Option 2: Verify Domain Ownership

Ensure `vigyanprep.com` DNS is pointing to the correct server:

```bash
nslookup vigyanprep.com
```

### Option 3: Check if Using Proxy/CDN

If using Cloudflare or another CDN:
1. Temporarily disable proxy (set to "DNS Only")
2. Test login again
3. If it works, configure CDN to pass CORS headers

---

## ✅ Verification Checklist

- [ ] Railway `NODE_ENV` set to `production`
- [ ] Backend redeployed with latest code
- [ ] Health endpoint returns 200 OK
- [ ] Browser cache cleared
- [ ] `vigyanprep.com/admin-login.html` loads without errors
- [ ] Login attempt shows correct API URL in console
- [ ] No CORS errors in browser console
- [ ] Login successful and redirects to dashboard

---

## 📞 Next Steps

1. **Right Now:** Check Railway environment variables
2. **In 5 minutes:** Redeploy backend
3. **In 10 minutes:** Test login with cleared cache
4. **If still fails:** Enable temporary "allow all origins" for debugging
5. **After debugging:** Revert to secure CORS configuration

---

**Last Updated:** January 31, 2026  
**Status:** 🟡 Awaiting Railway verification
