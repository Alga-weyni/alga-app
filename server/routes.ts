import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPropertySchema, insertBookingSchema, insertReviewSchema, insertFavoriteSchema } from "@shared/schema";
import { smsService } from "./smsService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
      const userRole = req.user.claims.role || 'tenant';
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
      const userRole = req.user.claims.role || 'tenant';
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
      const userRole = req.user.claims.role || 'tenant';
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
      const userRole = req.user.claims.role || 'tenant';
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
      const userRole = req.user.claims.role || 'tenant';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or operator access required" });
      }
      
      const { propertyId } = req.params;
      const { status, rejectionReason } = req.body;
      const verifierId = req.user.claims.sub;
      
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

  app.get('/api/verification-documents/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const documents = await storage.getVerificationDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get('/api/admin/verification-documents', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.claims.role || 'tenant';
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
      const userRole = req.user.claims.role || 'tenant';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or operator access required" });
      }
      
      const { documentId } = req.params;
      const { status, rejectionReason } = req.body;
      const verifierId = req.user.claims.sub;
      
      const updatedDocument = await storage.verifyDocument(parseInt(documentId), status, verifierId, rejectionReason);
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error verifying document:", error);
      res.status(500).json({ message: "Failed to verify document" });
    }
  });

  // Admin statistics
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.claims.role || 'tenant';
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

  // Property routes
  app.get('/api/properties', async (req, res) => {
    try {
      const { city, type, minPrice, maxPrice, maxGuests, checkIn, checkOut } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      if (type) filters.type = type as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (maxGuests) filters.maxGuests = parseInt(maxGuests as string);
      if (checkIn) filters.checkIn = new Date(checkIn as string);
      if (checkOut) filters.checkOut = new Date(checkOut as string);

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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
      await storage.removeFromFavorites(userId, propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
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

  const httpServer = createServer(app);
  return httpServer;
}
