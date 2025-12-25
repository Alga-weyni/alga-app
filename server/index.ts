import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from './routes.js';
import { log } from './utils.js';
import helmet from "helmet";
import { applyINSAHardening } from './security/insa-hardening.js';
import { applyCORSHardening } from './security/cors-hardening.js';
import { scheduleIntegrityChecks } from './cron/signature-integrity-check.js';

// Pure backend - no Vite or frontend code
const app = express();

// Security: Add helmet for security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// INSA SECURITY FIX: Apply hardened CORS middleware
// Addresses audit finding: "Improper CORS Validation Allowing Cross-Origin 
// Authenticated Access via Multiple Origin Headers"
// - Rejects requests with multiple Origin headers
// - Validates against strict server-side allowlist
// - Selective credentials policy (only auth endpoints)
// - Centralized CORS handling for consistent enforcement
applyCORSHardening(app);

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
