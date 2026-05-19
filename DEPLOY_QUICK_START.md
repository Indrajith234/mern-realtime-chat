# 🚀 Quick Start — Deploy Your Chat App

This folder contains everything you need to deploy the MERN Chat App online.

## 📋 What's Included

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Full deployment guide with step-by-step instructions |
| `build.sh` / `build.bat` | Build scripts for preparing the app |
| `server/` | Backend API & WebSocket server |
| `client/` | React frontend |

---

## ⚡ Quick Deploy (5 minutes)

### 1. **Backend → Deploy to Render** 

```bash
# Push your code to GitHub
git push origin main

# Go to https://dashboard.render.com
# Create new Web Service from your GitHub repo
# Set Build Command: npm install
# Set Start Command: node server/index.js

# Add Environment Variables:
# - MONGO_URI (from MongoDB Atlas)
# - JWT_SECRET (any strong random string)
# - NODE_ENV=production
# - CLIENT_URL=https://your-frontend.vercel.app
```

**Get your backend URL**: `https://chat-app-backend.onrender.com`

### 2. **Frontend → Deploy to Vercel**

```bash
# Go to https://vercel.com
# Import your GitHub repo
# Set Framework: Vite
# Set Output Directory: dist

# Add Environment Variables:
# - VITE_API_URL=https://chat-app-backend.onrender.com
```

**Get your frontend URL**: `https://your-app.vercel.app`

### 3. **Done!** 🎉

Your app is now live. Share the frontend URL with friends!

---

## 📚 Detailed Guide

See `DEPLOYMENT.md` for:
- ✅ Full step-by-step instructions
- ✅ MongoDB Atlas setup
- ✅ Cloudinary configuration (for images)
- ✅ Troubleshooting guide
- ✅ Alternative platforms (Railway, Heroku, etc.)

---

## 🔧 Build Locally

### Windows
```bash
build.bat
```

### Mac/Linux
```bash
chmod +x build.sh
./build.sh
```

---

## 📌 Environment Variables Needed

### Backend (server/.env)
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatapp
JWT_SECRET=your_random_secret_key_here
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=optional_for_images
CLOUDINARY_API_KEY=optional_for_images
CLOUDINARY_API_SECRET=optional_for_images
```

### Frontend (client/.env)
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## ✅ Testing Before Deploy

```bash
# Start backend
cd server && npm run dev

# In another terminal, start frontend
cd client && npm run dev

# Open http://localhost:5173
```

---

## 🌍 Recommended Platforms

| Component | Platform | Why |
|-----------|----------|-----|
| Backend | **Render** | Free tier, auto-deploy, easy setup |
| Frontend | **Vercel** | Optimized for Next.js/Vite, fast CDN |
| Database | **MongoDB Atlas** | Free tier, fully managed |
| Images | **Cloudinary** | Free tier, reliable image hosting |

---

## 🔒 Security Checklist

- [ ] Never commit `.env` files
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Set `NODE_ENV=production` in backend
- [ ] MongoDB: Enable IP whitelist in Atlas
- [ ] Frontend: Set correct `VITE_API_URL`
- [ ] Backend: Set correct `CLIENT_URL`

---

## 📞 Need Help?

1. **Read** `DEPLOYMENT.md` first
2. **Check logs** on Render dashboard or Vercel dashboard
3. **Verify** environment variables are set correctly
4. **Test locally** with `npm run dev` to isolate issues

---

## 🎯 File Structure After Build

```
project/
├── server/          # Backend (deploy to Render)
│   ├── index.js
│   ├── package.json
│   └── .env         # ⚠️ Keep secret!
│
├── client/          # Frontend (deploy to Vercel)
│   ├── dist/        # ← Build output for Vercel
│   ├── package.json
│   └── .env         # ⚠️ Keep secret!
│
├── DEPLOYMENT.md    # Read this!
└── build.sh/bat     # Run this
```

---

## 🚀 You're Ready!

Follow the **Quick Deploy** section above and your app will be live in minutes.

Good luck! 🎉

