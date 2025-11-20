import path from "path";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";

export function serveStatic(app: Express) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.error(`❌ Frontend build missing.\nRun:\n  cd client && npm run build`);
    return;
  }

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
