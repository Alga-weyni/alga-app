import type { Express, RequestHandler } from "express";
import session, { type CookieOptions } from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";
import type { User } from "@shared/schema";

const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

// 🔥 Correct unified cookie settings for cross-domain auth
const cookieSettings: CookieOptions = {
  httpOnly: true, // Security: Prevent XSS attacks
  secure: true, // Required for HTTPS-only cookies
  sameSite: "none", // Allow cross-domain cookies across app.alga.et + api.alga.et
  domain: ".alga.et", // Enables cookie sharing across subdomains
  path: "/", // Accessible site-wide
  maxAge: sessionTtl,
};

export function getSession() {
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    createTableIfMissing: false,
    ttl: sessionTtl / 1000,
    tableName: "sessions",
  });

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: "sessionId", // Security: Don’t use default connect.sid
    cookie: cookieSettings,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Attach login helper
  app.use((req, res, next) => {
    (req as any).login = (user: User, callback: (err?: any) => void) => {
      (req.session as any).userId = user.id;
      (req.session as any).userRole = user.role;
      req.session.save((err) => {
        callback(err);
      });
    };
    next();
  });

  // Logout route
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }

      // 🔥 Clear session cookie globally
      res.clearCookie("sessionId", {
        ...cookieSettings,
      });

      res.json({ message: "Logged out successfully" });
    });
  });
}

// Auth middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any).userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  (req as any).user = user;
  next();
};
