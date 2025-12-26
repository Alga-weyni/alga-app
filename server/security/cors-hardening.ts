import { Request, Response, NextFunction } from 'express';

/**
 * INSA CORS Hardening Middleware
 * 
 * Addresses INSA Audit Finding: "Improper CORS Validation Allowing 
 * Cross-Origin Authenticated Access via Multiple Origin Headers"
 * 
 * Security measures:
 * 1. Rejects HTTP requests containing multiple Origin headers
 * 2. Validates a single allowed origin against strict server-side allowlist
 * 3. Never sends multiple origins in Access-Control-Allow-Origin
 * 4. Restricts Access-Control-Allow-Credentials to specific safe endpoints only
 * 5. Implements centralized CORS handling for consistent policy enforcement
 */

const ALLOWED_ORIGINS: Set<string> = new Set([
  // Production web - strict exact matches only
  'https://app.alga.et',
  'https://alga.et',
  'https://www.alga.et',
  // Capacitor mobile apps (Android with https scheme)
  'https://localhost',
  // Capacitor mobile apps (iOS)
  'capacitor://localhost',
  // Development origins - only in non-production
  ...(process.env.NODE_ENV === 'development' ? [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ] : [])
]);

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization', 
  'X-Requested-With',
  'Accept',
  'Cache-Control',
  'Pragma'
];
const EXPOSED_HEADERS = ['X-Total-Count', 'Content-Length'];

const MAX_AGE = 86400;

interface CORSAuditEvent {
  action: 'cors_rejected' | 'cors_multiple_origins' | 'cors_invalid_origin';
  ip: string;
  origin: string | string[] | undefined;
  path: string;
  method: string;
  reason: string;
}

function logCORSViolation(event: CORSAuditEvent): void {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'CORS_SECURITY_AUDIT',
    action: event.action,
    ip: event.ip,
    origin: Array.isArray(event.origin) ? event.origin.join(', ') : event.origin,
    path: event.path,
    method: event.method,
    reason: event.reason
  };
  
  console.warn(`[CORS-SECURITY] ${event.action}: ${event.reason}`, logData);
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function isValidOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) {
    return true;
  }
  
  if (process.env.NODE_ENV === 'development') {
    const devPattern = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/;
    if (devPattern.test(origin)) {
      return true;
    }
    if (origin.includes('.replit.dev') || origin.includes('.repl.co')) {
      return true;
    }
  }
  
  return false;
}

function getOriginHeader(req: Request): string | string[] | undefined {
  const rawOrigin = req.headers['origin'];
  
  if (Array.isArray(rawOrigin)) {
    return rawOrigin;
  }
  
  if (typeof rawOrigin === 'string') {
    const origins = rawOrigin.split(',').map(o => o.trim()).filter(Boolean);
    if (origins.length > 1) {
      return origins;
    }
    return origins[0] || undefined;
  }
  
  return undefined;
}

export function corsHardeningMiddleware(req: Request, res: Response, next: NextFunction): void {
  const clientIP = getClientIP(req);
  const origin = getOriginHeader(req);
  
  if (Array.isArray(origin)) {
    logCORSViolation({
      action: 'cors_multiple_origins',
      ip: clientIP,
      origin,
      path: req.path,
      method: req.method,
      reason: 'Multiple Origin headers detected - potential attack'
    });
    
    res.status(400).json({ 
      error: 'Bad Request',
      message: 'Invalid request headers'
    });
    return;
  }
  
  if (req.method === 'OPTIONS') {
    if (origin && isValidOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
      res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
      res.setHeader('Access-Control-Expose-Headers', EXPOSED_HEADERS.join(', '));
      res.setHeader('Access-Control-Max-Age', String(MAX_AGE));
      
      if (shouldAllowCredentials(req.path)) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      res.setHeader('Vary', 'Origin');
    } else if (origin) {
      logCORSViolation({
        action: 'cors_invalid_origin',
        ip: clientIP,
        origin,
        path: req.path,
        method: req.method,
        reason: 'Origin not in allowlist for preflight'
      });
    }
    
    res.status(204).end();
    return;
  }
  
  if (!origin) {
    next();
    return;
  }
  
  if (!isValidOrigin(origin)) {
    logCORSViolation({
      action: 'cors_rejected',
      ip: clientIP,
      origin,
      path: req.path,
      method: req.method,
      reason: 'Origin not in allowlist'
    });
    
    if (isSensitiveEndpoint(req.path)) {
      res.status(403).json({ 
        error: 'Forbidden',
        message: 'Cross-origin request not allowed'
      });
      return;
    }
    
    next();
    return;
  }
  
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Expose-Headers', EXPOSED_HEADERS.join(', '));
  res.setHeader('Vary', 'Origin');
  
  if (shouldAllowCredentials(req.path)) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
}

function shouldAllowCredentials(path: string): boolean {
  const credentialPaths = [
    '/api/auth',
    '/api/login',
    '/api/logout',
    '/api/register',
    '/api/user',
    '/api/me',
    '/api/otp',
    '/api/session',
    // Service provider applications require authentication
    '/api/service-provider',
    '/api/service-providers',
    // Bookings and payments require authentication
    '/api/bookings',
    '/api/payments',
    // Admin and operator endpoints require authentication
    '/api/admin',
    '/api/operator',
    // Property management requires authentication
    '/api/properties',
    // Delala agent endpoints require authentication
    '/api/delala',
    // Upload endpoints require authentication
    '/api/upload',
    // Settlement endpoints require authentication
    '/api/settlement'
  ];
  
  return credentialPaths.some(p => path.startsWith(p));
}

function isSensitiveEndpoint(path: string): boolean {
  const sensitivePatterns = [
    '/api/admin',
    '/api/operator',
    '/api/settlement',
    '/api/payments',
    '/api/user',
    '/api/bookings'
  ];
  
  return sensitivePatterns.some(p => path.startsWith(p));
}

export function applyCORSHardening(app: any): void {
  app.use(corsHardeningMiddleware);
  
  console.log('🛡️ INSA CORS Hardening enabled');
  console.log('   ✓ Multiple Origin header rejection');
  console.log('   ✓ Strict origin allowlist validation');
  console.log('   ✓ Selective credentials policy');
  console.log('   ✓ Security audit logging for violations');
}
