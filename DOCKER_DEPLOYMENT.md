# 🐳 Docker Deployment Guide for Alga

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

## ✅ Prerequisites

1. **Docker** installed (v20.10+)
   ```bash
   docker --version
   ```

2. **Docker Compose** installed (v2.0+)
   ```bash
   docker-compose --version
   ```

3. **Environment variables** configured
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

## 🚀 Quick Start (Development)

```bash
# 1. Build and start all containers
docker-compose -f docker-compose.dev.yml up -d

# 2. View logs
docker-compose -f docker-compose.dev.yml logs -f

# 3. Access the app
# Open http://localhost:5000
```

## 🛠️ Development Setup

### Start Development Environment
```bash
# Build images
docker-compose -f docker-compose.dev.yml build

# Start containers with logs
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d
```

### Hot Reload
The development setup includes volume mounting, so your code changes will automatically reflect!

### Access Development Database
```bash
# Connect to PostgreSQL
docker exec -it alga-db-dev psql -U alga_dev -d alga_dev
```

## 🌍 Production Deployment

### 1. Prepare Environment
```bash
# Create production .env file
cp .env.example .env
nano .env  # Add production values
```

### 2. Build Production Images
```bash
docker-compose build --no-cache
```

### 3. Start Production Containers
```bash
docker-compose up -d
```

### 4. Run Database Migrations
```bash
docker exec -it alga-app npm run db:push
```

### 5. Check Status
```bash
docker-compose ps
docker-compose logs -f
```

## 📦 Common Commands

### Container Management
```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# View running containers
docker ps

# View logs
docker-compose logs -f alga-app
docker-compose logs -f db
docker-compose logs -f nginx
```

### Database Operations
```bash
# Run migrations
docker exec -it alga-app npm run db:push

# Backup database
docker exec -it alga-db pg_dump -U alga alga_db > backup.sql

# Restore database
cat backup.sql | docker exec -i alga-db psql -U alga -d alga_db
```

### Image Management
```bash
# Rebuild specific service
docker-compose build alga-app

# Remove all images
docker-compose down --rmi all

# Clean up unused images
docker image prune -a
```

## 🚢 Deployment Platforms

### AWS ECS/Fargate
1. Push images to ECR
2. Create ECS task definitions
3. Deploy via ECS service

### Google Cloud Run
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/alga-app
gcloud run deploy alga --image gcr.io/PROJECT_ID/alga-app
```

### DigitalOcean App Platform
1. Connect GitHub repository
2. Select "Docker" as build type
3. Configure environment variables
4. Deploy

### Railway / Render
1. Connect repository
2. Railway/Render auto-detects Dockerfile
3. Configure environment
4. Deploy

### Bare VPS (Ubuntu/Debian)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone https://github.com/Alga-weyni/alga-app.git
cd alga-app

# Configure environment
cp .env.example .env
nano .env

# Deploy
docker-compose up -d
```

## 🔒 SSL/HTTPS Setup

### Option 1: Let's Encrypt (Certbot)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d alga.et -d www.alga.et

# Copy certificates to nginx/ssl/
sudo cp /etc/letsencrypt/live/alga.et/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/alga.et/privkey.pem nginx/ssl/

# Uncomment HTTPS server block in nginx/default.conf
# Restart nginx
docker-compose restart nginx
```

### Option 2: Cloudflare
1. Point domain to your server IP
2. Enable Cloudflare proxy (orange cloud)
3. SSL mode: Full (strict)
4. No nginx SSL needed (Cloudflare handles it)

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs alga-app

# Check container status
docker ps -a

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Database connection errors
```bash
# Verify database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify DATABASE_URL in .env matches docker-compose.yml
```

### Port conflicts
```bash
# Check what's using port 5000
sudo lsof -i :5000

# Kill the process or change port in docker-compose.yml
```

### Upload files not persisting
```bash
# Ensure uploads volume is mounted
docker-compose down
docker-compose up -d

# Check volume
docker volume ls
docker volume inspect alga-app_uploads
```

## 📊 Monitoring

### View resource usage
```bash
docker stats
```

### Health checks
```bash
# App health
curl http://localhost:5000/api/health

# Database health
docker exec alga-db pg_isready -U alga
```

## 🔄 Updates & Maintenance

### Update application code
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run migrations if needed
docker exec -it alga-app npm run db:push
```

### Database backups (automated)
Create a cron job:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * docker exec alga-db pg_dump -U alga alga_db > /backups/alga_$(date +\%Y\%m\%d).sql
```

## 🎯 Best Practices

1. ✅ **Always use .env for secrets** - Never commit secrets to git
2. ✅ **Regular backups** - Automate database backups
3. ✅ **Monitor logs** - Check logs regularly for errors
4. ✅ **Update dependencies** - Keep Docker images updated
5. ✅ **Use specific image tags** - Avoid `latest` in production
6. ✅ **Health checks** - Enable and monitor health endpoints
7. ✅ **Resource limits** - Set memory/CPU limits in production

## 📞 Support

For issues or questions:
- GitHub: https://github.com/Alga-weyni/alga-app/issues
- Email: support@alga.et

---

**Made with ❤️ for Ethiopian hospitality**
