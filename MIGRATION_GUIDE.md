# Railway → Hostinger Migration Guide

**Migration Date:** January 2, 2025  
**Estimated Time:** 6-7 hours  
**Created:** December 28, 2025

---

## 🎯 Pre-Migration Checklist (Complete by Dec 31)

### ✅ **Tasks to Complete NOW:**

- [ ] **Export Railway Database**
  ```bash
  # PostgreSQL
  pg_dump $DATABASE_URL > railway_backup_dec31_2025.sql
  
  # MySQL
  mysqldump -u username -p database_name > railway_backup_dec31_2025.sql
  ```

- [ ] **Document Environment Variables**
  - Login to Railway
  - Go to your project → Variables
  - Copy ALL variables to a text file
  - Save as `railway_env_vars.txt`

- [ ] **Purchase Hostinger VPS**
  - **MUST BE VPS** (not shared hosting)
  - Recommended: VPS Plan 1 or 2 ($4.99-9.99/month)
  - Select Ubuntu OS
  - Enable Node.js application

- [ ] **Test Backend Locally**
  ```bash
  git clone https://github.com/harshbuddy01/iin.git
  cd iin
  npm install
  npm start  # Should work without errors
  ```

- [ ] **Verify Frontend Works**
  - Go to: https://iinedu.vercel.app/admin-dashboard-v2
  - Click "Scheduled Tests" - should load without SyntaxError
  - Check browser console for errors

---

## 📋 Migration Day Steps (January 2)

### **Phase 1: Setup Hostinger (9:00 AM - 11:00 AM)**

#### Step 1: VPS Setup (30 mins)
1. Login to Hostinger → **VPS** section
2. Click "Setup" on your new VPS
3. Select **Ubuntu 22.04 LTS**
4. Create root password (SAVE THIS!)
5. Wait for VPS provisioning (~10 mins)
6. Note down: **VPS IP Address**

#### Step 2: Connect via SSH (10 mins)
```bash
# On your laptop terminal:
ssh root@YOUR_VPS_IP
# Enter password when prompted
```

#### Step 3: Install Node.js (20 mins)
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install PM2 (process manager)
npm install -g pm2
```

#### Step 4: Install Database (30 mins)

**Option A: MySQL (Recommended for Hostinger)**
```bash
# Install MySQL
apt install -y mysql-server

# Secure installation
mysql_secure_installation
# Follow prompts, set root password

# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE iin_database;
CREATE USER 'iin_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON iin_database.* TO 'iin_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Option B: PostgreSQL (More work, use only if you need it)**
```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Switch to postgres user
su - postgres

# Create database and user
createdb iin_database
createuser -P iin_user  # Enter password when prompted
psql
GRANT ALL PRIVILEGES ON DATABASE iin_database TO iin_user;
\q
exit
```

#### Step 5: Setup Firewall (10 mins)
```bash
# Install firewall
apt install -y ufw

# Allow SSH (IMPORTANT - do this first!)
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow Node.js port
ufw allow 3000/tcp

# Enable firewall
ufw enable
```

---

### **Phase 2: Deploy Backend (11:00 AM - 1:00 PM)**

#### Step 6: Upload Backend Code (30 mins)

**Method 1: Git Clone (Recommended)**
```bash
# Create app directory
mkdir -p /var/www/iin
cd /var/www/iin

# Clone repository
git clone https://github.com/harshbuddy01/iin.git .

# Install dependencies
npm install --production
```

**Method 2: FTP Upload (Alternative)**
- Use FileZilla or WinSCP
- Upload entire project folder to `/var/www/iin`

#### Step 7: Import Database (30 mins)

```bash
# Upload SQL backup file to VPS (from your laptop)
scp railway_backup_dec31_2025.sql root@YOUR_VPS_IP:/root/

# On VPS: Import database
# For MySQL:
mysql -u iin_user -p iin_database < /root/railway_backup_dec31_2025.sql

# For PostgreSQL:
psql -U iin_user -d iin_database -f /root/railway_backup_dec31_2025.sql
```

#### Step 8: Configure Environment Variables (20 mins)

```bash
cd /var/www/iin
nano .env
```

Add these variables (modify values):
```env
# Database
DB_HOST=localhost
DB_NAME=iin_database
DB_USER=iin_user
DB_PASS=your_strong_password
DB_PORT=3306  # For MySQL (use 5432 for PostgreSQL)
DB_DIALECT=mysql  # or 'postgres'

# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret_key_here

# Other configs from Railway
# (Copy from railway_env_vars.txt)
```

Save: `Ctrl+O`, Exit: `Ctrl+X`

#### Step 9: Start Application (30 mins)

```bash
# Test run first
cd /var/www/iin
npm start
# Should see: "Server running on port 3000"
# Press Ctrl+C to stop

# Start with PM2 (production)
pm2 start npm --name "iin-backend" -- start

# Setup auto-restart on VPS reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs iin-backend  # View logs
```

---

### **Phase 3: Update Frontend (1:00 PM - 3:00 PM)**

#### Step 10: Update Config (15 mins)

1. **Get your new API URL:**
   - If using IP: `http://YOUR_VPS_IP:3000`
   - If using domain: `https://api.yourdomain.com`

2. **Update frontend config:**
   ```bash
   # On your laptop, edit:
   frontend/js/config.js
   ```
   
   Find this line:
   ```javascript
   return 'https://iin-production.up.railway.app';
   ```
   
   Change to:
   ```javascript
   return 'http://YOUR_VPS_IP:3000';  // or your domain
   ```

3. **Commit and push:**
   ```bash
   git add frontend/js/config.js
   git commit -m "Update API URL to Hostinger"
   git push origin main
   ```

#### Step 11: Wait for Vercel Deployment (10 mins)

- Go to: https://vercel.com/harshs-projects-7f661eb3/iinedu/deployments
- Wait for latest deployment to show **"Ready"** ✅

#### Step 12: Test Everything (1-2 hours)

**Frontend Tests:**
1. Open: https://iinedu.vercel.app/admin-dashboard-v2
2. Check browser console - no errors?
3. Click "Scheduled Tests" - loads?
4. Click "Create Test" - form works?
5. Click "View Questions" - data loads?

**Backend Tests:**
```bash
# Test API endpoints from VPS:
curl http://localhost:3000/api/admin/tests
curl http://localhost:3000/api/admin/questions

# Should return JSON data, not errors
```

**Database Tests:**
```bash
# Check if data imported correctly
mysql -u iin_user -p iin_database
SELECT COUNT(*) FROM tests;
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM students;
EXIT;
```

---

### **Phase 4: Production Setup (3:00 PM - 5:00 PM)**

#### Step 13: Setup Nginx Reverse Proxy (Optional, 1 hour)

**Why:** Use domain name instead of IP:3000

```bash
# Install Nginx
apt install -y nginx

# Create config file
nano /etc/nginx/sites-available/iin-api
```

Add this config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Change to your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable config:
```bash
ln -s /etc/nginx/sites-available/iin-api /etc/nginx/sites-enabled/
nginx -t  # Test config
systemctl restart nginx
```

#### Step 14: Setup SSL Certificate (30 mins)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d api.yourdomain.com
# Follow prompts, enter email

# Auto-renewal
certbot renew --dry-run
```

#### Step 15: Update Frontend Config Again (10 mins)

If you setup Nginx + SSL:
```javascript
// frontend/js/config.js
return 'https://api.yourdomain.com';  // Note: HTTPS now!
```

Commit and push again.

---

## 🔍 Post-Migration Checklist

### **Day 1 (Jan 2 Evening):**
- [ ] All pages load without errors
- [ ] Can create new test
- [ ] Can add questions
- [ ] Can view student list
- [ ] Check PM2 logs: `pm2 logs iin-backend`
- [ ] Monitor VPS CPU/RAM usage

### **Day 2-7 (Jan 3-9):**
- [ ] Keep Railway running as backup
- [ ] Monitor for any errors
- [ ] Check database size growth
- [ ] Test from different devices/browsers
- [ ] Ask users for feedback

### **After 1 Week (Jan 10):**
- [ ] If everything works, cancel Railway subscription
- [ ] Export final backup from Railway (just in case)
- [ ] Document any issues encountered

---

## ⚠️ Troubleshooting

### **Problem: Cannot connect to VPS**
```bash
# Check if SSH port is open
ufw status
ufw allow 22/tcp
```

### **Problem: Node.js app crashes**
```bash
# Check logs
pm2 logs iin-backend

# Restart app
pm2 restart iin-backend

# Check if port 3000 is in use
lsof -i :3000
```

### **Problem: Database connection fails**
```bash
# Check if MySQL is running
systemctl status mysql
systemctl restart mysql

# Check credentials in .env file
nano /var/www/iin/.env

# Test database connection
mysql -u iin_user -p iin_database
```

### **Problem: Frontend shows CORS errors**

Add to backend server.js:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://iinedu.vercel.app',
  credentials: true
}));
```

### **Problem: API returns 502 Bad Gateway**
```bash
# Check if backend is running
pm2 status

# Check Nginx config
nginx -t
systemctl restart nginx
```

---

## 📊 Costs Comparison

| Service | Railway | Hostinger VPS |
|---------|---------|---------------|
| Hosting | $5-20/mo | $4.99-9.99/mo |
| Database | Included | Included |
| SSL | Free | Free |
| Bandwidth | Limited | Unmetered |
| **Total** | **$5-20/mo** | **$4.99-9.99/mo** |

**Savings:** $0-15/month

---

## 📞 Support Contacts

### **Hostinger Support:**
- Live Chat: 24/7 available in dashboard
- Email: support@hostinger.com
- Knowledge Base: https://support.hostinger.com

### **Emergency Rollback Plan:**
If migration fails completely:
1. Keep Railway running (don't cancel yet)
2. Revert config.js to Railway URL
3. Push to GitHub → Vercel auto-deploys
4. Frontend back to Railway within 5 minutes

---

## ✅ Success Criteria

✅ Frontend loads without errors  
✅ All API endpoints respond  
✅ Database queries work  
✅ Can create/edit/delete data  
✅ PM2 shows app running  
✅ Nginx serves requests (if setup)  
✅ SSL certificate valid (if setup)  

---

## 🎯 Final Notes

1. **Backup Everything:** Before starting, backup Railway data
2. **Don't Rush:** Allocate full 6-7 hours
3. **Test Thoroughly:** Don't cancel Railway until 100% sure
4. **Document Issues:** Write down any problems for future reference
5. **Celebrate:** You'll have lower costs and full control!

---

**Created:** December 28, 2025  
**Last Updated:** December 28, 2025  
**Version:** 1.0
