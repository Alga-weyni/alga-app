import type { Request, Response } from "express";
import { db } from "../db";
import { properties } from "../../shared/schema";
import sampleData from "../sampleData.json";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Check Bearer token authorization
  const authHeader = req.headers.authorization;
  const adminSeedKey = process.env.ADMIN_SEED_KEY;

  if (!adminSeedKey) {
    console.error("ADMIN_SEED_KEY not configured in environment");
    return res.status(500).json({ message: "Seed key not configured" });
  }

  if (authHeader !== `Bearer ${adminSeedKey}`) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    // Check if properties already exist
    const existingProperties = await db.select().from(properties).limit(1);
    
    if (existingProperties.length > 0) {
      return res.status(400).json({ 
        message: "Database already contains properties. Seeding skipped to prevent duplicates.",
        existingCount: existingProperties.length 
      });
    }

    // Insert sample data
    await db.insert(properties).values(sampleData as any);
    
    res.status(200).json({ 
      message: "✅ Seeded successfully!",
      count: sampleData.length 
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ 
      message: "Failed to seed database",
      error: String(error)
    });
  }
}
