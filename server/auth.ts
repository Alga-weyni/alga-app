import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from './storage.js';
import type { User } from '../shared/schema.js';

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl / 1000,
    tableName: "sessions",
  });
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  const isProduction = process.env.NODE_ENV === "production";
  
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'alga_session', // Security: Don't use default 'connect.sid'
    cookie: {
      httpOnly: true, // Security: Prevent XSS
      secure: isProduction, // Security: HTTPS only in production
      sameSite: isProduction ? 'none' : 'lax', // Cross-domain in production
      maxAge: sessionTtl,
      path: '/',
      domain: isProduction ? '.alga.et' : undefined, // Share across subdomains in production
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Enable passport-style login
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

  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      // Security: Clear session cookie with matching name and domain
      const isProduction = process.env.NODE_ENV === "production";
      res.clearCookie("alga_session", {
        domain: isProduction ? '.alga.et' : undefined,
        path: '/',
      });
      res.json({ message: "Logged out successfully" });
    });
  });
}

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
