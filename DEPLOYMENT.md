# HeroOS Free Deployment Guide

To deploy HeroOS for free and ensure all features (Login, SMTP, Database) work correctly, I recommend using a **Split Deployment Strategy**:

1. **Database**: **Neon** (Free PostgreSQL) - *Persistent data storage.*
2. **Backend**: **Render** (Free Web Service) - *Hosting the Node.js API.*
3. **Frontend**: **Vercel** (Free Static Hosting) - *Hosting the React/Vite interface.*

---

## ⚠️ Crucial Limitation: File Uploads
Your current application stores uploaded files on the **local disk** (in the `/storage` folder).
- **On Free Hosting Services (Render/Vercel)**: The file system is "ephemeral." This means **any file uploaded by a user will be DELETED every time the server restarts or you deploy new code.**
- **Solution**: To fix this permanently, the code must be updated to upload files to a cloud storage service like **Cloudinary** or **AWS S3** instead of the local disk.
- *For now, this guide deploys the app "as is," but be aware that uploaded files (images, documents) will disappear on restart.*

---

## Part 1: Database (Neon)
Since Render's free disk wipes data, we must use a cloud database instead of the local SQLite file.

1. Go to [Neon.tech](https://neon.tech) and Sign Up (Free).
2. Create a new **Project**.
3. Copy the **Connection String** (it looks like `postgres://user:pass@ep-xyz.aws.neon.tech/neondb...`).
   *   *Save this for later. This will be your `DATABASE_URL`.*

---

## Part 2: Backend (Render)
Render will host your Node.js server (`server/index.js`).

1. Push your code to a **GitHub Repository**.
2. Go to [Render.com](https://render.com) and Sign Up.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. **Configure the Service**:
   - **Name**: `heroos-backend`
   - **Region**: Choose one close to you (e.g., Oregon, Frankfurt).
   - **Branch**: `main` (or `master`)
   - **Root Directory**: Leave blank (or `.`)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Plan**: Free

6. **Environment Variables** (Scroll down to "Advanced" or "Environment"):
   Add the following variables:
   - `DATABASE_URL`: *(Paste the Neon Connection String from Part 1)*
   - `JWT_SECRET`: `created_secure_random_string_here`
   - `NODE_ENV`: `production`

7. Click **Create Web Service**.
   - Wait for the deployment to finish.
   - Render will give you a URL (e.g., `https://heroos-backend.onrender.com`).
   - **Copy this URL.** You need it for the Frontend.

---

## Part 3: Frontend (Vercel)
Vercel is the best place to host the React/Vite interface.

1. Go to [Vercel.com](https://vercel.com) and Sign Up.
2. Click **Add New** -> **Project**.
3. Import your **GitHub Repository**.
4. **Configure Project**:
   - **Framework Preset**: Vite (should be detected automatically).
   - **Root Directory**: `./` (Default)
   - **Build Command**: `vite build` (Default)
   - **Output Directory**: `dist` (Default)
   - **Install Command**: `npm install` (Default)

5. **Environment Variables**:
   - Expand the **Environment Variables** section.
   - Add: `VITE_API_URL`
   - Value: *(Paste your Render Backend URL, e.g., `https://heroos-backend.onrender.com`)*
     *   *Note: Do NOT add a trailing slash `/` at the end.*

6. Click **Deploy**.

---

## Part 4: Final Configuration
Once the Frontend is deployed, you need to tell the Backend to allow connections from it.

1. Go back to your **Render Dashboard** (Backend).
2. Go to **Environment Variables**.
3. Add a new variable:
   - `FRONTEND_URL`: *(Paste your Vercel Frontend URL, e.g., `https://heroos.vercel.app`)*
4. **Save Changes** (Render will restart the server).

---

## Summary of URLs
- **Frontend (Visit this)**: `https://heroos.vercel.app`
- **Backend (API)**: `https://heroos-backend.onrender.com`
- **Database**: Hosted on Neon.

## Troubleshooting
- **"Network Error" on Login**:
  - Check the Developer Tools (F12) -> Network tab.
  - Ensure the request is going to `https://heroos-backend.onrender.com/api/...` and not `localhost`.
  - If it fails, check that `VITE_API_URL` is set correctly in Vercel.
- **SMTP Not Working**:
  - Ensure you configured SMTP settings in the simple `Admin Panel` -> `Settings` inside the app.
  - Gmail users: You need an **App Password**, not your normal login password.
