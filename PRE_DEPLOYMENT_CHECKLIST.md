# ✅ Pre-Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

---

## 📋 Local Testing

- [ ] Backend runs without errors: `cd server && npm run dev`
- [ ] Frontend runs without errors: `cd client && npm run dev`
- [ ] Can register a new account
- [ ] Can log in with credentials
- [ ] Can search and find other users
- [ ] Can send and receive messages in real-time
- [ ] Typing indicators appear
- [ ] Online/offline status updates
- [ ] Can upload images (if Cloudinary configured)

---

## 🔐 Environment Setup

### Backend (server/.env)

- [ ] `MONGO_URI` is set to MongoDB Atlas connection string
- [ ] `JWT_SECRET` is a strong random string (32+ characters)
- [ ] `NODE_ENV=production` (for deployed version)
- [ ] `CLIENT_URL` is set correctly (e.g., `https://your-frontend.vercel.app`)
- [ ] Cloudinary variables are optional but set if you want image uploads

### Frontend (client/.env)

- [ ] `VITE_API_URL` is set to your backend URL (e.g., `https://your-api.onrender.com`)
- [ ] Leave blank for local development

---

## 📦 Build Verification

### Test Build Locally

```bash
# Build frontend
cd client
npm run build

# Check dist folder exists and has files
ls dist/
```

- [ ] No build errors
- [ ] `dist/` folder is created
- [ ] `dist/index.html` exists
- [ ] `dist/assets/` folder has CSS and JS files

---

## 🌐 Database Setup

- [ ] MongoDB Atlas account created
- [ ] Free cluster (M0) created
- [ ] Database user created with username/password
- [ ] Network access configured (allow connections from anywhere or specific IPs)
- [ ] Connection string copied: `mongodb+srv://user:pass@cluster.mongodb.net/chatapp`
- [ ] Connection tested locally (successfully connects in dev mode)

---

## ☁️ Cloudinary Setup (Optional but Recommended)

- [ ] Cloudinary account created (or skipped intentionally)
- [ ] Cloud name, API key, API secret saved
- [ ] Added to `server/.env`
- [ ] Image upload tested locally

---

## 📁 GitHub Repository

- [ ] Project pushed to GitHub
- [ ] `.env` files are in `.gitignore` (not committed)
- [ ] `package-lock.json` or `yarn.lock` is committed
- [ ] All source code is committed
- [ ] Main branch is clean with latest code

---

## 🚀 Backend Deployment (Render)

- [ ] GitHub repository is ready
- [ ] Render account created at https://render.com
- [ ] New Web Service created from GitHub repo
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server/index.js`
- [ ] Environment variables added:
  - [ ] `MONGO_URI`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `CLIENT_URL` (update after frontend deployment)
  - [ ] Cloudinary variables (if using)
- [ ] Service deployed successfully
- [ ] Backend URL noted: `https://chat-app-backend.onrender.com`
- [ ] Health check works: `https://chat-app-backend.onrender.com/api/health`

---

## 🎨 Frontend Deployment (Vercel)

- [ ] Vercel account created at https://vercel.com
- [ ] GitHub repository imported
- [ ] Framework: Vite selected
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Environment variables added:
  - [ ] `VITE_API_URL` = your Render backend URL
- [ ] Deployment successful
- [ ] Frontend URL noted: `https://your-project.vercel.app`
- [ ] Frontend loads without errors
- [ ] Check console for CORS or connection errors

---

## 🔗 Update & Verify Integration

- [ ] Backend `.env` updated with frontend URL
- [ ] Backend redeployed after URL change
- [ ] Frontend can connect to backend
- [ ] Test socket connection working
- [ ] Messages sync in real-time

---

## ✅ Final Testing (Live Deployment)

- [ ] Open deployed frontend URL in browser
- [ ] Perform user registration
- [ ] Login with registered account
- [ ] Search for another user (create test account if needed)
- [ ] Send messages in real-time
- [ ] Check typing indicators
- [ ] Verify online/offline status
- [ ] Test image uploads (if configured)
- [ ] Check all UI looks correct
- [ ] No console errors
- [ ] Mobile responsiveness okay

---

## 🎉 Post-Deployment

- [ ] Document the deployed URLs
- [ ] Share frontend URL with others
- [ ] Monitor logs for errors
- [ ] Setup error tracking (optional): Sentry, LogRocket
- [ ] Monitor database usage (free tier: 512MB limit)
- [ ] Test with real users
- [ ] Gather feedback

---

## 📊 Deployment Summary

| Component | Status | URL/Location |
|-----------|--------|-------------|
| Backend | ✅ Deployed | https://chat-app-backend.onrender.com |
| Frontend | ✅ Deployed | https://your-project.vercel.app |
| Database | ✅ Connected | MongoDB Atlas |
| Images | ⚠️ Optional | Cloudinary (if configured) |

---

## 🔒 Security Checklist

- [ ] `.env` files are NOT in version control
- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] Database user has limited permissions
- [ ] MongoDB network access is restricted or whitelisted
- [ ] HTTPS is enabled (automatic with Render + Vercel)
- [ ] CORS is properly configured (no `*` allowed)
- [ ] Environment variables are not logged

---

## 📞 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| CORS Error | Check `CLIENT_URL` in backend `.env` |
| Socket Won't Connect | Verify `VITE_API_URL` in frontend `.env` |
| Database Connection Failed | Check `MONGO_URI` and MongoDB network access |
| Images Don't Upload | Verify Cloudinary credentials if enabled |
| Backend Returns 404 | Ensure routes are correctly configured |

---

## ✨ You're Ready!

If all checkboxes are checked, your app is deployed and ready for use!

Share your frontend URL and let people try your chat app! 🚀

