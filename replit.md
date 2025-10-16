# Ethiopia Stays

## Overview

Ethiopia Stays is a property rental platform specifically designed for the Ethiopian market, built as a full-stack web application. The platform connects property owners (hosts) with travelers seeking authentic Ethiopian accommodations, ranging from traditional homes to modern hotels and guesthouses. The application emphasizes local culture, safety features, and supports multiple Ethiopian cities and regions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 16, 2025 - Admin Dashboard & Start Hosting Page
- **Admin Dashboard Enhancements**:
  - Added 5-tab admin interface: System Overview, User Management, Property Verification, ID Verification, System Config
  - System statistics and role distribution dashboard
  - Admin-specific sign out button
  - Operator management panel
  - Platform settings control
- **Start Hosting Page** (`/start-hosting`):
  - Dedicated onboarding page for first-time hosts
  - Host account registration form with validation
  - Benefits showcase for potential hosts
  - "Start Hosting" link in header (visible to non-authenticated users)
  - Automatic redirect to host dashboard after registration

### October 15, 2025 - Custom Authentication Implementation
- **Replaced Replit Auth** with custom email/password authentication system
- **Security**: All passwords hashed with bcrypt (10 salt rounds)
- **Role System**: 
  - Guest (default for new registrations)
  - Host (can list properties)
  - Admin (full system access - must be assigned by existing admin)
  - Operator (property verification)
- **Features**:
  - Registration with email/password (auto-assigned "guest" role)
  - Login with email/password
  - Role-based redirects after authentication (admin → /admin/dashboard, host → /host/dashboard, guest → /)
  - Session-based authentication with PostgreSQL storage
  - Secure logout with session destruction

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with a simple, declarative approach
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with a custom Ethiopian-themed color palette (green, yellow, red from the flag)
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Forms**: React Hook Form with Zod schema validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules throughout the codebase
- **API Design**: RESTful API structure with organized route handlers
- **Session Management**: Express sessions with PostgreSQL storage for scalability
- **Development**: Hot reload enabled with Vite integration for seamless development experience

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Comprehensive schema covering users, properties, bookings, reviews, favorites, and verification systems
- **Migrations**: Drizzle Kit for database schema migrations and version control

### Authentication & Authorization
- **Provider**: Custom email/password authentication with bcrypt hashing
- **Session Management**: Express sessions with PostgreSQL storage (connect-pg-simple)
- **Security**: 
  - Bcrypt password hashing (salt rounds: 10)
  - Secure session cookies (httpOnly, secure in production)
  - SESSION_SECRET environment variable required (fails fast if missing)
- **User Management**: Role-based access control (admin, host, guest)
  - New registrations: Forced to "guest" role (no self-service privilege escalation)
  - Role promotion: Admin-only through /api/admin/users/:userId/role endpoint
  - Protected routes: isAuthenticated middleware validates session and loads user

### Key Features Architecture
- **Property Management**: Full CRUD operations for property listings with image uploads and detailed descriptions
- **Booking System**: Complete booking workflow with date validation and conflict prevention
- **Review System**: User-generated reviews and ratings for properties
- **Verification System**: 
  - Phone verification using Ethiopian Telecom SMS service
  - ID document verification for hosts and tenants
  - Multi-stage verification process for enhanced security
- **International Support**: Multi-language support with Ethiopian localization (Amharic, English)
- **Safety Features**: Location sharing, emergency contacts, and safety check-ins

### Security Features
- **Input Validation**: Comprehensive validation using Zod schemas on both client and server
- **CSRF Protection**: Built-in session security with secure cookie configuration
- **Data Sanitization**: Type-safe operations through TypeScript and Drizzle ORM
- **File Upload Security**: Secure handling of document uploads for verification

## External Dependencies

### Payment Processing
- **PayPal SDK**: International payment processing for global travelers
- **Ethiopian Payment Methods**: Integration ready for local payment services (Telebirr, CBE Birr)

### Communication Services
- **SMS Service**: Ethiopian Telecom integration for phone verification
- **Development Mode**: Console logging fallback when SMS credentials are not configured

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time capabilities through WebSocket constructor configuration

### Development Tools
- **Replit Integration**: Native Replit development environment support with cartographer plugin
- **Error Handling**: Runtime error overlay for development debugging
- **Build Tools**: ESBuild for production builds with platform-specific optimizations

### UI & Design
- **Radix UI**: Comprehensive primitive components for accessible UI building
- **Lucide Icons**: Consistent icon library throughout the application
- **Custom Fonts**: Ethiopian-appropriate typography and design elements

### Utility Libraries
- **Date Handling**: date-fns for robust date manipulation and formatting
- **Utility Functions**: clsx and tailwind-merge for conditional styling
- **Memoization**: Memoizee for performance optimization of expensive operations