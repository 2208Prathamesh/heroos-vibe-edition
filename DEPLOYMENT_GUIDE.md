# 🚀 HeroOS Deployment Guide

## Recommended Deployment Platforms

### ✅ **Best Options for Full Functionality**

#### 1. **Vercel + Railway (Recommended)**
**Frontend**: Vercel  
**Backend**: Railway  
**Database**: Railway PostgreSQL  
**Storage**: AWS S3 or Cloudinary

**Why This Stack?**
- ✅ SMTP emails work perfectly
- ✅ File storage with S3/Cloudinary
- ✅ PostgreSQL for production database
- ✅ Easy deployment and scaling
- ✅ Free tier available

**Setup Steps:**
```bash
# Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set build command: npm run build
4. Set output directory: dist
5. Add environment variable: VITE_API_URL=https://your-backend.railway.app

# Backend (Railway)
1. Create new project in Railway
2. Add PostgreSQL database
3. Deploy from GitHub
4. Add environment variables:
   - DATABASE_URL (auto-provided)
   - JWT_SECRET=your-secret-key
   - PORT=3001
   - NODE_ENV=production
```

---

#### 2. **Render (All-in-One)**
**Frontend + Backend**: Render  
**Database**: Render PostgreSQL  
**Storage**: Cloudinary

**Why Render?**
- ✅ All services in one platform
- ✅ Free tier with PostgreSQL
- ✅ SMTP works perfectly
- ✅ Easy SSL certificates
- ✅ Auto-deploy from Git

**Setup Steps:**
```bash
# Backend Service
1. Create new Web Service
2. Build command: npm install
3. Start command: node server/index.js
4. Add PostgreSQL database
5. Environment variables:
   - DATABASE_URL (auto-provided)
   - JWT_SECRET=your-secret-key
   - STORAGE_ROOT=/opt/render/project/storage

# Frontend (Static Site)
1. Create new Static Site
2. Build command: npm run build
3. Publish directory: dist
4. Environment: VITE_API_URL=https://your-backend.onrender.com
```

---

#### 3. **DigitalOcean App Platform**
**Full Stack**: DigitalOcean  
**Database**: Managed PostgreSQL  
**Storage**: DigitalOcean Spaces (S3-compatible)

**Why DigitalOcean?**
- ✅ Professional-grade infrastructure
- ✅ Managed database with backups
- ✅ S3-compatible object storage
- ✅ SMTP fully supported
- ✅ $200 free credit for new users

**Pricing**: ~$12/month for basic setup

---

#### 4. **AWS (Enterprise Solution)**
**Frontend**: S3 + CloudFront  
**Backend**: EC2 or Elastic Beanstalk  
**Database**: RDS PostgreSQL  
**Storage**: S3  
**Email**: SES (Simple Email Service)

**Why AWS?**
- ✅ Enterprise-grade reliability
- ✅ Unlimited scalability
- ✅ Native email service (SES)
- ✅ Complete control
- ✅ Free tier for 12 months

---

### 🔧 **Required Modifications for Production**

#### 1. **Database Migration (SQLite → PostgreSQL)**

Install PostgreSQL adapter:
```bash
npm install pg pg-hstore
```

Update `server/index.js`:
```javascript
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite:heroos.db', {
    dialect: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
    dialectOptions: process.env.DATABASE_URL ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } : {},
    logging: false
});
```

#### 2. **File Storage (Local → Cloud)**

**Option A: AWS S3**
```bash
npm install aws-sdk multer-s3
```

**Option B: Cloudinary**
```bash
npm install cloudinary multer-storage-cloudinary
```

Update multer configuration in `server/index.js`:
```javascript
// For Cloudinary
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'heroos-storage',
        allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx', 'txt']
    }
});
```

#### 3. **Environment Variables**

Create `.env` file:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/heroos

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server
PORT=3001
NODE_ENV=production

# Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=https://your-frontend.vercel.app

# Email (Optional - configured via admin panel)
# SMTP settings are stored in database
```

#### 4. **CORS Configuration**

Update `server/index.js`:
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
```

#### 5. **Frontend API URL**

Create `.env` in root:
```env
VITE_API_URL=https://your-backend.railway.app
```

Update `src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

---

### 📧 **SMTP Configuration**

**Recommended Email Providers:**

1. **Gmail** (Free, 500 emails/day)
   - Host: smtp.gmail.com
   - Port: 587 (TLS) or 465 (SSL)
   - Use App Password (not regular password)
   - Get App Password: Google Account → Security → 2-Step Verification → App Passwords

2. **SendGrid** (Free, 100 emails/day)
   - Host: smtp.sendgrid.net
   - Port: 587
   - Username: apikey
   - Password: Your SendGrid API key

3. **Mailgun** (Free, 5000 emails/month)
   - Host: smtp.mailgun.org
   - Port: 587
   - Get credentials from Mailgun dashboard

4. **AWS SES** (Cheapest for high volume)
   - $0.10 per 1000 emails
   - Highly reliable
   - Requires domain verification

---

### 🔒 **Security Checklist**

- [ ] Change JWT_SECRET to a strong random string
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Set secure CORS origins
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting for API endpoints
- [ ] Implement CSRF protection
- [ ] Regular database backups
- [ ] Monitor error logs
- [ ] Keep dependencies updated

---

### 📊 **Monitoring & Analytics**

**Recommended Tools:**
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Google Analytics**: User analytics
- **UptimeRobot**: Uptime monitoring

---

### 💰 **Cost Estimate**

**Free Tier (Hobby Projects):**
- Vercel (Frontend): Free
- Railway (Backend): Free tier available
- PostgreSQL: Free on Railway/Render
- Cloudinary: Free (25GB storage, 25GB bandwidth)
- **Total: $0/month**

**Production (Small Business):**
- Render Pro: $7/month
- PostgreSQL: $7/month
- Cloudinary Pro: $89/month (or use S3 for cheaper)
- Domain: $12/year
- **Total: ~$15-100/month**

**Enterprise:**
- AWS/DigitalOcean: $50-500/month
- Depends on traffic and storage needs

---

### 🚀 **Quick Deploy Commands**

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Build frontend
npm run build

# 3. Test production build locally
npm run preview

# 4. Deploy to Vercel (Frontend)
npx vercel --prod

# 5. Deploy to Railway (Backend)
# Use Railway CLI or connect GitHub repo

# 6. Configure SMTP in Admin Panel
# Login → Settings → Admin Panel → SMTP Configuration
```

---

### ✅ **Post-Deployment Checklist**

1. [ ] Test user registration and login
2. [ ] Upload and download files
3. [ ] Send test email from SMTP settings
4. [ ] Create/edit/delete users (admin)
5. [ ] Test broadcast and newsletter
6. [ ] Verify storage alerts trigger correctly
7. [ ] Test all power options (shutdown/restart)
8. [ ] Check mobile responsiveness
9. [ ] Test all confirmation dialogs
10. [ ] Monitor error logs for 24 hours

---

### 🆘 **Troubleshooting**

**SMTP Not Working:**
- Check firewall allows port 587/465
- Verify SMTP credentials
- Use app-specific password for Gmail
- Check spam folder for test emails

**File Upload Fails:**
- Check storage quota
- Verify Cloudinary/S3 credentials
- Check file size limits
- Ensure CORS is configured

**Database Connection Error:**
- Verify DATABASE_URL is correct
- Check SSL settings for PostgreSQL
- Ensure database is running
- Check connection limits

---

### 📞 **Support**

For deployment assistance:
- Email: support@heropixel.network
- GitHub Issues: [Your Repo URL]
- Documentation: [Your Docs URL]

---

**Made with ❤️ by Prathamesh Barbole**  
**Heropixel Network © 2026**
