# 🚀 Deployment Guide — MERN Chat App

This guide covers deploying both the backend and frontend to production.

---

## 📋 Prerequisites

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier available)
- [Cloudinary](https://cloudinary.com) account (optional, for image uploads)
- Deployed backend URL (from step 1)
- Git repository

---

## 🔧 Pre-Deployment Setup

### 1. Create `.env` files from examples

**Backend (`server/.env`)**
```bash
cd server
cp .env.example .env
# Edit .env with your values
```

**Frontend (`client/.env`)**
```bash
cd ../client
cp .env.example .env
# Edit .env with your backend URL (set after deploying backend)
```

### 2. Test locally

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` and test the app.

---

## 🌐 Backend Deployment — Render

### Step 1: Prepare Backend

1. **Update `server/.env` or use environment variables:**
   - `MONGO_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: Strong random string (use `openssl rand -base64 32`)
   - `NODE_ENV`: Set to `production`
   - `CLOUDINARY_*`: Optional image upload credentials

2. **Build is automatic** — Render reads `package.json`

### Step 2: Deploy to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New → Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `chat-app-backend` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js` or `npm start`
   - **Region**: Choose closest to you
   - **Plan**: Free tier available

6. **Add Environment Variables** (Settings → Environment):
   ```
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-url.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

7. Click **Deploy**

**Your backend URL**: `https://chat-app-backend.onrender.com`

### ⚠️ Note on Render Free Tier
- Services spin down after 15 mins of inactivity
- First request takes ~30 seconds to wake up
- For production, upgrade to paid plan

---

## 🎨 Frontend Deployment — Vercel

### Step 1: Build Frontend

```bash
cd client
npm run build
```

This creates a `dist` folder with optimized files.

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
npm i -g vercel
cd client
vercel
# Follow prompts and set VITE_API_URL to your backend URL
```

**Option B: Using Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://chat-app-backend.onrender.com
   ```

5. Click **Deploy**

**Your frontend URL**: `https://your-project.vercel.app`

---

## ⚙️ Alternative: Full-Stack Deployment on Railway

Deploy both backend and frontend together on Railway.

### Backend on Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project → GitHub repo
3. Add service:
   - **Service**: Node.js
   - **Entrypoint**: `node server/index.js`

4. Add environment variables (same as Render above)
5. Deploy

---

## 🔌 MongoDB Atlas Setup

### Create Free Cluster

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create organization → Create project
3. **Build a cluster**:
   - Cloud provider: AWS / Google Cloud / Azure
   - Tier: **M0 (Free)**
   - Region: Closest to your deployment
4. **Security**: Create database user
   - Username & password
5. **Network Access**: Add your server IP
   - Or allow from anywhere (less secure): `0.0.0.0/0`

### Get Connection String

1. Go to **Clusters → Connect → Drivers**
2. Copy connection string
3. Replace `<username>`, `<password>`, `<database_name>`

Example:
```
mongodb+srv://user:pass@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
```

---

## ☁️ Cloudinary Setup (Optional)

For image sharing feature:

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to **Dashboard**
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Add to backend `.env`

---

## 🔗 Update CORS & Socket Configuration

After deployment, update if needed:

**Backend `server/index.js`** (already configured):
- Automatically uses `CLIENT_URL` environment variable
- Socket.io CORS configured for production

**Frontend `client/src/socket.js`** (already configured):
- Uses `VITE_API_URL` environment variable
- Falls back to `http://localhost:5000` in dev

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check: `https://your-api.onrender.com/api/health`
- [ ] Frontend loads without errors
- [ ] Can register a new account
- [ ] Can log in
- [ ] Can search users
- [ ] Can send messages (WebSocket working)
- [ ] Can see typing indicators
- [ ] Can upload images (if Cloudinary configured)
- [ ] Online status updates correctly

---

## 🐛 Troubleshooting

### "CORS error" or "Failed to connect to socket"
- Verify `CLIENT_URL` is correct in backend `.env`
- Verify `VITE_API_URL` is correct in frontend `.env`
- Redeploy both after changing URLs

### "Cannot find module" errors on Render
- Ensure `package.json` has all dependencies
- Check build command is `npm install`
- View logs: Render Dashboard → Logs

### Images not uploading
- Verify Cloudinary credentials are set
- Check Cloudinary account is active
- Test with `npm run dev` locally first

### Database connection failed
- Verify MongoDB connection string is correct
- Check network access includes your server IP
- Test connection locally with same URI

### Socket connection timeout
- Check server logs for errors
- Verify WebSocket support (try enabling polling)
- Already enabled in `socket.js`: `transports: ['websocket', 'polling']`

---

## 🚀 Quick Summary

1. **Backend** → Render (or Railway)
2. **Frontend** → Vercel (or Netlify)
3. **Database** → MongoDB Atlas
4. **Images** → Cloudinary (optional)
5. **Update environment variables** after each deployment

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)
- [Socket.io Production Guide](https://socket.io/docs/v4/socket-io-in-production/)

---

## 💡 Pro Tips

- Keep your `.env` files secure, never commit them
- Use strong JWT secrets (minimum 32 chars)
- Monitor your MongoDB usage (free tier: 512MB)
- Set up error monitoring (Sentry, LogRocket)
- Enable HTTPS everywhere (automatic with Vercel & Render)

