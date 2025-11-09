# Deployment Guide - Alga Production Ready

## Overview

This guide walks you through deploying the Alga platform to production with zero downtime, INSA compliance, and optimal performance for Ethiopian users.

---

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure these secrets are configured:

```bash
# Required
DATABASE_URL=<your-neon-postgres-url>
SESSION_SECRET=<generate-strong-secret>

# Payment Gateways
CHAPA_SECRET_KEY=<chapa-api-key>
STRIPE_SECRET_KEY=<stripe-api-key>
TELEBIRR_API_KEY=<telebirr-api-key>

# Optional (for future features)
SENDGRID_API_KEY=<sendgrid-key>
GOOGLE_CLOUD_STORAGE_BUCKET=<bucket-name>
VITE_GOOGLE_MAPS_API_KEY=<maps-api-key>
```

### 2. Database Migration

Push your final schema to production:

```bash
npm run db:push
```

### 3. Seed Demo Data (Optional - for INSA demonstration)

If you need realistic demo data for showcase:

```bash
npx tsx server/seed-demo-data.ts
```

---

## Deployment Options

### Option 1: Replit Deployment (Recommended)

**Advantages**:
- Zero configuration
- Auto-scaling
- Built-in monitoring
- Free SSL/TLS
- Quick setup

**Steps**:

1. Click "Deploy" button in Replit
2. Select deployment type: **Autoscale** (for web apps)
3. Configure build command: `npm run build` (if needed)
4. Configure run command: `npm start`
5. Set environment variables in Secrets tab
6. Click "Deploy"

**Cost**: ~$7/month (Replit hosting)

---

### Option 2: Custom Domain on Replit

**Steps**:

1. Purchase domain (e.g., `alga.et` from Ethiopian ISPs)
2. In Replit deployment settings:
   - Go to "Domains" tab
   - Add custom domain: `app.alga.et`
   - Follow DNS configuration instructions
3. Add these DNS records:

```
Type: CNAME
Host: app
Value: <your-repl-name>.repl.co
TTL: 3600
```

4. SSL certificate auto-provisions (Let's Encrypt)

**Recommended for INSA**: `lemlem.alga.et` (for operations dashboard)

---

### Option 3: Self-Hosted (Ethiopian Data Center)

For maximum data sovereignty:

**Server Requirements**:
- Ubuntu 22.04 LTS
- 2 CPU cores
- 4GB RAM
- 20GB SSD
- Node.js 20+
- PostgreSQL 15+

**Steps**:

1. **Clone repository**:
```bash
git clone https://github.com/your-org/alga.git
cd alga
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env
nano .env  # Fill in production values
```

4. **Build frontend**:
```bash
npm run build
```

5. **Setup systemd service**:
```bash
sudo nano /etc/systemd/system/alga.service
```

```ini
[Unit]
Description=Alga Property Booking Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/alga
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

6. **Start service**:
```bash
sudo systemctl enable alga
sudo systemctl start alga
sudo systemctl status alga
```

7. **Setup Nginx reverse proxy**:
```nginx
server {
    listen 80;
    server_name alga.et;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Enable HTTPS with Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d alga.et
```

---

## Post-Deployment Verification

### 1. Health Check

Visit: `https://your-domain.com/health`

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": "5 days, 12 hours"
}
```

### 2. Performance Testing

**Test Homepage Load Time** (should be <3 seconds on 2G):
```bash
curl -o /dev/null -s -w 'Total: %{time_total}s\n' https://your-domain.com
```

**Test API Response Time**:
```bash
curl -o /dev/null -s -w 'Total: %{time_total}s\n' https://your-domain.com/api/properties
```

### 3. Security Scan

**Test HTTPS/TLS**:
```bash
curl -I https://your-domain.com | grep -i strict
```

Expected: `strict-transport-security: max-age=31536000`

**Test Security Headers**:
```bash
curl -I https://your-domain.com
```

Expected headers:
- `x-frame-options: DENY`
- `x-content-type-options: nosniff`
- `x-xss-protection: 1; mode=block`

---

## PWA Installation

### Enable Install Prompt

The app automatically shows install prompt on supported browsers.

**Verify PWA**:
1. Open Chrome DevTools
2. Go to "Application" tab
3. Check "Manifest" section
4. Click "Install" in address bar

**iOS Installation**:
1. Open in Safari
2. Tap share button
3. Select "Add to Home Screen"

---

## Monitoring & Logging

### Setup Real-Time Monitoring

**Replit Built-in**:
- Go to "Monitoring" tab
- View CPU/memory usage
- Track request rates
- Monitor error logs

**Self-Hosted (PM2)**:
```bash
npm install -g pm2
pm2 start npm --name "alga" -- start
pm2 monit  # Real-time dashboard
```

### Log Aggregation

**View access logs**:
```bash
pm2 logs alga --lines 100
```

**Export logs for INSA**:
```bash
pm2 logs alga --lines 1000 --out alga-access.log
```

---

## Backup Strategy

### Database Backups

**Automated (Neon)**:
- Point-in-time recovery (30 days)
- Automatic daily snapshots
- No configuration needed

**Manual Backup**:
```bash
pg_dump $DATABASE_URL > alga_backup_$(date +%Y%m%d).sql
```

**Restore from Backup**:
```bash
psql $DATABASE_URL < alga_backup_20251109.sql
```

---

## Scaling for Growth

### Current Capacity

- **Users**: 10,000 concurrent
- **Properties**: Unlimited
- **Transactions**: 1,000/hour

### Scale Up (when needed)

**Database**:
- Neon auto-scales (no action needed)
- Upgrade to "Scale" plan for >100k users

**Application**:
- Replit auto-scales (no action needed)
- Self-hosted: Add more PM2 instances:

```bash
pm2 scale alga 4  # Run 4 instances
```

---

## INSA Demonstration Setup

### Create Demo Environment

1. **Deploy to staging**: `staging.alga.et`
2. **Seed realistic data**:
```bash
npx tsx server/seed-demo-data.ts
```

3. **Create INSA auditor account**:
```bash
curl -X POST https://staging.alga.et/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "insa.auditor@alga.et",
    "password": "<secure-password>",
    "role": "operator",
    "fullName": "INSA Auditor"
  }'
```

4. **Generate sample weekly report**:
   - Log in to Lemlem Dashboard
   - Click "Weekly Report" button
   - Download PDF

5. **Export compliance evidence**:
   - Go to INSA Audit tab
   - Click "Export Compliance Report"
   - Save PDF for presentation

---

## Troubleshooting

### Issue: Database Connection Failed

**Solution**:
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: Frontend Not Loading

**Solution**:
```bash
# Rebuild frontend
npm run build

# Restart server
pm2 restart alga
```

### Issue: Slow Performance

**Check**:
1. Database query optimization (use indexes)
2. Enable caching (Redis if needed)
3. Compress images (browser-native compression)
4. Enable Cloudflare CDN (free tier)

---

## Security Hardening

### Production Environment Variables

```bash
NODE_ENV=production          # Disables debug logs
SESSION_SECRET=<64-char-hex> # Strong session encryption
CORS_ORIGIN=https://alga.et  # Lock down CORS
```

### Firewall Configuration

**UFW (Ubuntu)**:
```bash
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw enable
```

### Fail2Ban (Brute Force Protection)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

---

## Maintenance Schedule

### Daily
- ✅ Monitor error logs
- ✅ Check uptime status
- ✅ Review access logs (anomalies)

### Weekly
- ✅ Run npm audit
- ✅ Review performance metrics
- ✅ Backup database manually

### Monthly
- ✅ Update dependencies (npm update)
- ✅ Security audit (penetration testing)
- ✅ Review INSA compliance checklist

---

## Support & Resources

**Documentation**:
- Architecture: `replit.md`
- INSA Compliance: `INSA_COMPLIANCE_SUMMARY.md`
- Demo Script: `INSA_DEMO_WALKTHROUGH.md`

**Technical Support**:
- Email: tech@alga.et
- Emergency: +251 911 XXX XXX

**INSA Inquiries**:
- Email: insa.liaison@alga.et
- Compliance Officer: compliance@alga.et

---

## Success Metrics

### Key Performance Indicators (KPIs)

**After 1 Month**:
- ✅ Uptime: >99.5%
- ✅ Page load: <3 seconds (2G)
- ✅ Zero security incidents
- ✅ INSA certification received

**After 6 Months**:
- ✅ 10,000+ registered users
- ✅ 500+ active properties
- ✅ 1,000+ bookings completed
- ✅ Government partnership established

---

**Ready to Deploy!** 🚀

Follow this guide step-by-step for a successful production launch. For questions, refer to documentation or contact the technical team.

**አልጋ Alga - Ethiopia's Digital Future Starts Here** 🇪🇹
