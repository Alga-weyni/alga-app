import "express-session";
import type { User } from "../shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: string;
    userRole: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
