# 🏠 Alga - Ethiopian Property Rental Platform

[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/node-20.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Stay. Discover. Belong. The Ethiopian Way!**

Alga ("bed" in Amharic) is a full-stack web application connecting property owners with travelers seeking authentic accommodations across Ethiopia. From traditional homes to modern hotels, experience the warmth of Ethiopian hospitality.

## ✨ Features

### 🔐 Authentication & Security
- **Passwordless 4-digit OTP authentication** (phone SMS & email)
- Role-based access control (Guest, Host, Admin, Operator)
- Universal ID verification system (QR code scanning for Ethiopians, OCR for foreigners)
- Fayda ID eKYC integration
- Secure session management with PostgreSQL storage
- Rate limiting and CORS protection

### 🏘️ Property Management
- Comprehensive property listings with drag-and-drop image upload
- Minimum 5 high-quality images required
- Advanced search & filters (city, type, price, capacity, dates)
- Real-time availability checking
- 6-digit auto-generated access codes for property entry
- **Seamless booking with URL parameters** (/properties/123?book=true&checkIn=date&guests=2)
- Auto-opening booking dialog with pre-filled dates

### 🛠️ Services Marketplace
- **11 service categories** (cleaning, laundry, transport, guides, etc.)
- **Clear guest/provider flow separation** (/services for browsing, /become-provider for applications)
- Verified provider badges (Verified, Top Rated, Experienced)
- Admin verification dashboard with approval workflow
- Email notifications via SendGrid (application received, approved, rejected)
- Status-based provider dashboard (pending, rejected, approved)

### 💳 Payment Integration
- Multiple payment gateways: Chapa, Stripe, PayPal, Telebirr
- ERCA-compliant tax system (12% commission + 15% VAT + 2% withholding)
- Automated PDF invoice generation
- Secure payment processing and webhooks

### ⭐ Review System
- Advanced weighted review algorithm (time-decay)
- 6 rating categories (overall, cleanliness, communication, accuracy, location, value)
- Auto-recalculation of property ratings

### 📍 Location Features
- Google Maps integration with autocomplete and clustering
- Property markers with custom Ethiopian theming
- Map/list view toggle with user location tracking
- Latitude/longitude storage
- City-based filtering across 20 Ethiopian cities

### 🎨 Design
- Ethiopian-themed warm brown color palette
- Responsive mobile-first design
- Dark mode support
- Minimal, clean UI with Playfair Display typography

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ OR Docker
- npm or yarn

### Local Development (Without Docker)

```bash
# Clone repository
git clone https://github.com/Alga-weyni/alga-app.git
cd alga-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:5000`

### Local Development (With Docker)

```bash
# Clone repository
git clone https://github.com/Alga-weyni/alga-app.git
cd alga-app

# Configure environment
cp .env.example .env
# Edit .env with your values

# Start with Docker Compose
docker-compose -f docker-compose.dev.yml up

# Run migrations
docker exec -it alga-dev npm run db:push
```

Visit `http://localhost:5000`

## 🐳 Docker Deployment

### Production Deployment

```bash
# Build production images
docker-compose build

# Start containers
docker-compose up -d

# Run migrations
docker exec -it alga-app npm run db:push

# View logs
docker-compose logs -f
```

### Deployment Platforms

- **AWS ECS/Fargate** - Push to ECR, deploy with ECS
- **Google Cloud Run** - `gcloud builds submit`
- **DigitalOcean App Platform** - Connect GitHub repo
- **Railway / Render** - Auto-detect Dockerfile
- **Bare VPS** - Ubuntu/Debian with Docker installed

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for detailed instructions.

## 📁 Project Structure

```
alga-app/
├── client/                 # React frontend
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable UI components
│       └── lib/           # Utilities & hooks
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database layer
│   ├── auth.ts            # Authentication
│   └── utils/             # Utilities
├── shared/                # Shared types & schemas
│   └── schema.ts          # Drizzle ORM schemas
├── nginx/                 # Nginx configuration
├── uploads/               # User-uploaded files
├── Dockerfile             # Production container
├── docker-compose.yml     # Production orchestration
└── DOCKER_DEPLOYMENT.md   # Deployment guide
```

## 🔧 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **Wouter** - Routing
- **Shadcn/ui** - UI components (Radix UI)
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **React Hook Form** + Zod - Form validation

### Backend
- **Node.js 20** with TypeScript
- **Express.js** - Web framework
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM** - Database ORM
- **Passport.js** - Authentication
- **Multer** - File uploads
- **Helmet** - Security headers

### DevOps
- **Docker** & Docker Compose
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD (optional)

## 🔑 Environment Variables

Key variables needed (see `.env.example` for full list):

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# Session
SESSION_SECRET=your-secret-key

# SendGrid Email
SENDGRID_API_KEY=SG.your-key

# Google Maps
GOOGLE_MAPS_API_KEY=AIza-your-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key

# PayPal
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret
```

## 📊 Database Schema

- **users** - User accounts with roles
- **properties** - Property listings
- **bookings** - Reservation records
- **reviews** - Property reviews with ratings
- **favorites** - User favorite properties
- **id_verifications** - Identity verification records
- **transactions** - Payment records

## 🛡️ Security Features

- Bcrypt password hashing (auto-generated 32-byte passwords)
- Secure 4-digit OTP generation with 10-minute expiry
- Rate limiting (100 req/15min dev, 10 req/15min production for auth)
- Helmet.js security headers
- CORS protection
- Request size limits (10MB body, 50MB files)
- Session security (httpOnly, sameSite cookies)

## 🧪 Testing

```bash
# Run type checking
npm run check

# Build frontend
npm run build

# Test production build locally
npm run start
```

## 📝 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run check      # TypeScript type checking
npm run db:push    # Push database schema changes
```

## 🌍 Deployment Checklist

- [ ] Configure all environment variables
- [ ] Enable required APIs (Maps, Places, SendGrid)
- [ ] Set up payment gateway webhooks
- [ ] Configure domain and SSL certificates
- [ ] Set up database backups
- [ ] Enable monitoring and logging
- [ ] Configure CORS for production domain
- [ ] Test OTP delivery (SMS and email)
- [ ] Verify file upload functionality
- [ ] Test payment flows end-to-end

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For questions or issues:
- GitHub Issues: [Alga Issues](https://github.com/Alga-weyni/alga-app/issues)
- Email: support@alga.et

## 🙏 Acknowledgments

- Ethiopian hospitality and culture
- Open-source community
- All contributors and testers

---

**Made with ❤️ for Ethiopian hospitality**

Visit us at [alga.et](https://alga.et) (coming soon)
