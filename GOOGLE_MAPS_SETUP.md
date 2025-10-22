# 🗺️ Google Maps API Setup Guide

## Why You Need This
Without a Google Maps API key, the map view shows a placeholder. With the key, you get:
- ✅ Interactive property maps on search page
- ✅ Location maps on property details
- ✅ Click markers to see property info
- ✅ Fullscreen mode + user location
- ✅ Dynamic updates with filters

---

## 🆓 Free Tier
- **28,000 map loads per month FREE**
- **No credit card required** initially
- Perfect for testing and small-scale deployment

---

## 🔑 Get Your API Key (5 minutes)

### Step 1: Create Google Cloud Project
1. Go to: [console.cloud.google.com](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name it: `Alga Maps` (or anything you like)
4. Click "Create"
5. Wait for project creation (~30 seconds)

### Step 2: Enable Maps JavaScript API
1. In the project, go to: **APIs & Services** → **Library**
2. Search for: `Maps JavaScript API`
3. Click on it
4. Click: **ENABLE**
5. Wait for activation (~10 seconds)

### Step 3: Create API Key
1. Go to: **APIs & Services** → **Credentials**
2. Click: **+ CREATE CREDENTIALS** (top of page)
3. Select: **API Key**
4. Your key appears! It looks like: `AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. Click: **COPY** (or write it down)

### Step 4: (Optional) Restrict the Key
For security, restrict your key:
1. Click: **EDIT API KEY** (or the pencil icon)
2. Under "API restrictions":
   - Select: **Restrict key**
   - Check: **Maps JavaScript API**
3. Under "Application restrictions" (for production):
   - Select: **HTTP referrers (web sites)**
   - Add: `*.vercel.app/*` and your custom domain
4. Click: **SAVE**

---

## 🔧 Add to Replit (Development)

### Method 1: Using Replit Secrets (Recommended)
1. In Replit, click: **Tools** (left sidebar)
2. Click: **Secrets**
3. Click: **+ New Secret**
4. Name: `VITE_GOOGLE_MAPS_API_KEY`
5. Value: Paste your API key (e.g., `AIzaSyD-xxx...`)
6. Click: **Add Secret**
7. **Restart the workflow** (click Stop → Start)
8. Visit `/properties` → Click Map icon → Maps work! 🎉

### Method 2: Using .env file (Alternative)
1. Create file: `.env` in project root
2. Add line:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyD-your-actual-key-here
   ```
3. Save file
4. Restart workflow
5. Maps work!

**Note:** Make sure `.env` is in `.gitignore` (it already is)

---

## 🚀 Add to Production Deployment

### For Vercel (Frontend)
1. Go to: [vercel.com](https://vercel.com)
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `VITE_GOOGLE_MAPS_API_KEY`
   - **Value:** Your API key (paste it)
   - **Environments:** Production, Preview, Development (check all)
5. Click: **Save**
6. Redeploy your app (Vercel does this automatically)

### For Render (Backend - Optional)
Only needed if you use server-side geocoding:
1. Go to: [render.com](https://render.com)
2. Select your web service
3. Go to: **Environment**
4. Add new variable:
   - **Key:** `GOOGLE_MAPS_API_KEY`
   - **Value:** Your API key
5. Click: **Save Changes**
6. Render redeploys automatically

---

## ✅ Test It's Working

### In Development (Replit):
1. Make sure workflow is running
2. Visit: `/properties`
3. Click the **Map icon** in the toolbar (next to grid icon)
4. You should see:
   - ✅ Interactive Google Map
   - ✅ Property markers on map
   - ✅ Click markers to see property cards
   - ✅ Fullscreen button works
   - ✅ "Get My Location" button works

### What You'll See:
```
Without API Key:
- Placeholder message: "Google Maps requires an API key"
- Grid view works fine

With API Key:
- Full interactive map with property markers
- Click markers to preview properties
- Fullscreen mode enabled
- User location tracking
- Dynamic filter updates
```

---

## 🔍 Troubleshooting

### Maps show "For development purposes only"
**Solution:** This is normal for development. Happens when:
- Using localhost or Replit preview
- No billing account set up
- For production, add billing (still free under 28k loads/month)

### Maps don't load at all
**Check:**
1. ✅ API key is correct (copy-paste carefully)
2. ✅ Maps JavaScript API is enabled in Google Cloud
3. ✅ Variable name is exactly: `VITE_GOOGLE_MAPS_API_KEY`
4. ✅ Workflow was restarted after adding key
5. ✅ Check browser console for error messages

### "API key is invalid"
**Fix:**
1. Double-check you copied the entire key
2. Make sure there are no extra spaces
3. Generate a new key if needed
4. Check API restrictions aren't blocking localhost

### Maps work in development but not production
**Solution:**
1. Add key to Vercel environment variables
2. Add your production domain to API key restrictions
3. Redeploy on Vercel

---

## 💰 Billing & Costs

### Free Tier Limits:
- **28,000 map loads/month** = FREE
- **$200 monthly credit** (for all Google Cloud services)
- Perfect for small to medium apps

### What Counts as a "Map Load"?
- Each page view of the map = 1 load
- Example: 1,000 users × 10 property searches = 10,000 loads

### When You Need to Pay:
- Over 28,000 map loads/month
- After $200 credit is used
- Pricing: ~$7 per 1,000 additional loads

### Cost Examples:
- **Beta Testing (100 users):** FREE
- **Launch (1,000 users):** FREE
- **Growing (10,000 users):** ~$20-50/month
- **Scale (100,000 users):** ~$200-500/month

**Tip:** Set up billing alerts in Google Cloud Console

---

## 🛡️ Security Best Practices

### 1. Restrict Your API Key
Always restrict keys in production:
```
Application restrictions:
→ HTTP referrers
→ Add: yourdomain.com/*
→ Add: *.vercel.app/*

API restrictions:
→ Restrict key
→ Select: Maps JavaScript API only
```

### 2. Never Commit Keys to Git
```bash
# Already in .gitignore:
.env
.env.local
.env.production
```

### 3. Use Different Keys for Dev/Prod
- Development key: Unrestricted (for testing)
- Production key: Restricted to your domain

### 4. Monitor Usage
- Check Google Cloud Console weekly
- Set up budget alerts
- Review usage patterns

---

## 🎯 Quick Reference

| Environment | Variable Name | Where to Add |
|-------------|---------------|--------------|
| **Replit Dev** | `VITE_GOOGLE_MAPS_API_KEY` | Tools → Secrets |
| **Vercel Prod** | `VITE_GOOGLE_MAPS_API_KEY` | Settings → Environment Variables |
| **Render (optional)** | `GOOGLE_MAPS_API_KEY` | Environment tab |
| **Local .env** | `VITE_GOOGLE_MAPS_API_KEY` | `.env` file in root |

---

## 📞 Need Help?

### Google Cloud Support:
- Documentation: [developers.google.com/maps/documentation](https://developers.google.com/maps/documentation)
- Pricing: [cloud.google.com/maps-platform/pricing](https://cloud.google.com/maps-platform/pricing)
- Support: [cloud.google.com/support](https://cloud.google.com/support)

### Common Links:
- **Console:** [console.cloud.google.com](https://console.cloud.google.com)
- **Enable API:** [console.cloud.google.com/apis/library/maps-backend.googleapis.com](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com)
- **Credentials:** [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

---

## ✨ After Setup

Once your key is working:

1. **Test all map features:**
   - Map/List toggle
   - Click markers
   - Fullscreen mode
   - User location
   - Search filters

2. **Add real property coordinates:**
   - Update properties in database
   - Use actual latitude/longitude
   - Maps show accurate locations

3. **Deploy to production:**
   - Add key to Vercel
   - Test live site
   - Monitor usage

---

**Made with ❤️ for Ethiopian hospitality**

*Stay. Discover. Belong. The Ethiopian Way!* 🇪🇹
