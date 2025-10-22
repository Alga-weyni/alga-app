# Alga - Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- SendGrid API key for email OTP
- Payment gateway credentials (Stripe, PayPal, Telebirr)

## 📋 Environment Variables

### Required for Production

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Node Environment
NODE_ENV=production

# SendGrid Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@algaapp.com

# Payment Gateways
STRIPE_SECRET_KEY=sk_live_xxxx
PAYPAL_CLIENT_ID=xxxx
PAYPAL_CLIENT_SECRET=xxxx
TELEBIRR_BASE_URL=https://app.ethiotelecom.et:4443
TELEBIRR_FABRIC_APP_ID=xxxx
TELEBIRR_APP_SECRET=xxxx
TELEBIRR_MERCHANT_APP_ID=xxxx
TELEBIRR_PRIVATE_KEY=xxxx
TELEBIRR_SHORT_CODE=xxxx

# Session Secret
SESSION_SECRET=your-super-secret-session-key-change-this

# SMS (Optional - Ethiopian Telecom)
ETHIO_TELECOM_API_KEY=xxxx
ETHIO_TELECOM_SHORT_CODE=xxxx
```

## 🏗️ Backend Deployment (Render.com)

### Step 1: Create New Web Service
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Service
```yaml
Name: alga-backend
Environment: Node
Region: Oregon (US West)
Branch: main
Build Command: npm install && npm run build
Start Command: npm run start
```

### Step 3: Environment Variables
Add all environment variables from the list above in Render dashboard.

### Step 4: Auto-Deploy
- Enable "Auto-Deploy" for main branch
- Service will deploy at: `https://alga-backend.onrender.com`

## 🎨 Frontend Deployment (Vercel)

### Step 1: Import Project
1. Go to [Vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository

### Step 2: Configure Build
```yaml
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Environment Variables
```env
VITE_API_BASE_URL=https://alga-backend.onrender.com
```

### Step 4: Deploy
- Click "Deploy"
- Your site will be live at: `https://your-project.vercel.app`

## 🗄️ Database Setup

### Using Neon (Recommended)
1. Create account at [Neon.tech](https://neon.tech)
2. Create new project: "Alga Production"
3. Copy connection string
4. Add to `DATABASE_URL` in environment variables

### Push Schema
```bash
npm run db:push
```

## 🌱 Seed Initial Data

```bash
# Seed test data
npm run seed
```

This creates:
- 1 admin user (ethiopianstay@gmail.com)
- 1 test host
- 3 sample properties
- 3 service providers
- Sample bookings and reviews

## 🧪 Testing After Deployment

### Test Authentication
1. Visit your frontend URL
2. Sign up with email
3. Check console logs for OTP (if SendGrid not configured)
4. Verify OTP and login

### Test Property Booking
1. Browse properties
2. Select dates and book
3. Test payment flow (use test mode keys)
4. Verify booking confirmation

### Test Add-On Services
1. After booking confirmation
2. Browse available services
3. Add service to booking
4. Verify 15% commission calculation

### Admin Dashboard
1. Login as admin: ethiopianstay@gmail.com
2. Verify properties
3. Approve service providers
4. Review transactions

## 🔐 Security Checklist

- [ ] Change SESSION_SECRET to unique value
- [ ] Use production API keys (not test keys)
- [ ] Enable HTTPS (automatic on Render & Vercel)
- [ ] Set NODE_ENV=production
- [ ] Review CORS settings in server/index.ts
- [ ] Enable rate limiting (already configured)
- [ ] Verify helmet.js security headers

## 📊 Monitoring

### Render
- View logs in Render dashboard
- Set up alerts for errors
- Monitor resource usage

### Vercel
- Analytics automatically enabled
- View deployment logs
- Monitor performance

## 🚨 Common Issues

### Database Connection Error
- Verify DATABASE_URL is correct
- Check database is accessible from Render
- Ensure SSL mode is enabled for Neon

### OTP Emails Not Sending
- Verify SENDGRID_API_KEY starts with "SG."
- Check SendGrid domain verification
- Review email logs in SendGrid dashboard

### Payment Not Working
- Verify you're using correct environment keys (test vs live)
- Check webhook URLs are configured
- Review payment logs

## 📱 Mobile Testing

Test on multiple devices:
- iOS Safari
- Android Chrome
- Responsive breakpoints: 375px, 768px, 1024px

## 🎯 Go-Live Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Database migrated and seeded
- [ ] All environment variables set
- [ ] SendGrid configured and tested
- [ ] Payment gateways tested
- [ ] SSL certificates active
- [ ] DNS configured (if custom domain)
- [ ] Error monitoring setup
- [ ] Backup strategy in place

## 🌍 Custom Domain (Optional)

### Backend (Render)
1. Add custom domain in Render: `api.algaapp.com`
2. Update DNS: CNAME to Render endpoint

### Frontend (Vercel)
1. Add domain in Vercel: `algaapp.com`
2. Update DNS: A record to Vercel IP

## 📞 Support

For deployment issues:
- Backend: Check Render logs
- Frontend: Check Vercel logs
- Database: Check Neon dashboard
- Email: Check SendGrid activity

---

**Deployment Time Estimate**: 2-3 hours for complete setup
**Last Updated**: October 2025
