import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from './routes.js';
import { log } from './utils.js';
import helmet from "helmet";
import cors from "cors";
import { applyINSAHardening } from './security/insa-hardening.js';
import { scheduleIntegrityChecks } from './cron/signature-integrity-check.js';

// Pure backend - no Vite or frontend code
const app = express();

// Security: Add helmet for security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// Security: Configure CORS - INSA-approved origins for mobile + web
const allowedOrigins = [
  // Production web
  "https://app.alga.et",
  "https://alga.et",
  // Capacitor mobile apps (Android with https scheme)
  "https://localhost",
  "https://localhost:5000",
  // Capacitor mobile apps (iOS/legacy)
  "capacitor://localhost",
  "capacitor://app",
  "ionic://localhost",
  // Development
  "http://localhost",
  "http://localhost:5000",
  "http://localhost:8080",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:8080",
  // Mobile file:// protocol
  "file://"
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.some(allowed => {
      if (allowed === "file://") {
        return origin.startsWith("file://") || origin === "null" || !origin;
      }
      return origin === allowed || origin.endsWith('.alga.et');
    })) {
      callback(null, true);
    } else if (process.env.NODE_ENV === "development") {
      // Allow all in development
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['X-Total-Count', 'Content-Length']
};
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Security: Limit request body size - increased for file uploads (INSA requirement)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// 🛡️ INSA Security Hardening (Ethiopian compliance)
// Protects against XSS, SQL injection, NoSQL injection, HPP, clickjacking
applyINSAHardening(app);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Security: Global error handler - don't leak stack traces in production
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Don't expose detailed error messages in production
    const errorResponse: any = { message };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }

    res.status(status).json(errorResponse);
    
    // Log error but don't throw in production
    if (process.env.NODE_ENV !== 'production') {
      throw err;
    } else {
      console.error('Error:', err);
    }
  });

  // Use PORT from environment (Render) or default to 5000 (Replit)
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // OTP Test Mode banner for INSA testers
    const otpMode = process.env.OTP_MODE || 'production';
    if (otpMode === 'test') {
      console.log('');
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║  🔐 OTP TEST MODE ACTIVE                                   ║');
      console.log('║  OTPs will be logged to console with [OTP-TEST] prefix     ║');
      console.log('║  Look for: [OTP-TEST] Registration/Login OTP for <email>   ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log('');
    }
    
    // Schedule daily signature integrity checks (INSA compliance)
    if (process.env.NODE_ENV === "production") {
      scheduleIntegrityChecks();
      log(`✅ Signature integrity checks scheduled (daily at 2:00 AM Ethiopian time)`);
    } else {
      log(`⚠️ Signature integrity checks disabled in development mode`);
    }
  });
})();
