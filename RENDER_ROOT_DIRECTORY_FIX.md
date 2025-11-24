# 🔧 Render "Root Directory" Fix

## The Problem

Render is looking for files in `/opt/render/project/src/` but your project structure has files at the root level, not in a `src` folder.

---

## ✅ THE FIX - Set Root Directory

### For Backend (alga-backend):

1. **Go to Render Dashboard** → **alga-backend**
2. **Click "Settings"**
3. **Scroll to "Build & Deploy" section**
4. **Find "Root Directory"** field
5. **Leave it BLANK** or set to `.` (dot means root)
6. **Save Changes**
7. **Manual Deploy** → **Deploy latest commit**

### For Frontend (alga-frontend):

Same steps:
1. **Go to Render Dashboard** → **alga-frontend**
2. **Click "Settings"**
3. **"Root Directory"** → **Leave BLANK** or set to `.`
4. **Save Changes**
5. **Manual Deploy** → **Deploy latest commit**

---

## Why This Happens

If Render has "Root Directory" set to something like `src/` or `client/`, it will:
- ❌ Look for files in `/opt/render/project/src/vite.config.ts`
- ❌ Miss your actual `vite.config.ts` at project root
- ❌ Fail with "Cannot find package" errors

When Root Directory is BLANK or `.`:
- ✅ Looks for files at `/opt/render/project/vite.config.ts`
- ✅ Finds all your files correctly
- ✅ Build succeeds!

---

## Alternative: If You Have Separate Repos

If you're deploying from separate frontend/backend repos:

### Backend Repo Only:
- Root Directory: `.` (or blank)
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`

### Frontend Repo Only:
- Root Directory: `.` (or blank)
- Build Command: `npm install && npm run build`
- Publish Directory: `dist/public`

---

## ✅ Check After Fixing

After setting Root Directory correctly, your build should show:
```
==> Downloading cache...
==> Running 'npm install && npm run build'
npm WARN deprecated...
added 1234 packages...
✓ built in 45s
Build successful 🎉
```

**Not** this error:
```
Error (ERR_MODULE_NOT_FOUND): Cannot find package '@vitejs/plugin-react'
```

---

Good luck! 🚀
