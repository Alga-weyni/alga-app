import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import helmet from "helmet";
import cors from "cors";
import { applyINSAHardening } from "./security/insa-hardening";
import { scheduleIntegrityChecks } from "./cron/signature-integrity-check";
import { log } from "./vite"; // still using your log helper

const app = express();

// -------------------- SECURITY MIDDLEWARE --------------------
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGINS?.split(",") || []
        : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
applyINSAHardening(app);

// -------------------- LOGGING --------------------
app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedResponse: any;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedResponse = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (requestPath.startsWith("/api")) {
      const duration = Date.now() - start;
      let line = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;

      if (capturedResponse) line += ` :: ${JSON.stringify(capturedResponse)}`;
      if (line.length > 80) line = line.slice(0, 79) + "…";

      log(line);
    }
  });

  next();
});

// -------------------- API ROUTES --------------------
(async () => {
  const server = await registerRoutes(app);

  // -------------------- ERROR HANDLING --------------------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    const response: any = { message: err.message || "Internal Server Error" };

    if (process.env.NODE_ENV !== "production") response.stack = err.stack;

    console.error("❌ API Error:", err);
    res.status(status).json(response);
  });

  // -------------------- FRONTEND SERVE (PRODUCTION) --------------------
  if (process.env.NODE_ENV === "production") {
    const { serveStatic } = await import("./vite");

    serveStatic(app);

    scheduleIntegrityChecks();
    log("🔐 INSA integrity checks active");
  } else {
    // -------------------- VITE DEV MODE --------------------
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
    log("⚡ Running with Vite (development mode)");
  }

  // -------------------- SERVER START --------------------
  const port = parseInt(process.env.PORT || "5000", 10);

  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`🚀 Server running on port ${port}`);
    }
  );
})();
