# 🌱 Production Database Seeding Guide

This guide explains how to populate your production database with sample properties using the secure seed endpoint.

---

## 📋 Overview

The `/api/admin/seed-database` endpoint populates your production database with **12 pre-configured Ethiopian properties** spanning major cities:
- Hotels, guesthouses, and traditional homes
- Cities: Addis Ababa, Gondar, Lalibela, Bahir Dar, Hawassa, Harar, and more
- All properties pre-approved and ready to display

---

## 🔐 Security Features

✅ **Bearer Token Authentication** - Requires `ADMIN_SEED_KEY` environment variable  
✅ **Duplicate Prevention** - Automatically skips seeding if properties already exist  
✅ **Error Handling** - Clear error messages for troubleshooting  
✅ **No User Auth Required** - Works independently of user sessions  

---

## 🚀 Setup Instructions

### Step 1: Generate Admin Seed Key

Run this command to generate a secure random key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
620022a4bf154fa88e322f4af3c2b04ed2342a384b0ae6cd1a7f4cf087aa4933
```

### Step 2: Add to Production Secrets

In your **Replit Deployment Secrets** (or `.env` file):

```env
ADMIN_SEED_KEY=620022a4bf154fa88e322f4af3c2b04ed2342a384b0ae6cd1a7f4cf087aa4933
```

⚠️ **IMPORTANT**: Keep this key **private** and **never commit** it to Git!

### Step 3: Trigger Seed Endpoint

After deploying to production, run this command to seed the database:

```bash
curl -X POST https://your-production-domain.replit.app/api/admin/seed-database \
  -H "Authorization: Bearer YOUR_ADMIN_SEED_KEY" \
  -H "Content-Type: application/json"
```

**Replace:**
- `your-production-domain.replit.app` → Your actual production URL
- `YOUR_ADMIN_SEED_KEY` → Your generated admin seed key

---

## ✅ Expected Responses

### Success (200)
```json
{
  "message": "✅ Seeded successfully!",
  "count": 12
}
```

### Already Seeded (400)
```json
{
  "message": "Database already contains properties. Seeding skipped to prevent duplicates.",
  "existingCount": 15
}
```

### Unauthorized (403)
```json
{
  "message": "Unauthorized"
}
```
**Fix**: Check that `ADMIN_SEED_KEY` matches in your request and environment variables

### Seed Key Not Configured (500)
```json
{
  "message": "Seed key not configured"
}
```
**Fix**: Add `ADMIN_SEED_KEY` to your production environment variables

---

## 📊 Sample Properties Included

The seed data includes **12 properties** from `server/sampleData.json`:

| City | Property | Type | Price/Night |
|------|----------|------|-------------|
| Addis Ababa | Addis View Hotel | Hotel | 2,500 ETB |
| Addis Ababa | Traditional Ethiopian Home | Traditional Home | 1,200 ETB |
| Gondar | Simien Mountain Lodge | Traditional Home | 1,200 ETB |
| Bahir Dar | Blue Nile Retreat | Guesthouse | 980 ETB |
| Lalibela | Rock Heritage House | Traditional Home | 1,500 ETB |
| Hawassa | Lakeside Villa | Guesthouse | 3,200 ETB |
| Harar | Cultural Guesthouse | Traditional Home | 850 ETB |
| Axum | Heritage Palace | Guesthouse | 1,400 ETB |
| Dire Dawa | Railway Station Inn | Guesthouse | 750 ETB |
| Arba Minch | Paradise Lodge | Hotel | 1,800 ETB |
| Bishoftu | Resort & Spa | Hotel | 3,500 ETB |
| Goba | Bale Mountain Eco-Lodge | Traditional Home | 1,600 ETB |

---

## 🔧 Customizing Sample Data

To modify the properties before seeding:

1. **Edit** `server/sampleData.json`
2. **Update** property details (titles, descriptions, prices, amenities)
3. **Redeploy** your application
4. **Trigger** the seed endpoint again (if database is empty)

---

## 🛡️ Security Best Practices

1. ✅ **Rotate Keys** - Change `ADMIN_SEED_KEY` after initial seeding
2. ✅ **Delete After Use** - Remove key from production after seeding (prevents future unauthorized seeding)
3. ✅ **Audit Logs** - Check server logs for unauthorized seed attempts
4. ✅ **One-Time Use** - Only run the seed endpoint once per deployment

---

## 🐛 Troubleshooting

### Problem: "Method not allowed" (405)
**Cause**: Using GET instead of POST  
**Fix**: Ensure you're using `POST` method in your request

### Problem: "Unauthorized" (403)
**Cause**: Bearer token mismatch or missing  
**Fix**:
1. Verify `ADMIN_SEED_KEY` is set in production environment
2. Ensure Authorization header format: `Bearer YOUR_KEY` (no extra spaces)
3. Check for typos in the key

### Problem: Database connection errors
**Cause**: PostgreSQL not configured  
**Fix**: Verify `DATABASE_URL` environment variable is set correctly

### Problem: Schema mismatch errors
**Cause**: Database schema out of sync  
**Fix**: Run `npm run db:push` before seeding

---

## 📝 Technical Details

- **Endpoint**: `POST /api/admin/seed-database`
- **Auth**: Bearer token (`ADMIN_SEED_KEY`)
- **Handler**: `server/api/seed.ts`
- **Data Source**: `server/sampleData.json` (12 properties)
- **Database**: Directly inserts via Drizzle ORM

---

## ✨ Next Steps After Seeding

1. ✅ **Verify Properties** - Visit `/properties` to see seeded listings
2. ✅ **Test Booking Flow** - Create a test booking to verify functionality
3. ✅ **Configure Object Storage** - Set up image uploads for new properties
4. ✅ **Update Sample Images** - Replace `/api/placeholder/800/600` with real property photos
5. ✅ **Remove Seed Key** - Delete `ADMIN_SEED_KEY` from environment for security

---

**Need Help?** Check server logs for detailed error messages or contact your deployment administrator.
