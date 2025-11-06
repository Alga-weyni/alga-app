# Source Code Structure Documentation
## Alga Mobile Application - Capacitor Hybrid App

---

## Project Structure

```
alga/
├── client/                      # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── pages/               # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── PropertyDetails.tsx
│   │   │   ├── Booking.tsx
│   │   │   ├── HostDashboard.tsx
│   │   │   ├── AgentDashboard.tsx
│   │   │   └── Admin.tsx
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # Shadcn components
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   └── NavBar.tsx
│   │   ├── lib/                 # Utilities
│   │   │   ├── queryClient.ts   # React Query config
│   │   │   └── utils.ts
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── use-toast.ts
│   │   │   └── use-user.ts
│   │   ├── App.tsx              # Main app component
│   │   └── index.css            # Tailwind styles
│   └── index.html
│
├── server/                      # Backend (Express + TypeScript)
│   ├── routes.ts                # API endpoints (40+)
│   ├── storage.ts               # Database interface
│   ├── index.ts                 # Express server setup
│   ├── vite.ts                  # Vite integration
│   └── security/
│       └── insa-hardening.ts    # INSA security controls
│
├── shared/                      # Shared types & schemas
│   └── schema.ts                # Drizzle database schema (20+ tables)
│
├── android/                     # Android native project (Capacitor)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── res/
│   │   ├── build.gradle
│   │   └── google-services.json (optional)
│   └── build.gradle
│
├── ios/                         # iOS native project (Capacitor)
│   ├── App/
│   │   ├── App/
│   │   │   ├── Info.plist
│   │   │   └── Assets.xcassets/
│   │   └── App.xcodeproj/
│   └── Podfile
│
├── capacitor.config.ts          # Capacitor configuration
├── vite.config.ts               # Vite build configuration
├── tailwind.config.ts           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── drizzle.config.ts            # Drizzle ORM config
└── package.json                 # Dependencies (85+ packages)
```

---

## Key Source Files

### **1. capacitor.config.ts**
**Purpose:** Capacitor framework configuration  
**Key Settings:**
- App ID: `com.alga.app`
- App Name: `Alga`
- Web directory: `dist/public`
- Native plugins: Camera, Geolocation, Push Notifications

```typescript
const config: CapacitorConfig = {
  appId: 'com.alga.app',
  appName: 'Alga',
  webDir: 'dist/public',
  plugins: {
    Camera: { enabled: true },
    Geolocation: { enabled: true },
    PushNotifications: { 
      presentationOptions: ['badge', 'sound', 'alert'] 
    }
  }
};
```

### **2. client/src/App.tsx**
**Purpose:** Main React application component  
**Responsibilities:**
- Route configuration (Wouter)
- Authentication state management
- Page navigation
- Mobile bottom navigation (native app)
- Header navigation (web app)

**Key Routes:**
```typescript
<Route path="/" component={Home} />
<Route path="/property/:id" component={PropertyDetails} />
<Route path="/booking/:propertyId" component={Booking} />
<Route path="/host-dashboard" component={HostDashboard} />
<Route path="/agent-dashboard" component={AgentDashboard} />
<Route path="/admin" component={Admin} />
```

### **3. server/routes.ts**
**Purpose:** Backend API endpoint definitions  
**Features:**
- 40+ RESTful endpoints
- Session-based authentication
- Role-based authorization
- Input validation (Zod, express-validator)
- Rate limiting

**Example Endpoints:**
```typescript
app.post('/api/auth/login', async (req, res) => { ... });
app.get('/api/properties', async (req, res) => { ... });
app.post('/api/bookings', requireAuth, async (req, res) => { ... });
app.post('/api/properties', requireRole('host'), async (req, res) => { ... });
```

### **4. shared/schema.ts**
**Purpose:** Database schema (Drizzle ORM)  
**Tables:** 20+ tables including:
- users
- properties
- bookings
- payments
- reviews
- agents
- agent_commissions
- user_activity_log

**Example Schema:**
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("guest"),
  // ... more fields
});
```

### **5. server/security/insa-hardening.ts**
**Purpose:** INSA-mandated security controls  
**Features:**
- XSS detection and prevention
- SQL injection pattern blocking
- Path traversal detection
- LDAP injection prevention
- Command injection blocking
- File inclusion prevention

**Security Layers:**
```typescript
export function insaSecurityHardening(req, res, next) {
  // XSS detection
  if (detectXSS(req.body)) {
    return res.status(400).json({ error: 'XSS detected' });
  }
  
  // SQL injection detection
  if (detectSQLInjection(req.query)) {
    return res.status(400).json({ error: 'SQL injection detected' });
  }
  
  next();
}
```

---

## Native Plugin Integration

### **Camera Plugin**
**File:** Uses `@capacitor/camera`  
**Purpose:** ID verification, property photos  
**Usage:**
```typescript
import { Camera } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Base64
  });
  // Upload to server
};
```

### **Geolocation Plugin**
**File:** Uses `@capacitor/geolocation`  
**Purpose:** Location-based property search  
**Usage:**
```typescript
import { Geolocation } from '@capacitor/geolocation';

const getCurrentLocation = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  // Search nearby properties
};
```

### **Push Notifications Plugin**
**File:** Uses `@capacitor/push-notifications`  
**Purpose:** Booking confirmations, messages  
**Usage:**
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

await PushNotifications.register();
await PushNotifications.addListener('pushNotificationReceived', 
  (notification) => {
    // Handle notification
  }
);
```

---

## Build Configuration

### **Android Build (build.gradle)**
**Location:** `android/app/build.gradle`  
**Key Settings:**
```gradle
android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "com.alga.app"
        minSdkVersion 22
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
}
```

### **iOS Build (Info.plist)**
**Location:** `ios/App/App/Info.plist`  
**Key Permissions:**
```xml
<key>NSCameraUsageDescription</key>
<string>Alga needs camera access for ID verification</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Alga needs your location to find nearby properties</string>
```

---

## Third-Party SDKs

### **Payment SDKs:**
1. **chapa-nodejs** (v1.x) - Ethiopian payments
2. **stripe** (v14.x) - International payments
3. **@paypal/paypal-server-sdk** (v1.x) - PayPal

### **Communication SDKs:**
4. **@sendgrid/mail** (v7.x) - Email notifications

### **Identity Verification:**
5. **tesseract.js** (v5.x) - OCR for foreign IDs
6. **html5-qrcode** (v2.x) - QR code scanning

### **Maps:**
7. **google-map-react** (v2.x) - Map integration

### **File Storage:**
8. **@google-cloud/storage** (v7.x) - Object storage

---

## Security Implementations

### **Password Hashing:**
```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### **Session Management:**
```typescript
import session from 'express-session';
import pgSession from 'connect-pg-simple';

app.use(session({
  store: new pgSession({ /* PostgreSQL config */ }),
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 86400000 // 24 hours
  }
}));
```

### **Input Validation:**
```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// Validate request
const data = loginSchema.parse(req.body);
```

---

## Development Scripts

**Build Web App:**
```bash
npm run build
```

**Start Development Server:**
```bash
npm run dev
```

**Sync Capacitor:**
```bash
npx cap sync android
npx cap sync ios
```

**Build Android APK:**
```bash
cd android
./gradlew assembleDebug
```

**Open in Android Studio:**
```bash
npx cap open android
```

**Open in Xcode:**
```bash
npx cap open ios
```

---

## Source Code Availability

**Full source code can be provided:**
- Via Git repository access
- On CD/DVD delivered to INSA office
- Compressed archive (.zip or .tar.gz)

**Code Statistics:**
- Total files: 500+
- Lines of code: 50,000+
- Languages: TypeScript (95%), Kotlin/Swift (5%)
- Test coverage: (To be implemented)

---

**Document Prepared By:** Alga Development Team  
**For:** INSA Mobile Application Security Audit  
**Last Updated:** November 6, 2025
