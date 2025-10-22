import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertPropertySchema, insertBookingSchema, insertReviewSchema, insertFavoriteSchema, registerPhoneUserSchema, registerEmailUserSchema, loginPhoneUserSchema, loginEmailUserSchema, verifyOtpSchema, type Booking, users } from "@shared/schema";
import { smsService } from "./smsService";
import bcrypt from "bcrypt";
import { randomBytes, randomInt } from "crypto";
import paymentRouter from "./payment";
import rateLimit from "express-rate-limit";
import { generateInvoice } from "./utils/invoice";
import { sendOtpEmail, sendWelcomeEmail, sendProviderApplicationReceivedEmail, sendProviderApplicationApprovedEmail, sendProviderApplicationRejectedEmail } from "./utils/email.js";
import { verifyFaydaId, updateUserFaydaVerification, isFaydaVerified } from "./fayda-verification";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { imageProcessor } from "./imageProcessor";

// Security: Rate limiting for authentication endpoints
// More generous limits in development for testing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 100 in dev, 10 in production
  message: { message: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security: General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload configuration
const uploadDir = path.join(process.cwd(), 'uploads', 'properties');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const idDocsUploadDir = path.join(process.cwd(), 'uploads', 'id-documents');
if (!fs.existsSync(idDocsUploadDir)) {
  fs.mkdirSync(idDocsUploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const idFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, idDocsUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(6).toString('hex')}`;
    cb(null, `id-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 20 // Max 20 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  }
});

const idUpload = multer({
  storage: idFileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 1 // Only one ID document at a time
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Apply general rate limiting to all API routes
  app.use('/api/', apiLimiter);

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, (req, res, next) => {
    const filePath = path.join(process.cwd(), 'uploads', req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

  // File upload endpoint (protected - requires authentication)
  // Now with auto-compression and watermark overlay!
  app.post('/api/upload/property-images', isAuthenticated, upload.array('images', 20), async (req: any, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const files = req.files as Express.Multer.File[];
      const processedFiles: Array<{ url: string; stats: any }> = [];

      // Process each image with compression and watermark
      for (const file of files) {
        const originalBuffer = fs.readFileSync(file.path);
        const originalSize = originalBuffer.length;

        // Compress and add watermark
        const compressedBuffer = await imageProcessor.processImage(originalBuffer, {
          maxWidth: 1280,
          maxHeight: 720,
          quality: 70,
          addWatermark: true,
          watermarkOpacity: 0.25,
        });

        // Overwrite original file with compressed version
        fs.writeFileSync(file.path, compressedBuffer);

        const stats = imageProcessor.getCompressionStats(originalSize, compressedBuffer.length);
        processedFiles.push({
          url: `/uploads/properties/${file.filename}`,
          stats,
        });
      }

      res.json({
        message: 'Files uploaded and optimized successfully',
        urls: processedFiles.map((f) => f.url),
        count: files.length,
        optimization: {
          avgReduction: Math.round(
            processedFiles.reduce((sum, f) => sum + f.stats.reductionPercent, 0) / files.length
          ),
          totalSavings: processedFiles.reduce((sum, f) => sum + f.stats.savings, 0),
        },
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message || 'Failed to upload files' });
    }
  });

  // ID document upload endpoint (protected - requires authentication)
  app.post('/api/upload/id-document', isAuthenticated, idUpload.single('image'), (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const imageUrl = `/uploads/id-documents/${req.file.filename}`;

      res.json({
        message: 'ID document uploaded successfully',
        url: imageUrl
      });
    } catch (error: any) {
      console.error('ID upload error:', error);
      res.status(500).json({ message: error.message || 'Failed to upload ID document' });
    }
  });

  // === OBJECT STORAGE ENDPOINTS (Replit App Storage) ===
  // Referenced from blueprint:javascript_object_storage
  
  // Serve files from Object Storage (with ACL checks for protected files)
  app.get('/objects/:objectPath(*)', async (req: any, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // Get user ID if authenticated
      const userId = req.user?.id;
      
      // Check access permissions
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.sendStatus(401);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('Error accessing object:', error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get presigned URL for uploading files to Object Storage
  app.post('/api/objects/upload', isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error('Error generating upload URL:', error);
      res.status(500).json({ error: error.message || 'Failed to generate upload URL' });
    }
  });

  // Set ACL policy for uploaded property/service images
  app.put('/api/objects/set-acl', isAuthenticated, async (req: any, res) => {
    try {
      const { imageURL, visibility = 'public' } = req.body;
      
      if (!imageURL) {
        return res.status(400).json({ error: 'imageURL is required' });
      }

      const userId = req.user.id;
      const objectStorageService = new ObjectStorageService();
      
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        imageURL,
        {
          owner: userId,
          visibility,
        }
      );

      res.status(200).json({ objectPath });
    } catch (error: any) {
      console.error('Error setting ACL:', error);
      res.status(500).json({ error: error.message || 'Failed to set ACL policy' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: 'Ethiopia Stays API',
      version: '1.0.0',
      payments: {
        stripe: !!process.env.STRIPE_SECRET_KEY,
        telebirr: !!process.env.TELEBIRR_APP_ID,
        paypal: !!process.env.PAYPAL_CLIENT_ID
      }
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // === PASSWORDLESS OTP AUTHENTICATION ===
  
  // Request OTP for Phone Registration (Passwordless)
  app.post('/api/auth/request-otp/phone/register', authLimiter, async (req, res) => {
    try {
      const { phoneNumber, firstName, lastName } = req.body;
      
      if (!phoneNumber || !firstName || !lastName) {
        return res.status(400).json({ message: "Phone number, first name, and last name are required" });
      }

      // Check if phone number already exists
      const existingUser = await storage.getUserByPhoneNumber(phoneNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Phone number already registered. Please login instead." });
      }

      // Auto-generate secure password in background (user doesn't need to know)
      const autoPassword = randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(autoPassword, 10);
      
      // Security: Generate cryptographically secure 4-digit OTP
      const otp = randomInt(1000, 10000).toString();
      
      // Create user
      const userId = randomBytes(16).toString('hex');
      await storage.createUser({
        id: userId,
        phoneNumber,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'guest',
      });
      
      // Save OTP
      await storage.saveOtp(phoneNumber, otp, 10);
      
      // Log OTP for development (in production, send via SMS)
      console.log(`[PASSWORDLESS AUTH] Registration OTP for ${phoneNumber}: ${otp}`);
      
      res.json({ 
        message: "OTP sent to your phone",
        phoneNumber,
        contact: phoneNumber,
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error: any) {
      console.error("Error in passwordless phone registration:", error);
      res.status(400).json({ message: error.message || "Failed to send OTP" });
    }
  });

  // Request OTP for Phone Login (Passwordless)
  app.post('/api/auth/request-otp/phone/login', authLimiter, async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const user = await storage.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: "Phone number not registered. Please create an account first." });
      }

      // Security: Generate cryptographically secure 4-digit OTP
      const otp = randomInt(1000, 10000).toString();
      await storage.saveOtp(phoneNumber, otp, 10);
      
      // Log OTP for development (in production, send via SMS)
      console.log(`[PASSWORDLESS AUTH] Login OTP for ${phoneNumber}: ${otp}`);
      
      res.json({ 
        message: "OTP sent to your phone",
        phoneNumber,
        contact: phoneNumber,
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error: any) {
      console.error("Error in passwordless phone login:", error);
      res.status(400).json({ message: error.message || "Failed to send OTP" });
    }
  });

  // Request OTP for Email Registration (Passwordless)
  app.post('/api/auth/request-otp/email/register', authLimiter, async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, first name, and last name are required" });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered. Please login instead." });
      }

      // Auto-generate secure password in background (user doesn't need to know)
      const autoPassword = randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(autoPassword, 10);
      
      // Security: Generate cryptographically secure 4-digit OTP
      const otp = randomInt(1000, 10000).toString();
      
      // Create user
      const userId = randomBytes(16).toString('hex');
      await storage.createUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'guest',
      });
      
      // Save OTP (store with email as key)
      await storage.saveOtp(email, otp, 10);
      
      // Send OTP via email in background (non-blocking)
      sendOtpEmail(email, otp, firstName).catch(err => {
        console.error('[EMAIL] Failed to send OTP email (non-critical):', err);
      });
      
      // Log OTP for development
      console.log(`[PASSWORDLESS AUTH] Registration OTP for ${email}: ${otp}`);
      
      res.json({ 
        message: "OTP sent to your email",
        email,
        contact: email,
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error: any) {
      console.error("Error in passwordless email registration:", error);
      res.status(400).json({ message: error.message || "Failed to send OTP" });
    }
  });

  // Request OTP for Email Login (Passwordless)
  app.post('/api/auth/request-otp/email/login', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Email not registered. Please create an account first." });
      }

      // Security: Generate cryptographically secure 4-digit OTP
      const otp = randomInt(1000, 10000).toString();
      await storage.saveOtp(email, otp, 10);
      
      // Send OTP via email in background (non-blocking)
      sendOtpEmail(email, otp, user.firstName || undefined).catch(err => {
        console.error('[EMAIL] Failed to send OTP email (non-critical):', err);
      });
      
      // Log OTP for development
      console.log(`[PASSWORDLESS AUTH] Login OTP for ${email}: ${otp}`);
      
      res.json({ 
        message: "OTP sent to your email",
        email,
        contact: email,
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error: any) {
      console.error("Error in passwordless email login:", error);
      res.status(400).json({ message: error.message || "Failed to send OTP" });
    }
  });

  // === LEGACY PASSWORD-BASED AUTHENTICATION (kept for backward compatibility) ===
  
  // Phone Registration - Step 1: Register with password
  app.post('/api/auth/register/phone', authLimiter, async (req, res) => {
    try {
      const validatedData = registerPhoneUserSchema.parse(req.body);
      
      // Check if phone number already exists
      const existingUser = await storage.getUserByPhoneNumber(validatedData.phoneNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Security: Generate cryptographically secure 4-digit OTP
      const otp = randomInt(1000, 10000).toString();
      
      // Create user
      const userId = randomBytes(16).toString('hex');
      await storage.createUser({
        id: userId,
        phoneNumber: validatedData.phoneNumber,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'guest',
      });
      
      // Save OTP
      await storage.saveOtp(validatedData.phoneNumber, otp, 10);
      
      // Log OTP for development (in production, send via SMS)
      console.log(`[AUTH] OTP for ${validatedData.phoneNumber}: ${otp}`);
      
      res.json({ 
        message: "Registration successful. OTP sent to your phone.",
        phoneNumber: validatedData.phoneNumber,
        requiresOtp: true,
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error: any) {
      console.error("Error registering phone user:", error);
      res.status(400).json({ message: error.message || "Failed to register" });
    }
  });

  // Verify OTP (Works for both phone and email, passwordless and legacy)
  app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
    try {
      const { phoneNumber, email, otp } = req.body;
      
      if (!otp) {
        return res.status(400).json({ message: "OTP is required" });
      }

      if (!phoneNumber && !email) {
        return res.status(400).json({ message: "Phone number or email is required" });
      }

      const contact = phoneNumber || email;
      const isValid = await storage.verifyOtp(contact, otp);
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Get user and mark as verified
      let user;
      if (phoneNumber) {
        user = await storage.markPhoneVerified(phoneNumber);
      } else if (email) {
        // For email, just get user (emails are auto-verified)
        user = await storage.getUserByEmail(email);
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log in user
      (req as any).login(user, (err: any) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in after verification" });
        }
        res.json({ 
          message: "Verification successful",
          user,
          redirect: user.role === 'admin' ? '/admin/dashboard' : user.role === 'operator' ? '/operator/dashboard' : user.role === 'host' ? '/host/dashboard' : '/properties'
        });
      });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      res.status(400).json({ message: error.message || "Failed to verify OTP" });
    }
  });

  // Phone Login - Step 1: Login with password
  app.post('/api/auth/login/phone', authLimiter, async (req, res) => {
    try {
      const validatedData = loginPhoneUserSchema.parse(req.body);
      
      const user = await storage.getUserByPhoneNumber(validatedData.phoneNumber);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid phone number or password" });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid phone number or password" });
      }

      // Security: Generate cryptographically secure OTP
      const otp = randomInt(1000, 10000).toString();
      await storage.saveOtp(validatedData.phoneNumber, otp, 10);
      
      // Log OTP for development (in production, send via SMS)
      console.log(`[AUTH] Login OTP for ${validatedData.phoneNumber}: ${otp}`);
      
      res.json({ 
        message: "OTP sent to your phone",
        phoneNumber: validatedData.phoneNumber,
        requiresOtp: true,
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error: any) {
      console.error("Error logging in with phone:", error);
      res.status(400).json({ message: error.message || "Failed to log in" });
    }
  });

  // Email Registration
  app.post('/api/auth/register/email', authLimiter, async (req, res) => {
    try {
      const validatedData = registerEmailUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const userId = randomBytes(16).toString('hex');
      const user = await storage.createUser({
        id: userId,
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'guest',
      });
      
      // Log in user
      (req as any).login(user, (err: any) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in after registration" });
        }
        res.json({ 
          message: "Registration successful",
          user,
          redirect: '/'
        });
      });
    } catch (error: any) {
      console.error("Error registering email user:", error);
      res.status(400).json({ message: error.message || "Failed to register" });
    }
  });

  // Email Login
  app.post('/api/auth/login/email', authLimiter, async (req, res) => {
    try {
      const validatedData = loginEmailUserSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Log in user
      (req as any).login(user, (err: any) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in" });
        }
        res.json({ 
          message: "Login successful",
          user,
          redirect: user.role === 'admin' ? '/admin/dashboard' : user.role === 'operator' ? '/operator/dashboard' : user.role === 'host' ? '/host/dashboard' : '/'
        });
      });
    } catch (error: any) {
      console.error("Error logging in with email:", error);
      res.status(400).json({ message: error.message || "Failed to log in" });
    }
  });

  // SMS Verification routes for Ethio Telecom
  app.post('/api/sms/send-verification', async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const result = await smsService.sendVerificationCode(phone);
      
      if (result.success) {
        res.json({ message: "Verification code sent successfully" });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post('/api/sms/verify-code', async (req, res) => {
    try {
      const { phone, code } = req.body;
      
      if (!phone || !code) {
        return res.status(400).json({ message: "Phone number and verification code are required" });
      }

      const result = await smsService.verifyCode(phone, code);
      
      if (result.success) {
        res.json({ message: "Phone number verified successfully", verified: true });
      } else {
        res.status(400).json({ message: result.error, verified: false });
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      res.status(500).json({ message: "Failed to verify code" });
    }
  });

  // Admin routes for user role management
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:userId/role', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { userId } = req.params;
      const { role } = req.body;
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.patch('/api/admin/users/:userId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { userId } = req.params;
      const { status } = req.body;
      
      const updatedUser = await storage.updateUserStatus(userId, status);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Admin property verification routes
  app.get('/api/admin/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or operator access required" });
      }
      
      const properties = await storage.getAllPropertiesForVerification();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties for verification:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.patch('/api/admin/properties/:propertyId/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or operator access required" });
      }
      
      const { propertyId } = req.params;
      const { status, rejectionReason } = req.body;
      const verifierId = req.user.id;
      
      const updatedProperty = await storage.verifyProperty(parseInt(propertyId), status, verifierId, rejectionReason);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error verifying property:", error);
      res.status(500).json({ message: "Failed to verify property" });
    }
  });

  // Admin financial reports (ERCA compliance)
  app.get('/api/admin/financial-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { startDate, endDate } = req.query;
      const { calculateMonthlySummary } = await import('./utils/booking.js');
      
      // Get all paid bookings
      const allBookings = await storage.getAllBookings();
      let filteredBookings = allBookings.filter((b: Booking) => b.paymentStatus === 'paid');
      
      // Filter by date range if provided
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        filteredBookings = filteredBookings.filter((b: Booking) => {
          const bookingDate = b.createdAt ? new Date(b.createdAt) : new Date();
          return bookingDate >= start && bookingDate <= end;
        });
      }
      
      // Calculate summary (convert null to undefined for type compatibility)
      const summary = calculateMonthlySummary(filteredBookings.map(b => ({
        totalPrice: b.totalPrice,
        algaCommission: b.algaCommission ?? undefined,
        vat: b.vat ?? undefined,
        withholding: b.withholding ?? undefined,
        hostPayout: b.hostPayout ?? undefined,
      })));
      
      // Format detailed bookings for export
      const detailedBookings = filteredBookings.map((b: Booking) => ({
        bookingId: b.id,
        date: b.createdAt,
        propertyId: b.propertyId,
        guestId: b.guestId,
        totalRevenue: parseFloat(b.totalPrice),
        algaCommission: parseFloat(b.algaCommission || '0'),
        vat: parseFloat(b.vat || '0'),
        withholding: parseFloat(b.withholding || '0'),
        hostPayout: parseFloat(b.hostPayout || '0'),
      }));
      
      res.json({
        summary,
        detailedBookings,
        period: {
          start: startDate || filteredBookings[0]?.createdAt,
          end: endDate || new Date(),
        },
        generated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating financial report:", error);
      res.status(500).json({ message: "Failed to generate financial report" });
    }
  });

  // Seed database endpoint (production setup - uses Bearer token auth)
  // Usage: POST /api/admin/seed-database with Authorization: Bearer YOUR_ADMIN_SEED_KEY
  app.post('/api/admin/seed-database', async (req: any, res) => {
    const seedHandler = (await import('./api/seed.js')).default;
    return seedHandler(req, res);
  });

  // Document verification routes
  app.post('/api/verification-documents/upload', isAuthenticated, async (req: any, res) => {
    try {
      // Security: In production, validate file type, size (max 5MB), and scan for malware
      // Security: Use multipart/form-data parser with size limits
      // Security: Store files in isolated cloud storage (AWS S3, Cloudinary) with restricted access
      // For now, we'll simulate the upload
      const { documentType, userId } = req.body;
      
      // Security: Validate userId matches authenticated user (except for admins)
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Cannot upload documents for other users" });
      }
      
      const documentUrl = `https://example.com/documents/${Date.now()}.jpg`; // Mock URL
      
      const document = await storage.createVerificationDocument({
        userId,
        documentType,
        documentUrl,
        status: 'pending'
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get('/api/verification-documents/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user.id;
      const userRole = req.user.role || 'guest';
      
      // Only allow access to own documents or if admin/operator
      if (userId !== requestingUserId && !['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Unauthorized to access these documents" });
      }
      
      const documents = await storage.getVerificationDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get('/api/admin/verification-documents', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or operator access required" });
      }
      
      const documents = await storage.getAllVerificationDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.patch('/api/admin/documents/:documentId/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or operator access required" });
      }
      
      const { documentId } = req.params;
      const { status, rejectionReason } = req.body;
      const verifierId = req.user.id;
      
      const updatedDocument = await storage.verifyDocument(parseInt(documentId), status, verifierId, rejectionReason);
      
      // If verification is approved, upgrade guest to host role
      if (status === 'approved' && updatedDocument) {
        const documentOwner = await storage.getUser(updatedDocument.userId);
        if (documentOwner && documentOwner.role === 'guest') {
          await storage.upsertUser({
            ...documentOwner,
            role: 'host',
            idVerified: true 
          });
          console.log(`[HOST UPGRADE] User ${updatedDocument.userId} upgraded from guest to host after ID verification approval`);
        }
      }
      
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error verifying document:", error);
      res.status(500).json({ message: "Failed to verify document" });
    }
  });

  // Enhanced Ethiopian ID data extraction from OCR text
  function extractEthiopianIDData(ocrText: string) {
    // Remove extra symbols and spaces for better matching
    const cleanText = ocrText.replace(/\s+/g, " ").trim();
    
    console.log("[ID EXTRACTION] Processing OCR text:", cleanText.substring(0, 200));

    // ID Number — Ethiopian IDs can be 12-15 digits (newer cards use 15-digit barcodes)
    let idNumber: string | null = null;
    
    // Try multiple patterns to find Ethiopian ID (12-15 digits)
    const idPatterns = [
      /\b(\d{15})\b/,                           // Exact 15 digits (barcode format)
      /\b(\d{12})\b/,                           // Exact 12 digits (older format)
      /\b(\d{5}[\s\-]?\d{5}[\s\-]?\d{5})\b/,   // 5-5-5 format with optional separators
      /\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{3})\b/,   // 4-4-4-3 format
      /\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4})\b/,   // 4-4-4 format with optional separators
      /\b(\d{3}[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{3})\b/,  // 3-3-3-3 format
      /(?:ID|Number|ቁጥር|መለያ|Barcode)[:\-\s]*(\d[\s\-\d]{10,20})/i,  // After ID/Number keywords
    ];
    
    for (const pattern of idPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        // Extract digits only and check if 12-15 digits
        const digits = match[1].replace(/\D/g, '');
        if (digits.length >= 12 && digits.length <= 15) {
          idNumber = digits;
          console.log("[ID EXTRACTION] Found ID number:", idNumber, "Length:", digits.length);
          break;
        }
      }
    }
    
    // If still no match, look for ALL 15-digit sequences and pick the best one
    if (!idNumber) {
      const allDigits = cleanText.replace(/\D/g, '');
      
      // Find ALL 15-digit sequences
      const fifteenDigitMatches: string[] = [];
      let tempDigits = allDigits;
      while (tempDigits.length >= 15) {
        const match = tempDigits.match(/\d{15}/);
        if (match) {
          fifteenDigitMatches.push(match[0]);
          tempDigits = tempDigits.substring(match.index! + 15);
        } else {
          break;
        }
      }
      
      if (fifteenDigitMatches.length > 0) {
        // Prefer sequences starting with 5, 7, or 4 (common barcode patterns)
        const preferred = fifteenDigitMatches.find(seq => /^[574]/.test(seq));
        
        if (preferred) {
          idNumber = preferred;
          console.log("[ID EXTRACTION] Found preferred 15-digit barcode:", idNumber);
        } else {
          // Use the last 15-digit sequence (barcodes are usually at bottom)
          idNumber = fifteenDigitMatches[fifteenDigitMatches.length - 1];
          console.log("[ID EXTRACTION] Found 15-digit sequence (last):", idNumber);
        }
        
        console.log("[ID EXTRACTION] All 15-digit sequences found:", fifteenDigitMatches);
      } else {
        // Fall back to 12 digits
        const twelveDigitMatch = allDigits.match(/\d{12}/);
        if (twelveDigitMatch) {
          idNumber = twelveDigitMatch[0];
          console.log("[ID EXTRACTION] Found 12-digit sequence:", idNumber);
        }
      }
    }

    // Name — looks for words near Name/ስም with flexible patterns
    let fullName: string | null = null;
    const namePatterns = [
      /(?:Name|ስም|Full Name|ሙሉ ስም)[:\-]?\s*([A-Za-zአ-ፚ\s]{3,50})/i,
      /(?:Given Name|First Name)[:\-]?\s*([A-Za-zአ-ፚ\s]{2,30})/i,
    ];
    
    for (const pattern of namePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        fullName = match[1].trim();
        console.log("[ID EXTRACTION] Found name:", fullName);
        break;
      }
    }
    
    if (!fullName || fullName.length < 2) {
      fullName = "Not detected";
    }
    
    // Split name into first, middle, and last
    let firstName = null;
    let middleName = null;
    let lastName = null;
    if (fullName && fullName !== "Not detected") {
      const nameParts = fullName.trim().split(/\s+/);
      if (nameParts.length >= 3) {
        firstName = nameParts[0];
        middleName = nameParts.slice(1, -1).join(' ');
        lastName = nameParts[nameParts.length - 1];
      } else if (nameParts.length === 2) {
        firstName = nameParts[0];
        lastName = nameParts[1];
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
      }
    }
    
    // Date of Birth — flexible patterns
    const dobPatterns = [
      /(?:DOB|Birth|የትውልድ ቀን|Date of Birth)[:\-]?\s*(\d{4}[\/\-]\d{2}[\/\-]\d{2})/i,
      /(?:DOB|Birth)[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
    ];
    
    let dateOfBirth: string | null = null;
    for (const pattern of dobPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        dateOfBirth = match[1];
        break;
      }
    }

    // Expiry date — flexible patterns
    const expiryPatterns = [
      /(?:Expiry|Expires|Valid Until)[:\-]?\s*(\d{4}[\/\-]\d{2}[\/\-]\d{2})/i,
      /20\d{2}[\/\-]\d{2}[\/\-]\d{2}/,
      /(?:Expiry|Expires)[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
    ];
    
    let expiryDate: string | null = null;
    for (const pattern of expiryPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        expiryDate = match[1] || match[0];
        break;
      }
    }

    // Location — find "Addis Ababa" or region names
    const locationMatch = cleanText.match(/Addis Ababa|Tigray|Oromia|Amhara|Sidama|Afar|Somali|SNNPR|Dire Dawa|Harar/i);
    const location = locationMatch ? locationMatch[0] : "Unknown";
    
    console.log("[ID EXTRACTION] Results - ID:", idNumber, "Name:", fullName, "DOB:", dateOfBirth);

    return { idNumber, fullName, firstName, middleName, lastName, dateOfBirth, expiryDate, location, documentType: 'ethiopian_id' };
  }

  // Extract data from foreign documents (passport, driver's license, etc.)
  function extractForeignDocumentData(ocrText: string) {
    const cleanText = ocrText.replace(/\s+/g, " ").trim();
    const upperText = cleanText.toUpperCase();

    // Detect document type
    let documentType = 'other';
    if (upperText.includes('PASSPORT')) {
      documentType = 'passport';
    } else if (upperText.includes('DRIVER') || upperText.includes('DRIVING') || upperText.includes('LICENSE')) {
      documentType = 'drivers_license';
    }

    // Extract passport number (various formats)
    let idNumber: string | null = null;
    
    // Common passport patterns
    const passportPatterns = [
      /(?:Passport|No|Number)[:\s]*([A-Z0-9]{6,15})/i,
      /\b([A-Z]{1,2}\d{6,9})\b/,
      /\b(\d{9})\b/,
    ];
    
    for (const pattern of passportPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        idNumber = match[1] || match[0];
        break;
      }
    }

    // Extract name (usually in CAPS on passports)
    const namePatterns = [
      /(?:Name|Surname|Given Names?)[:\s]*([A-Z\s]{5,50})/i,
      /([A-Z]{3,}\s+[A-Z]{3,})/,
    ];
    
    let fullName: string | null = null;
    for (const pattern of namePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        fullName = match[1].trim();
        break;
      }
    }

    // Extract expiry date (various formats)
    const expiryPatterns = [
      /(?:Expiry|Expires?|Valid Until)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    ];
    
    let expiryDate: string | null = null;
    for (const pattern of expiryPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        expiryDate = match[1];
        break;
      }
    }

    // Extract country/nationality
    const countryMatch = cleanText.match(/(?:Nationality|Country)[:\s]*([A-Za-z\s]+)/i);
    const country = countryMatch ? countryMatch[1].trim() : null;

    return {
      idNumber,
      fullName,
      expiryDate,
      country,
      documentType,
      location: null,
    };
  }

  // Universal ID Scanning endpoint - supports Ethiopian ID and foreign documents
  app.post('/api/id-scan', isAuthenticated, async (req: any, res) => {
    try {
      const { scanData, scanMethod, timestamp, imageUrl } = req.body;
      const userId = req.user.id;
      
      if (!scanData) {
        return res.status(400).json({ message: "No scan data provided" });
      }
      
      
      let idNumber: string | null = null;
      let fullName: string | null = null;
      let firstName: string | null = null;
      let middleName: string | null = null;
      let lastName: string | null = null;
      let dateOfBirth: string | null = null;
      let expiryDate: string | null = null;
      let location: string | null = null;
      let documentType: string = 'other';
      let country: string | null = null;
      
      // Parse data based on scan method
      if (scanMethod === "qr") {
        // QR code scan - Ethiopian Digital ID (supports both 12-digit and 15-digit IDs)
        const ethiopianIdRegex = /^[0-9]{12,15}$/;
        try {
          // Try to parse as base64-encoded JSON (Ethiopian digital ID format)
          const decoded = JSON.parse(Buffer.from(scanData, 'base64').toString('utf-8'));
          idNumber = decoded.idNumber || decoded.id_number || decoded.ID;
          fullName = decoded.fullName || decoded.full_name || decoded.name;
          firstName = decoded.firstName || decoded.first_name;
          middleName = decoded.middleName || decoded.middle_name;
          lastName = decoded.lastName || decoded.last_name;
          dateOfBirth = decoded.dateOfBirth || decoded.dob || decoded.birth_date;
          documentType = 'ethiopian_id';
          country = 'Ethiopia';
        } catch (e) {
          // If not base64, try parsing as plain JSON
          try {
            const parsed = JSON.parse(scanData);
            idNumber = parsed.idNumber || parsed.id_number || parsed.ID;
            fullName = parsed.fullName || parsed.full_name || parsed.name;
            firstName = parsed.firstName || parsed.first_name;
            middleName = parsed.middleName || parsed.middle_name;
            lastName = parsed.lastName || parsed.last_name;
            dateOfBirth = parsed.dateOfBirth || parsed.dob || parsed.birth_date;
            documentType = 'ethiopian_id';
            country = 'Ethiopia';
          } catch (e2) {
            // If not JSON, try extracting ID number directly from string
            const match = scanData.match(ethiopianIdRegex);
            idNumber = match ? match[0] : null;
            documentType = 'ethiopian_id';
            country = 'Ethiopia';
          }
        }
        
        // Split fullName into firstName, middleName, and lastName if not already provided
        if (fullName && (!firstName || !lastName)) {
          const nameParts = fullName.trim().split(/\s+/);
          if (nameParts.length >= 3) {
            firstName = firstName || nameParts[0];
            middleName = middleName || nameParts.slice(1, -1).join(' ');
            lastName = lastName || nameParts[nameParts.length - 1];
          } else if (nameParts.length === 2) {
            firstName = firstName || nameParts[0];
            lastName = lastName || nameParts[1];
          }
        }

        // Validate Ethiopian ID format
        if (!idNumber || !ethiopianIdRegex.test(idNumber)) {
          return res.status(400).json({
            success: false,
            message: "Invalid Ethiopian ID format. ID must be 12-15 digits.",
            error: "Invalid ID number",
          });
        }
      } else if (scanMethod === "photo") {
        // Photo upload - could be Ethiopian ID or foreign document
        // Try Ethiopian ID first
        const ethiopianData = extractEthiopianIDData(scanData);
        
        if (ethiopianData.idNumber) {
          // Looks like Ethiopian ID
          idNumber = ethiopianData.idNumber;
          fullName = ethiopianData.fullName !== "Not detected" ? ethiopianData.fullName : null;
          firstName = ethiopianData.firstName;
          middleName = ethiopianData.middleName;
          lastName = ethiopianData.lastName;
          dateOfBirth = ethiopianData.dateOfBirth;
          expiryDate = ethiopianData.expiryDate;
          location = ethiopianData.location !== "Unknown" ? ethiopianData.location : null;
          documentType = 'ethiopian_id';
          country = 'Ethiopia';
        } else {
          // Try foreign document extraction
          const foreignData = extractForeignDocumentData(scanData);
          idNumber = foreignData.idNumber;
          fullName = foreignData.fullName;
          expiryDate = foreignData.expiryDate;
          country = foreignData.country;
          documentType = foreignData.documentType;
          location = null;
          
          // Split full name for foreign documents
          if (fullName && (!firstName || !lastName)) {
            const nameParts = fullName.trim().split(/\s+/);
            if (nameParts.length >= 3) {
              firstName = firstName || nameParts[0];
              middleName = middleName || nameParts.slice(1, -1).join(' ');
              lastName = lastName || nameParts[nameParts.length - 1];
            } else if (nameParts.length === 2) {
              firstName = firstName || nameParts[0];
              lastName = lastName || nameParts[1];
            }
          }
        }
      }
      
      // Validate that we extracted at least an ID number
      if (!idNumber) {
        return res.status(400).json({
          success: false,
          message: "Could not extract ID number from document. Please ensure the image is clear and try again.",
          error: "No ID number detected",
        });
      }
      
      // Update user with verified ID information
      const user = await storage.getUser(userId);
      if (user) {
        await storage.upsertUser({
          ...user,
          idVerified: true,
          idNumber,
          idFullName: fullName || user.idFullName,
          idDocumentType: documentType,
          idDocumentUrl: imageUrl || user.idDocumentUrl,
          idExpiryDate: expiryDate || user.idExpiryDate,
          idCountry: country || user.idCountry,
        });
      }
      
      const docTypeLabel = documentType === 'ethiopian_id' ? 'Ethiopian ID' : 
                          documentType === 'passport' ? 'Passport' :
                          documentType === 'drivers_license' ? "Driver's License" : 'ID';
      
      res.json({
        success: true,
        message: `${docTypeLabel} verified successfully`,
        verified: true,
        idNumber,
        fullName,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        expiryDate,
        location,
        documentType,
        country,
        scanMethod,
        timestamp,
      });
    } catch (error: any) {
      console.error("Error processing ID scan:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Failed to process ID scan",
        error: "Processing error",
      });
    }
  });

  // Admin statistics
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Operator-specific routes for verification
  app.get('/api/operator/pending-documents', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const documents = await storage.getPendingVerificationDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching pending documents:", error);
      res.status(500).json({ message: "Failed to fetch pending documents" });
    }
  });

  app.get('/api/operator/pending-properties', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const properties = await storage.getPendingProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching pending properties:", error);
      res.status(500).json({ message: "Failed to fetch pending properties" });
    }
  });

  app.post('/api/operator/documents/:documentId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const { documentId } = req.params;
      const verifierId = req.user.id;
      
      const updatedDocument = await storage.verifyDocument(parseInt(documentId), 'approved', verifierId);
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error approving document:", error);
      res.status(500).json({ message: "Failed to approve document" });
    }
  });

  app.post('/api/operator/documents/:documentId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const { documentId } = req.params;
      const { reason } = req.body;
      const verifierId = req.user.id;
      
      const updatedDocument = await storage.verifyDocument(parseInt(documentId), 'rejected', verifierId, reason);
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error rejecting document:", error);
      res.status(500).json({ message: "Failed to reject document" });
    }
  });

  app.post('/api/operator/properties/:propertyId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const { propertyId } = req.params;
      const verifierId = req.user.id;
      
      const updatedProperty = await storage.verifyProperty(parseInt(propertyId), 'approved', verifierId);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error approving property:", error);
      res.status(500).json({ message: "Failed to approve property" });
    }
  });

  app.post('/api/operator/properties/:propertyId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const { propertyId } = req.params;
      const { reason } = req.body;
      const verifierId = req.user.id;
      
      const updatedProperty = await storage.verifyProperty(parseInt(propertyId), 'rejected', verifierId, reason);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error rejecting property:", error);
      res.status(500).json({ message: "Failed to reject property" });
    }
  });

  // Property routes - Enhanced search with filters and sorting
  app.get('/api/properties', async (req, res) => {
    try {
      const { city, type, minPrice, maxPrice, maxGuests, checkIn, checkOut, q, sort } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      if (type) filters.type = type as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (maxGuests) filters.maxGuests = parseInt(maxGuests as string);
      if (checkIn) filters.checkIn = new Date(checkIn as string);
      if (checkOut) filters.checkOut = new Date(checkOut as string);
      if (q) filters.q = q as string;
      if (sort) filters.sort = sort as string;

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Dedicated search endpoint (alias for /api/properties with search parameters)
  app.get('/api/properties/search', async (req, res) => {
    try {
      const { city, type, minPrice, maxPrice, maxGuests, checkIn, checkOut, q, sort } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      if (type) filters.type = type as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (maxGuests) filters.maxGuests = parseInt(maxGuests as string);
      if (checkIn) filters.checkIn = new Date(checkIn as string);
      if (checkOut) filters.checkOut = new Date(checkOut as string);
      if (q) filters.q = q as string;
      if (sort) filters.sort = sort as string;

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Map-based discovery endpoint
  app.get('/api/properties/discover', async (req, res) => {
    try {
      const { north, south, east, west, city } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      
      const allProperties = await storage.getProperties(filters);
      
      // Filter by map bounds if provided
      let mapResults = allProperties;
      if (north && south && east && west) {
        const northNum = parseFloat(north as string);
        const southNum = parseFloat(south as string);
        const eastNum = parseFloat(east as string);
        const westNum = parseFloat(west as string);
        
        mapResults = allProperties.filter((p: any) => {
          const lat = parseFloat(p.latitude || "0");
          const lng = parseFloat(p.longitude || "0");
          return lat >= southNum && lat <= northNum && lng >= westNum && lng <= eastNum;
        });
      }
      
      // AI-style recommendations (top 3 highest rated)
      const recommendations = [...allProperties]
        .sort((a: any, b: any) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"))
        .slice(0, 3);
      
      // Mock nearby amenities (can be replaced with real Google Places API)
      const amenities = [
        { id: "a1", name: "Coffee Roastery", type: "Cafe", lat: 9.012, lng: 38.763 },
        { id: "a2", name: "Medical Clinic", type: "Hospital", lat: 9.014, lng: 38.769 },
        { id: "a3", name: "Bus Terminal", type: "Transport", lat: 9.008, lng: 38.755 },
      ];
      
      res.json({ mapResults, recommendations, amenities });
    } catch (error) {
      console.error("Error in discovery endpoint:", error);
      res.status(500).json({ message: "Failed to fetch discovery data" });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const propertyData = insertPropertySchema.parse({ ...req.body, hostId: userId });
      
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user owns the property
      const property = await storage.getProperty(id);
      if (!property || property.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updates = insertPropertySchema.partial().parse(req.body);
      const updatedProperty = await storage.updateProperty(id, updates);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user owns the property
      const property = await storage.getProperty(id);
      if (!property || property.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteProperty(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Host dashboard routes
  app.get('/api/host/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const properties = await storage.getPropertiesByHost(userId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching host properties:", error);
      res.status(500).json({ message: "Failed to fetch host properties" });
    }
  });

  app.get('/api/host/properties/:id/stats', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user owns the property
      const property = await storage.getProperty(id);
      if (!property || property.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const stats = await storage.getPropertyStats(id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching property stats:", error);
      res.status(500).json({ message: "Failed to fetch property stats" });
    }
  });

  // Host earnings endpoint (ERCA compliant)
  app.get('/api/host/earnings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get all properties for this host
      const properties = await storage.getPropertiesByHost(userId);
      const propertyIds = properties.map(p => p.id);
      
      // Get all paid bookings for host's properties
      const allBookings = await Promise.all(
        propertyIds.map(id => storage.getBookingsByProperty(id))
      );
      const paidBookings = allBookings
        .flat()
        .filter(b => b.paymentStatus === 'paid');
      
      // Calculate totals
      const summary = {
        totalBookings: paidBookings.length,
        grossRevenue: paidBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0),
        algaServiceFee: paidBookings.reduce((sum, b) => sum + parseFloat(b.algaCommission || '0'), 0),
        vat: paidBookings.reduce((sum, b) => sum + parseFloat(b.vat || '0'), 0),
        withholding: paidBookings.reduce((sum, b) => sum + parseFloat(b.withholding || '0'), 0),
        netPayout: paidBookings.reduce((sum, b) => sum + parseFloat(b.hostPayout || '0'), 0),
        bookings: paidBookings.map(b => ({
          id: b.id,
          propertyId: b.propertyId,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          guestPaid: parseFloat(b.totalPrice),
          serviceFee: parseFloat(b.algaCommission || '0'),
          vat: parseFloat(b.vat || '0'),
          withholding: parseFloat(b.withholding || '0'),
          yourPayout: parseFloat(b.hostPayout || '0'),
        }))
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching host earnings:", error);
      res.status(500).json({ message: "Failed to fetch host earnings" });
    }
  });

  // Booking routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookingData = insertBookingSchema.parse({ ...req.body, guestId: userId });
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getBookingsByGuest(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      const booking = await storage.getBooking(id);
      if (!booking || booking.guestId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.patch('/api/bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const booking = await storage.updateBookingStatus(id, status);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  app.patch('/api/bookings/:id/payment', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentStatus } = req.body;
      
      const booking = await storage.updatePaymentStatus(id, paymentStatus);
      res.json(booking);
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Review routes
  app.post('/api/properties/:propertyId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const userId = req.user.id;
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        propertyId,
        reviewerId: userId
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/properties/:propertyId/reviews', async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const reviews = await storage.getReviewsByProperty(propertyId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Favorites routes
  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favoriteData = insertFavoriteSchema.parse({ ...req.body, userId });
      
      const favorite = await storage.addToFavorites(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete('/api/favorites/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const userId = req.user.id;
      
      await storage.removeFromFavorites(userId, propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Access code routes
  app.get('/api/bookings/:bookingId/access-code', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = req.user.id;
      
      // Verify user owns this booking
      const booking = await storage.getBooking(bookingId);
      if (!booking || booking.guestId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const accessCode = await storage.getAccessCodeByBookingId(bookingId);
      if (!accessCode) {
        return res.status(404).json({ message: "Access code not found" });
      }
      
      res.json(accessCode);
    } catch (error) {
      console.error("Error fetching access code:", error);
      res.status(500).json({ message: "Failed to fetch access code" });
    }
  });

  app.get('/api/access-codes/my-codes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const accessCodes = await storage.getAccessCodesByGuestId(userId);
      res.json(accessCodes);
    } catch (error) {
      console.error("Error fetching access codes:", error);
      res.status(500).json({ message: "Failed to fetch access codes" });
    }
  });

  // Invoice generation endpoint (ERCA-compliant)
  app.get('/api/bookings/:bookingId/invoice', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = req.user.id;
      
      // Get booking details
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Verify user has access to this booking (guest or host)
      const property = await storage.getProperty(booking.propertyId);
      if (!property || (booking.guestId !== userId && property.hostId !== userId)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get guest and property details
      const guest = await storage.getUser(booking.guestId);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      // Prepare invoice data (convert string decimals to numbers)
      const invoiceData = {
        id: booking.id,
        guestName: `${guest.firstName} ${guest.lastName}`,
        propertyName: property.title,
        createdAt: booking.createdAt!,
        totalAmount: parseFloat(booking.totalPrice),
        algaCommission: parseFloat(booking.algaCommission || '0'),
        vat: parseFloat(booking.vat || '0'),
        withholding: parseFloat(booking.withholding || '0'),
        hostPayout: parseFloat(booking.hostPayout || '0'),
      };
      
      // Generate PDF invoice
      const pdfDataUri = await generateInvoice(invoiceData, {
        algaTIN: "ALGA-TIN-12345",
        hostTIN: property.hostId || "N/A",
      });
      
      res.json({ 
        invoicePDF: pdfDataUri,
        bookingId: booking.id,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Host Registration Request
  app.post('/api/host-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { idData } = req.body;

      // Check if user is already a host
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === 'host' || user.role === 'admin' || user.role === 'operator') {
        return res.status(400).json({ message: "You already have host privileges or higher" });
      }

      // Check if user already has a pending verification request
      const existingVerifications = await storage.getVerificationDocumentsByUser(userId);
      const pendingVerification = existingVerifications.find((v: any) => v.status === 'pending');
      
      if (pendingVerification) {
        return res.status(400).json({ 
          message: "You already have a pending verification request. Please wait for review." 
        });
      }

      // Update user's ID information from scanned data
      if (idData) {
        await storage.upsertUser({
          ...user,
          idNumber: idData.idNumber || null,
          idFullName: idData.fullName || `${idData.firstName || ''} ${idData.lastName || ''}`.trim() || null,
          idDocumentType: idData.documentType || 'ethiopian_id',
          idExpiryDate: idData.expiryDate || null,
          idCountry: idData.nationality || 'Ethiopia',
        });
      }

      // Create a verification document request (this will be reviewed by operator/admin)
      const verificationDoc = {
        userId,
        documentType: 'national_id',
        documentUrl: '/placeholder-scanned-id', // Placeholder since ID was scanned
        status: 'pending',
      };

      await storage.createVerificationDocument(verificationDoc);

      res.json({ 
        message: "Host application submitted successfully. Your verification is pending review.",
        status: "pending"
      });
    } catch (error) {
      console.error("Error processing host request:", error);
      res.status(500).json({ message: "Failed to process host request" });
    }
  });

  // Payment integration (Telebirr & PayPal)
  // Public payment status endpoint
  app.get('/api/payment/status/telebirr', (req, res) => {
    const telebirrService = require('./services/telebirr.service').createTelebirrService();
    const hasService = !!telebirrService;
    const config = {
      configured: hasService,
      hasBaseUrl: !!process.env.TELEBIRR_BASE_URL,
      hasFabricAppId: !!process.env.TELEBIRR_FABRIC_APP_ID,
      hasAppSecret: !!process.env.TELEBIRR_APP_SECRET,
      hasMerchantAppId: !!process.env.TELEBIRR_MERCHANT_APP_ID,
      hasPrivateKey: !!process.env.TELEBIRR_PRIVATE_KEY,
      hasShortCode: !!process.env.TELEBIRR_SHORT_CODE,
      baseUrl: process.env.TELEBIRR_BASE_URL || 'https://app.ethiotelecom.et:4443 (default)',
    };

    return res.json({
      status: hasService ? 'ready' : 'not configured',
      config,
      message: hasService 
        ? 'Telebirr service is ready to use' 
        : 'Missing required environment variables for Telebirr',
    });
  });

  app.use('/api/payment', isAuthenticated, paymentRouter);

  // ============================================
  // SERVICE PROVIDER ROUTES (Add-On Services)
  // ============================================

  // Simplified service provider application endpoint
  app.post('/api/service-provider-applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { businessName, serviceType, city, description, phoneNumber } = req.body;

      // Validate required fields
      if (!businessName || !serviceType || !city || !description) {
        return res.status(400).json({ 
          message: "Missing required fields: businessName, serviceType, city, description" 
        });
      }

      // Create service provider with defaults for pricing (can be updated later)
      const providerData = {
        userId,
        businessName,
        serviceType,
        description,
        city,
        region: city, // Use city as region for simplicity
        pricingModel: "hourly" as const, // Default pricing model
        basePrice: "0.00", // Default - will be set during verification
        verificationStatus: "pending",
      };

      const newProvider = await storage.createServiceProvider(providerData);

      // Update user's isServiceProvider flag
      await db
        .update(users)
        .set({ isServiceProvider: true })
        .where(eq(users.id, userId));

      // Send confirmation email
      const user = req.user;
      if (user.email) {
        await sendProviderApplicationReceivedEmail(
          user.email,
          user.firstName || 'Provider',
          businessName,
          serviceType
        );
      }

      res.status(201).json({
        message: "Application submitted successfully",
        provider: newProvider,
      });
    } catch (error) {
      console.error("Error submitting service provider application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Create new service provider (requires authentication)
  app.post('/api/service-providers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const providerData = {
        userId,
        ...req.body,
      };

      const newProvider = await storage.createServiceProvider(providerData);
      res.status(201).json(newProvider);
    } catch (error) {
      console.error("Error creating service provider:", error);
      res.status(500).json({ message: "Failed to create service provider" });
    }
  });

  // Get all service providers with filters
  app.get('/api/service-providers', async (req, res) => {
    try {
      const { city, serviceType, verificationStatus } = req.query;
      const filters: any = {};
      
      if (city) filters.city = city as string;
      if (serviceType) filters.serviceType = serviceType as string;
      if (verificationStatus) filters.verificationStatus = verificationStatus as string;
      
      const providers = await storage.getAllServiceProviders(filters);
      res.json(providers);
    } catch (error) {
      console.error("Error fetching service providers:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  // Get service provider by ID
  app.get('/api/service-providers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.getServiceProvider(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      
      res.json(provider);
    } catch (error) {
      console.error("Error fetching service provider:", error);
      res.status(500).json({ message: "Failed to fetch service provider" });
    }
  });

  // Get current user's service providers
  app.get('/api/my-service-providers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const providers = await storage.getServiceProvidersByUser(userId);
      res.json(providers);
    } catch (error) {
      console.error("Error fetching user service providers:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  // Update service provider (owner only)
  app.patch('/api/service-providers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      const provider = await storage.getServiceProvider(id);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      
      if (provider.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this service provider" });
      }
      
      const updatedProvider = await storage.updateServiceProvider(id, req.body);
      res.json(updatedProvider);
    } catch (error) {
      console.error("Error updating service provider:", error);
      res.status(500).json({ message: "Failed to update service provider" });
    }
  });

  // Get current user's provider profile
  app.get('/api/my-provider-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const providers = await storage.getServiceProvidersByUser(userId);
      
      // Return the first (and typically only) provider profile
      if (providers.length === 0) {
        return res.status(404).json({ message: "No provider profile found" });
      }
      
      res.json(providers[0]);
    } catch (error) {
      console.error("Error fetching provider profile:", error);
      res.status(500).json({ message: "Failed to fetch provider profile" });
    }
  });

  // Get current user's provider bookings
  app.get('/api/my-provider-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // First get the provider profile
      const providers = await storage.getServiceProvidersByUser(userId);
      if (providers.length === 0) {
        return res.json([]);
      }
      
      const providerId = providers[0].id;
      const bookings = await storage.getServiceBookingsByProvider(providerId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching provider bookings:", error);
      res.status(500).json({ message: "Failed to fetch provider bookings" });
    }
  });

  // ============================================
  // ADMIN SERVICE PROVIDER VERIFICATION ROUTES
  // ============================================

  // Helper middleware to check admin/operator role
  const isAdminOrOperator = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'operator') {
      return res.status(403).json({ message: "Access denied. Admin or operator role required." });
    }
    next();
  };

  // Approve service provider application
  app.post('/api/admin/service-providers/:id/approve', isAuthenticated, isAdminOrOperator, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { basePrice } = req.body;

      // Validate base price
      if (!basePrice || isNaN(parseFloat(basePrice))) {
        return res.status(400).json({ message: "Valid base price is required" });
      }

      const provider = await storage.getServiceProvider(id);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }

      if (provider.verificationStatus === 'verified') {
        return res.status(400).json({ message: "Provider is already verified" });
      }

      // Update provider verification status and pricing
      const updatedProvider = await storage.updateServiceProvider(id, {
        verificationStatus: 'verified',
        basePrice: basePrice.toString(),
      });

      // Get provider user details for email
      const providerUser = await db
        .select()
        .from(users)
        .where(eq(users.id, provider.userId))
        .limit(1);

      if (providerUser.length > 0 && providerUser[0].email) {
        await sendProviderApplicationApprovedEmail(
          providerUser[0].email,
          providerUser[0].firstName || 'Provider',
          provider.businessName,
          provider.serviceType
        );
      }

      res.json({
        message: "Service provider approved successfully",
        provider: updatedProvider,
      });
    } catch (error) {
      console.error("Error approving service provider:", error);
      res.status(500).json({ message: "Failed to approve service provider" });
    }
  });

  // Reject service provider application
  app.post('/api/admin/service-providers/:id/reject', isAuthenticated, isAdminOrOperator, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;

      if (!reason || reason.trim() === '') {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const provider = await storage.getServiceProvider(id);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }

      if (provider.verificationStatus === 'rejected') {
        return res.status(400).json({ message: "Provider is already rejected" });
      }

      // Update provider verification status
      const updatedProvider = await storage.updateServiceProvider(id, {
        verificationStatus: 'rejected',
        rejectionReason: reason,
      });

      // Get provider user details for email
      const providerUser = await db
        .select()
        .from(users)
        .where(eq(users.id, provider.userId))
        .limit(1);

      if (providerUser.length > 0 && providerUser[0].email) {
        await sendProviderApplicationRejectedEmail(
          providerUser[0].email,
          providerUser[0].firstName || 'Provider',
          provider.businessName,
          reason
        );
      }

      res.json({
        message: "Service provider rejected successfully",
        provider: updatedProvider,
      });
    } catch (error) {
      console.error("Error rejecting service provider:", error);
      res.status(500).json({ message: "Failed to reject service provider" });
    }
  });

  // ============================================
  // SERVICE BOOKING ROUTES
  // ============================================

  // Create service booking
  app.post('/api/service-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const guestId = req.user.id;
      const bookingData = {
        ...req.body,
        guestId,
      };

      const newBooking = await storage.createServiceBooking(bookingData);
      res.status(201).json(newBooking);
    } catch (error) {
      console.error("Error creating service booking:", error);
      res.status(500).json({ message: "Failed to create service booking" });
    }
  });

  // Get service booking by ID
  app.get('/api/service-bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getServiceBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Service booking not found" });
      }
      
      const userId = req.user.id;
      if (booking.guestId !== userId && booking.hostId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to view this booking" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching service booking:", error);
      res.status(500).json({ message: "Failed to fetch service booking" });
    }
  });

  // Get user's service bookings (as guest)
  app.get('/api/my-service-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getServiceBookingsByGuest(userId);
      
      // Add hasReviewed field to each booking
      const bookingsWithReviewStatus = await Promise.all(
        bookings.map(async (booking) => {
          try {
            const review = await storage.getServiceReviewByBooking(booking.id);
            return {
              ...booking,
              hasReviewed: !!review
            };
          } catch {
            return {
              ...booking,
              hasReviewed: false
            };
          }
        })
      );
      
      res.json(bookingsWithReviewStatus);
    } catch (error) {
      console.error("Error fetching service bookings:", error);
      res.status(500).json({ message: "Failed to fetch service bookings" });
    }
  });

  // Get service bookings for host
  app.get('/api/host-service-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getServiceBookingsByHost(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching host service bookings:", error);
      res.status(500).json({ message: "Failed to fetch service bookings" });
    }
  });

  // Get service bookings for provider
  app.get('/api/provider-service-bookings/:providerId', isAuthenticated, async (req: any, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const provider = await storage.getServiceProvider(providerId);
      
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      
      const userId = req.user.id;
      if (provider.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to view these bookings" });
      }
      
      const bookings = await storage.getServiceBookingsByProvider(providerId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching provider bookings:", error);
      res.status(500).json({ message: "Failed to fetch provider bookings" });
    }
  });

  // Update service booking status
  app.patch('/api/service-bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedBooking = await storage.updateServiceBookingStatus(id, status);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating service booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Complete service booking
  app.post('/api/service-bookings/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const completedBooking = await storage.completeServiceBooking(id);
      res.json(completedBooking);
    } catch (error) {
      console.error("Error completing service booking:", error);
      res.status(500).json({ message: "Failed to complete booking" });
    }
  });

  // ============================================
  // SERVICE REVIEWS
  // ============================================

  // Create service review
  app.post('/api/service-reviews', isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user.id;
      const reviewData = {
        ...req.body,
        reviewerId,
      };
      
      const review = await storage.createServiceReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating service review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Get reviews for a service provider
  app.get('/api/service-providers/:id/reviews', async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const reviews = await storage.getServiceReviewsByProvider(providerId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching provider reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get review by service booking ID
  app.get('/api/service-bookings/:id/review', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const review = await storage.getServiceReviewByBooking(bookingId);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Error fetching booking review:", error);
      res.status(500).json({ message: "Failed to fetch review" });
    }
  });

  // ============================================
  // ADMIN: SERVICE PROVIDER VERIFICATION
  // ============================================

  // Get all service providers for admin review
  app.get('/api/admin/service-providers', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'operator') {
        return res.status(403).json({ message: "Access denied. Admin or Operator role required." });
      }
      
      const providers = await storage.getAllServiceProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error fetching service providers for admin:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  // Verify service provider (admin/operator)
  app.patch('/api/admin/service-providers/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'operator') {
        return res.status(403).json({ message: "Access denied. Admin or Operator role required." });
      }
      
      const id = parseInt(req.params.id);
      const { status, rejectionReason } = req.body;
      
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Valid status (approved/rejected) is required" });
      }
      
      const verifiedProvider = await storage.verifyServiceProvider(
        id,
        status,
        req.user.id,
        rejectionReason
      );
      
      res.json(verifiedProvider);
    } catch (error) {
      console.error("Error verifying service provider:", error);
      res.status(500).json({ message: "Failed to verify service provider" });
    }
  });

  // ============================================
  // FAYDA ID VERIFICATION
  // ============================================

  // Verify Fayda ID (Ethiopia's National Digital ID)
  app.post('/api/fayda/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { faydaId, dateOfBirth, phoneNumber } = req.body;

      if (!faydaId) {
        return res.status(400).json({ message: "Fayda ID is required" });
      }

      // Validate format
      if (!/^\d{12}$/.test(faydaId)) {
        return res.status(400).json({ 
          message: "Invalid Fayda ID format. Must be exactly 12 digits." 
        });
      }

      // Call Fayda verification service
      const verificationResult = await verifyFaydaId({
        faydaId,
        dateOfBirth,
        phoneNumber: phoneNumber || req.user.phoneNumber,
      });

      if (!verificationResult.success || !verificationResult.kycStatus) {
        return res.status(400).json({
          message: verificationResult.message || "Fayda ID verification failed",
          error: verificationResult.error,
        });
      }

      // Update user with verified Fayda data
      await updateUserFaydaVerification(userId, faydaId, verificationResult);

      res.json({
        success: true,
        message: "Fayda ID verified successfully",
        identity: verificationResult.identity,
      });
    } catch (error) {
      console.error("Error verifying Fayda ID:", error);
      res.status(500).json({ 
        message: "An error occurred during verification. Please try again." 
      });
    }
  });

  // Check Fayda verification status
  app.get('/api/fayda/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const isVerified = await isFaydaVerified(userId);
      
      const user = await storage.getUser(userId);
      
      res.json({
        verified: isVerified,
        faydaId: user?.faydaId || null,
        verifiedAt: user?.faydaVerifiedAt || null,
      });
    } catch (error) {
      console.error("Error checking Fayda status:", error);
      res.status(500).json({ message: "Failed to check verification status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
