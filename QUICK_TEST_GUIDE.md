# ⚡ Quick API Test Guide - Vigyan.prep

**🎯 Objective:** Test all admin dashboard API endpoints in 5 minutes

---

## 🚀 STEP 1: Test Backend Health (30 seconds)

Open these URLs in your browser:

```
https://vigyan-production.up.railway.app/health
```
**✅ Expected:** `{"status":"ok","timestamp":"..."}`

```
https://vigyan-production.up.railway.app/health/db
```
**✅ Expected:** `{"status":"connected","database":"MongoDB"}`

❌ **If 404 or Error:** Backend is down - check Railway deployment

---

## 🔑 STEP 2: Test Admin Login (1 minute)

### Option A: Using Browser Console

1. Go to `https://vigyanprep.com/admin-login.html`
2. Open DevTools (F12) → Console tab
3. Run this:

```javascript
fetch('https://vigyan-production.up.railway.app/api/admin/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@vigyanprep.com',
    password: 'YOUR_ADMIN_PASSWORD'
  })
})
.then(r => r.json())
.then(d => console.log('✅ LOGIN SUCCESS:', d))
.catch(e => console.error('❌ LOGIN FAILED:', e));
```

**✅ Success:** You'll see admin data + cookie set  
**❌ Failed:** Check email/password or backend logs

### Option B: Using cURL

```bash
curl -X POST 'https://vigyan-production.up.railway.app/api/admin/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@vigyanprep.com",
    "password": "YOUR_PASSWORD"
  }'
```

---

## 📊 STEP 3: Test Dashboard APIs (2 minutes)

**After logging in**, test these in browser console:

### Test 1: Admin Profile
```javascript
fetch('https://vigyan-production.up.railway.app/api/admin/profile', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('✅ PROFILE:', d))
.catch(e => console.error('❌ FAILED:', e));
```

### Test 2: Dashboard Stats
```javascript
fetch('https://vigyan-production.up.railway.app/api/admin/dashboard/stats', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('✅ STATS:', d))
.catch(e => console.error('❌ FAILED:', e));
```

### Test 3: Get All Tests
```javascript
fetch('https://vigyan-production.up.railway.app/api/admin/tests', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('✅ TESTS:', d))
.catch(e => console.error('❌ FAILED:', e));
```

### Test 4: Get All Students
```javascript
fetch('https://vigyan-production.up.railway.app/api/admin/students', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('✅ STUDENTS:', d))
.catch(e => console.error('❌ FAILED:', e));
```

### Test 5: Get All Questions
```javascript
fetch('https://vigyan-production.up.railway.app/api/admin/questions', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('✅ QUESTIONS:', d))
.catch(e => console.error('❌ FAILED:', e));
```

### Test 6: Get Transactions
```javascript
fetch('https://vigyan-production.up.railway.app/api/admin/transactions', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('✅ TRANSACTIONS:', d))
.catch(e => console.error('❌ FAILED:', e));
```

---

## 🔍 STEP 4: Check Network Tab (1 minute)

1. Open `https://vigyanprep.com/admin-dashboard-v3.html`
2. Open DevTools (F12) → Network tab
3. Filter by "XHR"
4. Look for failed requests (red)

**Common Issues:**
- **401 Unauthorized:** Not logged in - go back to Step 2
- **404 Not Found:** API endpoint doesn't exist - check backend routes
- **500 Internal Error:** Backend crash - check Railway logs
- **CORS Error:** CORS not configured - check backend CORS settings

---

## 📝 STEP 5: Test Each Sidebar Option (30 seconds)

On admin dashboard, click each sidebar link and check console:

- ✅ Dashboard
- ✅ Create Test
- ✅ Test Calendar
- ✅ Scheduled Tests
- ✅ Past Tests
- ✅ Add Questions
- ✅ View Questions
- ✅ Upload PDF
- ✅ All Students
- ✅ Add Student
- ✅ Transactions
- ✅ View Results
- ✅ Performance

**For each page that shows errors:**
- Note the page name
- Check console for API errors
- Check Network tab for failed requests

---

## 🐞 TROUBLESHOOTING COMMON ERRORS

### ❌ Error: "Failed to fetch"
**Cause:** Backend is down or CORS issue  
**Fix:**
1. Check if backend is running: `https://vigyan-production.up.railway.app/health`
2. Check Railway deployment logs
3. Verify CORS allows `vigyanprep.com`

### ❌ Error: "401 Unauthorized"
**Cause:** Not logged in or session expired  
**Fix:**
1. Login again at `/admin-login.html`
2. Check if cookies are enabled
3. Check if `credentials: 'include'` is set in fetch

### ❌ Error: "404 Not Found"
**Cause:** API endpoint doesn't exist  
**Fix:**
1. Check if route exists in `backend/server.js`
2. Check route file (e.g., `adminRoutes.js`, `testRoutes.js`)
3. Verify route is mounted correctly

### ❌ Error: "500 Internal Server Error"
**Cause:** Backend code error  
**Fix:**
1. Check Railway logs for error details
2. Check MongoDB connection
3. Check environment variables

---

## 📦 POSTMAN COLLECTION

### Import to Postman:

1. Create new collection "Vigyan Admin APIs"
2. Add environment variable:
   ```
   BASE_URL = https://vigyan-production.up.railway.app
   ```
3. Import all endpoints from `API_TESTING_CHECKLIST.md`

### Quick Postman Test Sequence:

1. **POST** `/api/admin/auth/login` → Get cookies
2. **GET** `/api/admin/profile` → Verify auth
3. **GET** `/api/admin/tests` → Get all tests
4. **GET** `/api/admin/students` → Get all students
5. **GET** `/api/admin/dashboard/stats` → Get dashboard data

---

## 📊 RESULTS CHECKLIST

| Endpoint | Status | Response Time | Notes |
|----------|--------|---------------|-------|
| `/health` | ✅/❌ | ___ ms | |
| `/api/admin/auth/login` | ✅/❌ | ___ ms | |
| `/api/admin/profile` | ✅/❌ | ___ ms | |
| `/api/admin/tests` | ✅/❌ | ___ ms | |
| `/api/admin/students` | ✅/❌ | ___ ms | |
| `/api/admin/questions` | ✅/❌ | ___ ms | |
| `/api/admin/transactions` | ✅/❌ | ___ ms | |
| `/api/admin/dashboard/stats` | ✅/❌ | ___ ms | |
| `/api/pdf/upload` | ✅/❌ | ___ ms | |

---

## 🛠️ DEBUGGING COMMANDS

### Check Railway Logs:
```bash
# If you have Railway CLI installed
railway logs
```

### Check MongoDB Connection:
```javascript
// In backend, add this to server.js
console.log('MongoDB Status:', mongoose.connection.readyState);
// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
```

### Check CORS Headers:
```bash
curl -I -X OPTIONS \
  'https://vigyan-production.up.railway.app/api/admin/tests' \
  -H 'Origin: https://vigyanprep.com'
```

---

## ✅ SUCCESS CRITERIA

Your system is working correctly if:

1. ✅ Health endpoint returns 200 OK
2. ✅ Admin login works and sets cookies
3. ✅ Admin profile loads after login
4. ✅ Dashboard stats load without errors
5. ✅ All sidebar navigation works
6. ✅ No CORS errors in console
7. ✅ No 404 errors for API calls
8. ✅ Response times < 2 seconds

---

## 📞 NEXT STEPS

If issues found:

1. **Document all failing endpoints** in a list
2. **Check backend route files** to see if endpoints exist
3. **Review Railway logs** for server errors
4. **Verify environment variables** are set correctly
5. **Test with Postman** to isolate frontend vs backend issues

---

**Last Updated:** January 31, 2026  
**Next Review:** After testing completion
