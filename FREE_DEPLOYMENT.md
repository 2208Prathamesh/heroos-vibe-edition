# 🆓 HeroOS - 100% FREE Deployment Guide

## 🎯 **Best FREE Deployment Solution**

### **Recommended: Vercel + Render (Completely Free!)**

**Frontend**: Vercel (Free Forever)  
**Backend**: Render (Free Tier)  
**Database**: Render PostgreSQL (Free)  
**Storage**: Cloudinary (Free 25GB)  
**Email**: Gmail SMTP (Free 500/day)  

**Total Cost: $0/month** ✅

---

## 🚀 **Step-by-Step FREE Deployment**

### **Part 1: Prepare Your Code**

#### 1. **Install PostgreSQL Support**
```bash
cd c:\Users\barbo\Desktop\HeroOS
npm install pg pg-hstore
```

#### 2. **Update Database Configuration**

Edit `server/index.js` - Find the Sequelize initialization (around line 10-15):

**Replace:**
```javascript
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'heroos.db',
    logging: false
});
```

**With:**
```javascript
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite:heroos.db', {
    dialect: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
    dialectOptions: process.env.DATABASE_URL ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } : {},
    storage: process.env.DATABASE_URL ? undefined : 'heroos.db',
    logging: false
});
```

#### 3. **Update CORS Configuration**

In `server/index.js`, find the CORS setup and update:

```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
```

#### 4. **Create Environment File**

Create `.env` in root directory:
```env
VITE_API_URL=http://localhost:3001
```

#### 5. **Update API Service**

Edit `src/services/api.js` - Find `API_BASE_URL`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

#### 6. **Push to GitHub**

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Prepare for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/HeroOS.git
git branch -M main
git push -u origin main
```

---

### **Part 2: Deploy Backend (Render - FREE)**

#### 1. **Create Render Account**
- Go to https://render.com
- Sign up with GitHub (Free)

#### 2. **Create PostgreSQL Database**
- Click "New +" → "PostgreSQL"
- Name: `heroos-db`
- Database: `heroos`
- User: `heroos`
- Region: Choose closest to you
- Plan: **Free** ✅
- Click "Create Database"
- **Copy the "Internal Database URL"** (starts with `postgresql://`)

#### 3. **Create Web Service**
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Name: `heroos-backend`
- Region: Same as database
- Branch: `main`
- Root Directory: Leave empty
- Runtime: `Node`
- Build Command: `cd server && npm install`
- Start Command: `node server/index.js`
- Plan: **Free** ✅

#### 4. **Add Environment Variables**
Click "Environment" tab and add:

```
DATABASE_URL = [Paste your Internal Database URL from step 2]
JWT_SECRET = your-super-secret-random-string-change-this-12345
PORT = 3001
NODE_ENV = production
FRONTEND_URL = https://YOUR-APP.vercel.app
```

**Note**: You'll update `FRONTEND_URL` after deploying frontend

#### 5. **Deploy**
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- **Copy your backend URL**: `https://heroos-backend-xxxx.onrender.com`

---

### **Part 3: Deploy Frontend (Vercel - FREE)**

#### 1. **Create Vercel Account**
- Go to https://vercel.com
- Sign up with GitHub (Free)

#### 2. **Import Project**
- Click "Add New..." → "Project"
- Import your GitHub repository
- Framework Preset: Vite
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `dist`

#### 3. **Add Environment Variable**
- Click "Environment Variables"
- Add:
  ```
  VITE_API_URL = https://heroos-backend-xxxx.onrender.com
  ```
  (Use your backend URL from Part 2, Step 5)

#### 4. **Deploy**
- Click "Deploy"
- Wait 1-2 minutes
- **Copy your frontend URL**: `https://YOUR-APP.vercel.app`

#### 5. **Update Backend CORS**
- Go back to Render dashboard
- Open your backend service
- Go to "Environment" tab
- Update `FRONTEND_URL` to your Vercel URL
- Click "Save Changes"
- Service will auto-redeploy

---

### **Part 4: Setup Cloudinary (FREE Storage)**

#### 1. **Create Cloudinary Account**
- Go to https://cloudinary.com
- Sign up (Free - 25GB storage)

#### 2. **Get Credentials**
- Dashboard → Account Details
- Copy:
  - Cloud Name
  - API Key
  - API Secret

#### 3. **Install Cloudinary**
```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

#### 4. **Update File Upload**

Edit `server/index.js` - Replace the multer storage configuration:

```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Update storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'heroos-storage',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'mp3'],
        resource_type: 'auto'
    }
});

const upload = multer({ storage: storage });
```

#### 5. **Add to Render Environment Variables**
- Go to Render → Your backend service → Environment
- Add:
  ```
  CLOUDINARY_CLOUD_NAME = your-cloud-name
  CLOUDINARY_API_KEY = your-api-key
  CLOUDINARY_API_SECRET = your-api-secret
  ```

#### 6. **Commit and Push**
```bash
git add .
git commit -m "Add Cloudinary storage"
git push
```
Render will auto-deploy!

---

### **Part 5: Setup Gmail SMTP (FREE)**

#### 1. **Enable 2-Step Verification**
- Go to https://myaccount.google.com/security
- Enable "2-Step Verification"

#### 2. **Create App Password**
- Go to https://myaccount.google.com/apppasswords
- Select app: "Mail"
- Select device: "Other" → Type "HeroOS"
- Click "Generate"
- **Copy the 16-character password**

#### 3. **Configure in HeroOS**
- Open your deployed HeroOS
- Login as admin (`admin` / `hi220806`)
- Go to Settings → Admin Panel
- Scroll to "Email Notifications (SMTP)"
- Enter:
  ```
  Host: smtp.gmail.com
  Port: 587
  Username: your-email@gmail.com
  Password: [Your 16-character app password]
  ☑ Use SSL/TLS: NO (for port 587)
  ```
- Click "Save SMTP Configuration"
- Test with "Send Test" button

---

## ✅ **Verification Checklist**

After deployment, test these:

- [ ] Frontend loads at Vercel URL
- [ ] Can login with admin credentials
- [ ] Can create new user
- [ ] Can upload file (Cloudinary)
- [ ] Can download file
- [ ] SMTP test email works
- [ ] Create user sends email
- [ ] Storage alerts work
- [ ] All apps open correctly
- [ ] Sign out confirmation works
- [ ] Power options work

---

## 🎁 **FREE Tier Limits**

### **Vercel (Frontend)**
- ✅ Unlimited bandwidth
- ✅ 100GB/month
- ✅ Custom domain support
- ✅ Automatic HTTPS
- ✅ Global CDN

### **Render (Backend + Database)**
- ✅ 750 hours/month (enough for 24/7)
- ✅ PostgreSQL 1GB storage
- ✅ Automatic HTTPS
- ⚠️ Spins down after 15 min inactivity (free tier)
- ⚠️ First request after sleep takes 30-60 seconds

### **Cloudinary (Storage)**
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ Image transformations
- ✅ CDN delivery

### **Gmail SMTP**
- ✅ 500 emails/day
- ✅ Free forever
- ✅ Reliable delivery

**Total: $0/month for full functionality!** 🎉

---

## 🚨 **Important Notes**

### **Render Free Tier Sleep**
The free backend sleeps after 15 minutes of inactivity. First request wakes it up (30-60 seconds).

**Solutions:**
1. **Accept it** - Perfect for portfolio/demo
2. **Ping service** - Use cron-job.org (free) to ping every 14 minutes
3. **Upgrade** - $7/month for always-on

### **Keep Awake (Optional)**
Use https://cron-job.org (free):
- Create account
- Add cronjob
- URL: `https://your-backend.onrender.com/api/health`
- Schedule: Every 14 minutes
- This keeps your backend awake!

---

## 🔄 **Auto-Deploy Setup**

Both Vercel and Render auto-deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel and Render will auto-deploy!
```

---

## 📊 **Performance Tips**

### **1. Add Health Endpoint**
Add to `server/index.js`:
```javascript
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
```

### **2. Optimize Images**
Cloudinary automatically optimizes images!

### **3. Enable Caching**
Add to `server/index.js`:
```javascript
app.use(express.static('public', {
    maxAge: '1d'
}));
```

---

## 🆘 **Troubleshooting**

### **Backend won't start**
- Check Render logs
- Verify DATABASE_URL is set
- Ensure `npm install` completed

### **CORS errors**
- Verify FRONTEND_URL matches Vercel URL exactly
- Include `https://` in URL
- Redeploy backend after changing

### **Files won't upload**
- Check Cloudinary credentials
- Verify all 3 env vars are set
- Check Render logs for errors

### **Emails not sending**
- Use App Password, not regular password
- Port 587 with SSL/TLS unchecked
- Check Gmail hasn't blocked the app

### **Database connection fails**
- Use "Internal Database URL" from Render
- Ensure SSL is configured in code
- Check database is running

---

## 🎯 **Quick Deploy Commands**

```bash
# 1. Prepare code
npm install pg pg-hstore
cd server && npm install cloudinary multer-storage-cloudinary && cd ..

# 2. Commit changes
git add .
git commit -m "Prepare for free deployment"
git push

# 3. Deploy on Render (via dashboard)
# 4. Deploy on Vercel (via dashboard)
# 5. Configure SMTP in admin panel
# 6. Done! 🎉
```

---

## 💡 **Pro Tips**

1. **Custom Domain** (Optional, ~$12/year)
   - Buy from Namecheap/GoDaddy
   - Add to Vercel (free)
   - Professional look!

2. **Monitoring** (Free)
   - UptimeRobot.com - Free uptime monitoring
   - Sentry.io - Free error tracking

3. **Analytics** (Free)
   - Google Analytics
   - Vercel Analytics (free tier)

4. **Backup Database** (Important!)
   - Render provides daily backups (free tier)
   - Download manually: Dashboard → Database → Backups

---

## 📞 **Support Resources**

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Gmail SMTP**: https://support.google.com/mail/answer/7126229

---

## 🎉 **You're Done!**

Your HeroOS is now:
- ✅ Deployed for FREE
- ✅ Accessible worldwide
- ✅ HTTPS enabled
- ✅ Email notifications working
- ✅ File storage on cloud
- ✅ Database in cloud
- ✅ Auto-deploys on push

**Share your HeroOS:**
`https://YOUR-APP.vercel.app`

---

**Made with ❤️ by Prathamesh Barbole**  
**Heropixel Network © 2026**  
**100% Free Deployment Guide** 🚀
