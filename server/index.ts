import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from './routes';
import { log } from './utils';
import helmet from "helmet";
import cors from "cors";
import { applyINSAHardening } from './security/insa-hardening';
import { scheduleIntegrityChecks } from './cron/signature-integrity-check';

// Pure backend - no Vite or frontend code
const app = express();

// Security: Add helmet for security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// Security: Configure CORS - INSA-approved origins for mobile + web
const allowedOrigins = [
  "https://app.alga.et",
  "capacitor://localhost",
  "http://localhost",
  "http://localhost:8080"
];

const corsOptions = {
  origin: process.env.NODE_ENV === "production" 
    ? allowedOrigins
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

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
    
    // Schedule daily signature integrity checks (INSA compliance)
    if (process.env.NODE_ENV === "production") {
      scheduleIntegrityChecks();
      log(`✅ Signature integrity checks scheduled (daily at 2:00 AM Ethiopian time)`);
    } else {
      log(`⚠️ Signature integrity checks disabled in development mode`);
    }
  });
})();
