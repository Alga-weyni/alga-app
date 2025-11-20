// server/vite.ts

import type { Express } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

/**
 * Logging function
 */
export function log(message: string, source = "server") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * NO VITE IN PRODUCTION
 * (This function is now a no-op)
 */
export async function setupVite(_app: Express, _server: any) {
  // Do nothing — Vite is not used in backend mode
  log("Vite middleware skipped (production mode)", "vite");
}

/**
 * Serve front-end static build files
 */
export function serveStatic(app: Express) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(__dirname, "..", "client", "dist");

  if (!fs.existsSync(distPath)) {
    console.error(
      `🚨 dist folder not found: ${distPath}\nBuild the frontend first:\n\n  cd client\n  npm run build\n`
    );
    return;
  }

  // Serve static assets
  app.use(express.static(distPath));

  // Handle SPA routing — return index.html on unknown routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  log("Serving static frontend from /client/dist");
}
