# 🚀 Render Deployment Guide for Alga

## ⚠️ FIXING YOUR CURRENT BUILD ERROR

The error you're seeing (`Cannot find package '@vitejs/plugin-react'`) means Render is not installing dependencies before building. Here's how to fix it:

---

## Backend Deployment (alga-backend)

### Service Type: **Web Service**

### Settings:
1. **Build Command**:
   ```bash
   npm install && npm run build
   ```

2. **Start Command**:
   ```bash
   npm run start
   ```

3. **Environment**:
   - Runtime: **Node**
   - Node Version: **20.x** (or latest)

4. **Environment Variables** (Settings → Environment):
   ```
   NODE_ENV=production
   DATABASE_URL=<your-neon-database-url>
   SESSION_SECRET=<your-secret-key>
   ```

5. **Health Check Path**: `/api/health` (if you have one)

---

## Frontend Deployment (alga-frontend)

### Service Type: **Static Site**

### Settings:
1. **Build Command**:
   ```bash
   npm install && npm run build
   ```

2. **Publish Directory**:
   ```
   dist/public
   ```

3. **Environment Variables** (if needed):
   ```
   VITE_API_URL=https://api.alga.et
   ```

---

## 📝 Step-by-Step Fix for Current Error

### For Backend (alga-backend):

1. **Go to Render Dashboard** → Select `alga-backend`
2. **Click "Settings"** in the left sidebar
3. **Scroll to "Build & Deploy"**
4. **Change Build Command to**:
   ```bash
   npm install && npm run build
   ```
5. **Change Start Command to**:
   ```bash
   npm run start
   ```
6. **Click "Save Changes"**
7. **Click "Manual Deploy"** → **"Deploy latest commit"**

### For Frontend (alga-frontend):

1. **Go to Render Dashboard** → Select `alga-frontend`
2. **Click "Settings"** in the left sidebar
3. **Scroll to "Build & Deploy"**
4. **Change Build Command to**:
   ```bash
   npm install && npm run build
   ```
5. **Verify Publish Directory is**:
   ```
   dist/public
   ```
6. **Click "Save Changes"**
7. **Click "Manual Deploy"** → **"Deploy latest commit"**

---

## ✅ Verification After Deployment

### Backend (https://api.alga.et):
Test these endpoints:
```bash
# Health check
curl https://api.alga.et/

# Login endpoint (should return 400 or 401, not 404)
curl -X POST https://api.alga.et/api/auth/login
```

### Frontend (https://app.alga.et):
1. Open in browser
2. Should see Alga homepage
3. Check browser console for errors

---

## 🔍 Common Issues & Fixes

### Issue: "Module not found" errors
**Fix**: Make sure Build Command includes `npm install`

### Issue: "Port already in use"
**Fix**: Render automatically sets PORT env var, your app should use `process.env.PORT || 5000`

### Issue: Frontend shows blank page
**Fix**: Check Publish Directory is `dist/public`, not just `dist`

### Issue: CORS errors from mobile app
**Fix**: Already fixed in your backend! Backend allows these origins:
- capacitor://localhost
- https://app.alga.et
- http://localhost
- http://localhost:8080

---

## 📱 After Successful Deployment

### Rebuild Android APK with Production Config:

```bash
# 1. Install dependencies
npm install

# 2. Sync Capacitor
npx cap sync android

# 3. Build release APK
cd android
./gradlew clean assembleRelease
```

**APK Output**: `android/app/build/outputs/apk/release/app-release.apk`

**Signing Details** (already configured):
- Keystore: `alga-release-key.keystore`
- Passwords: `Alga2025!`
- Alias: `alga`

---

## 🎯 Ready for INSA!

Once both services are deployed and the APK is built, you're ready to resubmit to INSA for security testing! ✅

---

**Questions?** Check Render logs for any deployment errors.
