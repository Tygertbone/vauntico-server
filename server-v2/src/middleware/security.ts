import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { alertManager, AlertSeverity } from '../utils/slack-alerts';

// Security event types for structured logging
export enum SecurityEventType {
  FAILED_AUTH = 'FAILED_AUTH',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  ANOMALOUS_REQUEST = 'ANOMALOUS_REQUEST'
}

// Security event logging interface
export interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent: string;
  userId?: string;
  endpoint: string;
  method: string;
  payload?: any;
  timestamp: Date;
  details?: Record<string, any>;
}

// Security monitoring class
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private securityEvents: SecurityEvent[] = [];
  private readonly maxEventsInMemory = 1000;

  private constructor() {}

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Log security event
  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    // Add to in-memory store (for quick access)
    this.securityEvents.push(fullEvent);

    // Keep only recent events in memory
    if (this.securityEvents.length > this.maxEventsInMemory) {
      this.securityEvents = this.securityEvents.slice(-this.maxEventsInMemory);
    }

    // Log to Winston logger
    const { logger } = require('../utils/logger');
    logger.warn('Security Event', {
      security_event: true,
      type: event.type,
      severity: event.severity,
      ip: event.ip,
      userId: event.userId,
      endpoint: event.endpoint,
      method: event.method,
      userAgent: event.userAgent?.substring(0, 200), // Truncate long user agents
      details: event.details
    });

    // Alert on critical/high severity events
    if (event.severity === 'critical' || event.severity === 'high') {
      alertManager.alertSecurityIncident({
        type: event.type,
        userId: event.userId,
        ip: event.ip,
        url: event.endpoint,
        severity: event.severity === 'critical' ? AlertSeverity.CRITICAL : undefined,
        extraDetails: event.details
      }).catch(err => {
        const { logger } = require('../utils/logger');
        logger.error('Failed to send security alert', { error: err.message });
      });
    }

    // Store in database for analytics (async, don't block)
    this.storeSecurityEvent(fullEvent).catch(err => {
      const { logger } = require('../utils/logger');
      logger.error('Failed to store security event', { error: err.message, event: fullEvent });
    });
  }

  // Store security event in database (for analytics and compliance)
  private async storeSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const { pool } = await import('../db/pool');

      // Note: This assumes a security_events table exists
      // Migration should be added for this table
      await pool.query(`
        INSERT INTO security_events (type, severity, ip_address, user_agent, user_id, endpoint, method, payload, details, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
      `, [
        event.type,
        event.severity,
        event.ip,
        event.userAgent?.substring(0, 500), // Limit user agent length
        event.userId,
        event.endpoint,
        event.method,
        JSON.stringify(event.payload),
        JSON.stringify(event.details),
        event.timestamp
      ]);
    } catch (error) {
      // Database errors shouldn't crash the app
      console.error('Failed to store security event:', error);
    }
  }

  // Get recent security events (for monitoring dashboard)
  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.securityEvents.slice(-limit);
  }

  // Get events by type
  getEventsByType(type: SecurityEventType, hours: number = 24): SecurityEvent[] {
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return this.securityEvents.filter(event =>
      event.type === type && event.timestamp >= cutoff
    );
  }

  // Get events by IP (for rate limiting analysis)
  getEventsByIP(ip: string, hours: number = 24): SecurityEvent[] {
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return this.securityEvents.filter(event =>
      event.ip === ip && event.timestamp >= cutoff
    );
  }

  // Security statistics
  getSecurityStats(hours: number = 24): {
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<string, number>;
    topIPs: Array<{ ip: string; count: number }>;
  } {
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const recentEvents = this.securityEvents.filter(event => event.timestamp >= cutoff);

    const eventsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<SecurityEventType, number>);

    const eventsBySeverity = recentEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ipCounts = recentEvents.reduce((acc, event) => {
      acc[event.ip] = (acc[event.ip] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
      topIPs
    };
  }
}

// Input sanitization utilities
export class InputSanitizer {
  // SQL injection patterns
  private static readonly SQL_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|CAST|DECLARE)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(-{2,})/, // SQL comments
    /('|(\\x27)|(\\x2D\\x2D))/i, // Quotes and double dashes
  ];

  // XSS patterns
  private static readonly XSS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/i,
    /<iframe[^>]*>.*?<\/iframe>/i,
    /<object[^>]*>.*?<\/object>/i,
    /javascript:/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /onclick\s*=/i,
  ];

  static sanitizeInput(input: string, fieldName: string): { sanitized: string; suspicious: boolean; reasons: string[] } {
    if (typeof input !== 'string') {
      return { sanitized: String(input), suspicious: false, reasons: [] };
    }

    let sanitized = input;
    const reasons: string[] = [];

    // Check for SQL injection patterns
    const sqlMatches = this.SQL_PATTERNS.filter(pattern => pattern.test(input));
    if (sqlMatches.length > 0) {
      reasons.push('Potential SQL injection patterns detected');
      // Basic sanitization - remove dangerous characters
      sanitized = sanitized.replace(/['"`;\\]/g, '');
    }

    // Check for XSS patterns
    const xssMatches = this.XSS_PATTERNS.filter(pattern => pattern.test(input));
    if (xssMatches.length > 0) {
      reasons.push('Potential XSS patterns detected');
      // Basic sanitization - escape HTML
      sanitized = sanitized.replace(/</g, '<').replace(/>/g, '>');
    }

    // Check for suspicious lengths (potential DoS)
    if (input.length > 10000) {
      reasons.push('Unusually long input detected');
    }

    // Check for high entropy (might be encoded attack)
    const entropy = this.calculateEntropy(input);
    if (entropy > 5.0) {
      reasons.push('High entropy content detected');
    }

    return {
      sanitized,
      suspicious: reasons.length > 0,
      reasons
    };
  }

  private static calculateEntropy(str: string): number {
    const charCount = str.split('').reduce((acc, char) => {
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.values(charCount).reduce((entropy, count) => {
      const p = count / str.length;
      return entropy - p * Math.log2(p);
    }, 0);
  }
}

// Middleware functions
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const monitor = SecurityMonitor.getInstance();
  const originalSend = res.send;

  // Sanitize request body for logging
  let sanitizedBody = req.body;
  if (req.body && typeof req.body === 'object') {
    sanitizedBody = Object.keys(req.body).reduce((acc, key) => {
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
        acc[key] = '[REDACTED]';
      } else {
        acc[key] = req.body[key];
      }
      return acc;
    }, {} as any);
  }

  // Check for suspicious input
  if (req.body) {
    Object.entries(req.body).forEach(([field, value]) => {
      if (typeof value === 'string') {
        const result = InputSanitizer.sanitizeInput(value, field);
        if (result.suspicious) {
          monitor.logSecurityEvent({
            type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            severity: 'medium',
            ip: req.ip || req.socket.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent') || '',
            endpoint: req.path,
            method: req.method,
            payload: { field, original: value, sanitized: result.sanitized },
            details: { reasons: result.reasons }
          });
        }
      }
    });
  }

  next();
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;

  if (!token) {
    const monitor = SecurityMonitor.getInstance();
    monitor.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: 'high',
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || '',
      endpoint: req.path,
      method: req.method,
      details: { reason: 'Missing CSRF token' }
    });

    return res.status(403).json({ error: 'CSRF token required' });
  }

  // For simplicity, we'll just check if the token exists
  // In production, you'd validate it against a session or JWT
  next();
};

// Suspicious activity detection
export const suspiciousActivityDetector = (req: Request, res: Response, next: NextFunction) => {
  const monitor = SecurityMonitor.getInstance();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || '';
  const endpoint = req.path;

  // Check for rapid requests from same IP
  const recentEvents = monitor.getEventsByIP(ip, 1); // Last hour

  if (recentEvents.length > 50) { // Threshold for suspicious activity
    monitor.logSecurityEvent({
      type: SecurityEventType.ANOMALOUS_REQUEST,
      severity: 'medium',
      ip,
      userAgent,
      endpoint,
      method: req.method,
      details: { recentRequestCount: recentEvents.length }
    });
  }

  // Check for unusual user agents (empty or very short)
  if (!userAgent || userAgent.length < 10) {
    monitor.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: 'low',
      ip,
      userAgent,
      endpoint,
      method: req.method,
      details: { reason: 'Suspicious user agent' }
    });
  }

  next();
};

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();
