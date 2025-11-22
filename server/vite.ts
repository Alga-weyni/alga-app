// server/vite.ts

import type { Express } from "express";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

/**
 * Utility logger for consistent console output
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
 * In production, we do NOT attach Vite middleware.
 * This keeps backend clean and avoids Node crashing on missing Vite deps.
 */
export async function setupVite(_app: Express, _server: any) {
  log("Vite middleware disabled (production mode)", "vite");
}

/**
 * Serves the built frontend (React/Vite) from /server/dist/public
 */
export function serveStatic(app: Express) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(__dirname, "..", "server", "dist", "public");
  const indexPath = path.join(distPath, "index.html");

  if (!fs.existsSync(distPath)) {
    console.error(
      `❌ Frontend build missing.\nRun:\n\n  cd client\n  npm run build\n`
    );
    return; // Do NOT kill the backend – just log
  }

  // Serve static assets
  app.use(express.static(distPath));

  // SPA fallback routing
  app.get("*", (_req, res) => {
    res.sendFile(indexPath);
  });

  log(`Serving static frontend from ${distPath}`, "vite");
}
