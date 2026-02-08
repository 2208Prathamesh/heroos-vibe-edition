# Step-by-Step Vercel Deployment Guide

Follow these exact steps to deploy your HeroOS application for free.

## Step 1: Push Code to GitHub
1. Create a new repository on GitHub (e.g., `hero-os`).
2. Push your code to this repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/2208prathamesh/heroos-vibe-edition.git
   git push -u origin main
   ```

## Step 2: Set Up Database (Neon)
1. Go to [Neon.tech](https://neon.tech) and Sign Up.
2. Create a new Project.
3. **Copy the Connection String.** It looks like: `postgres://user:pass@...`.
   *Save this for Step 3.*

## Step 3: Deploy Backend (Render)
1. Go to [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Select "Build and deploy from a Git repository".
4. Connect your `hero-os` repository.
5. **Settings:**
   - **Name:** `heroos-api` (or similar)
   - **Region:** Choose closest to you.
   - **Branch:** `main`
   - **Root Directory:** `.` (leave blank)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. **Environment Variables** (Click "Add Environment Variable"):
   - Key: `DATABASE_URL` -> Value: *(Paste Neon Connection String from Step 2)*
   - Key: `JWT_SECRET` -> Value: `CreateASecretKeyHere` (e.g. `mySuperSecretKey123`)
   - Key: `NODE_ENV` -> Value: `production`
7. Click **Create Web Service**.
8. Wait for deployment to finish. **Copy the Backend URL** (e.g., `https://heroos-api.onrender.com`).

## Step 4: Deploy Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your `hero-os` repository.
4. Vercel will auto-detect "Vite".
   - **Build Command:** `npm run build` (Default)
   - **Output Directory:** `dist` (Default)
   - **Install Command:** `npm install` (Default)
5. **Environment Variables**:
   - Expand the section.
   - Key: `VITE_API_URL` -> Value: *(Paste Render Backend URL from Step 3)*
     *   **Important:** Do NOT include a trailing slash `/` (e.g., `https://heroos-api.onrender.com`).
6. Click **Deploy**.

## Step 5: Final Connection
1. Once Vercel finishes, click **Visit** to get your Frontend URL (e.g., `https://heroos.vercel.app`).
2. Go back to **Render Dashboard** -> **Environment**.
3. Add a new Variable:
   - Key: `FRONTEND_URL` -> Value: *(Paste Vercel Frontend URL)*
4. Click **Save Changes**. Render will restart.

## 🎉 Done!
Your app is now live.
- **Frontend:** https://heroos.vercel.app
- **Backend:** https://heroos-api.onrender.com
