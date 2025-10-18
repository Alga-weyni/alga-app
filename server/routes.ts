import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertPropertySchema, insertBookingSchema, insertReviewSchema, insertFavoriteSchema, registerPhoneUserSchema, registerEmailUserSchema, loginPhoneUserSchema, loginEmailUserSchema, verifyOtpSchema } from "@shared/schema";
import { smsService } from "./smsService";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import paymentRouter from "./payment";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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

  // Phone Registration - Step 1: Register with password
  app.post('/api/auth/register/phone', async (req, res) => {
    try {
      const validatedData = registerPhoneUserSchema.parse(req.body);
      
      // Check if phone number already exists
      const existingUser = await storage.getUserByPhoneNumber(validatedData.phoneNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      
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

  // Phone Registration - Step 2: Verify OTP
  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const validatedData = verifyOtpSchema.parse(req.body);
      
      const isValid = await storage.verifyOtp(validatedData.phoneNumber, validatedData.otp);
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Mark phone as verified
      const user = await storage.markPhoneVerified(validatedData.phoneNumber);
      
      // Log in user
      (req as any).login(user, (err: any) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in after verification" });
        }
        res.json({ 
          message: "Phone verified successfully",
          user,
          redirect: user.role === 'admin' ? '/admin/dashboard' : user.role === 'operator' ? '/operator/dashboard' : user.role === 'host' ? '/host/dashboard' : '/'
        });
      });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      res.status(400).json({ message: error.message || "Failed to verify OTP" });
    }
  });

  // Phone Login - Step 1: Login with password
  app.post('/api/auth/login/phone', async (req, res) => {
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

      // Generate and send OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
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
  app.post('/api/auth/register/email', async (req, res) => {
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
  app.post('/api/auth/login/email', async (req, res) => {
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

  // Document verification routes
  app.post('/api/verification-documents/upload', isAuthenticated, async (req: any, res) => {
    try {
      // In a real app, handle file upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, we'll simulate the upload
      const { documentType, userId } = req.body;
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
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error verifying document:", error);
      res.status(500).json({ message: "Failed to verify document" });
    }
  });

  // Enhanced Ethiopian ID data extraction from OCR text
  function extractEthiopianIDData(ocrText: string) {
    // Remove extra symbols and spaces
    const cleanText = ocrText.replace(/\s+/g, " ").trim();

    // ID Number — 12 digits
    const idMatch = cleanText.match(/\b\d{12}\b/);
    const idNumber = idMatch ? idMatch[0] : null;

    // Name — looks for words near Name/ስም
    const nameMatch = cleanText.match(/(?:Name|ስም)[:\-]?\s*([A-Za-zአ-ዐ\s]+)/);
    const fullName = nameMatch ? nameMatch[1].trim() : "Not detected";

    // Expiry date — e.g., 2032/06/17 GC
    const expiryMatch = cleanText.match(/20\d{2}\/\d{2}\/\d{2}/);
    const expiryDate = expiryMatch ? expiryMatch[0] : null;

    // Location — find "Addis Ababa" or region names
    const locationMatch = cleanText.match(/Addis Ababa|Tigray|Oromia|Amhara|Sidama|Afar|Somali|SNNPR|Dire Dawa|Harar/i);
    const location = locationMatch ? locationMatch[0] : "Unknown";

    return { idNumber, fullName, expiryDate, location, documentType: 'ethiopian_id' };
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
      const { scanData, scanMethod, timestamp } = req.body;
      const userId = req.user.id;
      
      if (!scanData) {
        return res.status(400).json({ message: "No scan data provided" });
      }
      
      // Log scan for audit trail
      console.log(`[ID SCAN] User ${userId} scanned ID via ${scanMethod} at ${timestamp}`);
      console.log(`[ID SCAN] Data preview: ${scanData.substring(0, 100)}...`);
      
      let idNumber: string | null = null;
      let fullName: string | null = null;
      let expiryDate: string | null = null;
      let location: string | null = null;
      let documentType: string = 'other';
      let country: string | null = null;
      
      // Parse data based on scan method
      if (scanMethod === "qr") {
        // QR code scan - Ethiopian Digital ID
        const ethiopianIdRegex = /^[0-9]{12}$/;
        try {
          // Try to parse as base64-encoded JSON (Ethiopian digital ID format)
          const decoded = JSON.parse(Buffer.from(scanData, 'base64').toString('utf-8'));
          idNumber = decoded.idNumber || decoded.id_number || decoded.ID;
          fullName = decoded.fullName || decoded.full_name || decoded.name;
          documentType = 'ethiopian_id';
          country = 'Ethiopia';
        } catch (e) {
          // If not base64, try parsing as plain JSON
          try {
            const parsed = JSON.parse(scanData);
            idNumber = parsed.idNumber || parsed.id_number || parsed.ID;
            fullName = parsed.fullName || parsed.full_name || parsed.name;
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

        // Validate Ethiopian ID format
        if (!idNumber || !ethiopianIdRegex.test(idNumber)) {
          return res.status(400).json({
            success: false,
            message: "Invalid Ethiopian ID format. ID must be 12 digits.",
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
      
      console.log(`[ID SCAN] Extracted - Type: ${documentType}, ID: ${idNumber}, Name: ${fullName || 'Not extracted'}`);
      
      // Update user with verified ID information
      const user = await storage.getUser(userId);
      if (user) {
        await storage.upsertUser({
          ...user,
          idVerified: true,
          idNumber,
          idFullName: fullName || user.idFullName,
          idDocumentType: documentType,
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

  // Mock banking integration endpoints
  app.post('/api/payments/cbe', isAuthenticated, async (req, res) => {
    try {
      // Mock Commercial Bank of Ethiopia payment
      const { amount, bookingId } = req.body;
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      res.json({
        success: true,
        transactionId: `CBE${Date.now()}`,
        amount,
        currency: 'ETB',
        status: 'completed'
      });
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  app.post('/api/payments/dashen', isAuthenticated, async (req, res) => {
    try {
      // Mock Dashen Bank payment
      const { amount, bookingId } = req.body;
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      res.json({
        success: true,
        transactionId: `DASH${Date.now()}`,
        amount,
        currency: 'ETB',
        status: 'completed'
      });
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  app.post('/api/payments/m-birr', isAuthenticated, async (req, res) => {
    try {
      // Mock M-Birr mobile payment
      const { amount, bookingId, phoneNumber } = req.body;
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      res.json({
        success: true,
        transactionId: `MBIRR${Date.now()}`,
        amount,
        currency: 'ETB',
        status: 'completed'
      });
    } catch (error) {
      res.status(500).json({ message: "Mobile payment failed" });
    }
  });

  // Real payment integration (Telebirr & PayPal)
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

  const httpServer = createServer(app);
  return httpServer;
}
