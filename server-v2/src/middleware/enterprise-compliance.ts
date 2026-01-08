import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { securityMonitor, SecurityEventType } from './security';

// Enterprise Compliance Framework for African Markets
// POPIA (Protection of Personal Information Act) Compliance
// GDPR Alignment for International Enterprise Customers

export enum ComplianceFramework {
  POPIA = 'popia',
  GDPR = 'gdpr',
  ISO27001 = 'iso27001',
  SOC2 = 'soc2',
  HIPAA = 'hipaa'
}

export enum DataCategory {
  PERSONAL_IDENTIFIABLE = 'personal_identifiable',
  SENSITIVE_PERSONAL = 'sensitive_personal',
  FINANCIAL = 'financial',
  HEALTH = 'health',
  BIOMETRIC = 'biometric',
  GEOLOCATION = 'geolocation',
  COMMUNICATION = 'communication'
}

export enum ProcessingPurpose {
  CONSENT = 'consent',
  CONTRACTUAL = 'contractual',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests'
}

export interface ComplianceEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  framework: ComplianceFramework;
  dataCategory: DataCategory;
  processingPurpose: ProcessingPurpose;
  action: 'access' | 'process' | 'store' | 'delete' | 'share' | 'export';
  dataSubject: string;
  consentRecord?: string;
  legalBasis?: string;
  retentionPeriod?: number;
  crossBorderTransfer?: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface DataPrivacyRequest {
  id: string;
  type: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction';
  userId: string;
  dataCategories: DataCategory[];
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  reason?: string;
  evidence?: string[];
}

export class EnterpriseComplianceManager {
  private static instance: EnterpriseComplianceManager;
  private complianceEvents: ComplianceEvent[] = [];
  private privacyRequests: Map<string, DataPrivacyRequest> = new Map();
  private readonly maxEventsInMemory = 5000;

  private constructor() {}

  static getInstance(): EnterpriseComplianceManager {
    if (!EnterpriseComplianceManager.instance) {
      EnterpriseComplianceManager.instance = new EnterpriseComplianceManager();
    }
    return EnterpriseComplianceManager.instance;
  }

  // Log compliance event
  logComplianceEvent(event: Omit<ComplianceEvent, 'id' | 'timestamp'>): string {
    const eventId = crypto.randomUUID();
    const fullEvent: ComplianceEvent = {
      ...event,
      id: eventId,
      timestamp: new Date()
    };

    // Add to in-memory store
    this.complianceEvents.push(fullEvent);

    // Keep only recent events
    if (this.complianceEvents.length > this.maxEventsInMemory) {
      this.complianceEvents = this.complianceEvents.slice(-this.maxEventsInMemory);
    }

    // Log to security monitor
    securityMonitor.logSecurityEvent({
      type: SecurityEventType.DATA_ACCESS,
      severity: this.mapRiskToSeverity(event.riskLevel),
      ip: event.ipAddress,
      userAgent: event.userAgent,
      userId: event.userId,
      endpoint: 'compliance-event',
      method: 'LOG',
      details: {
        complianceEventId: eventId,
        framework: event.framework,
        dataCategory: event.dataCategory,
        action: event.action,
        riskLevel: event.riskLevel
      }
    });

    // Store in database for audit trail
    this.storeComplianceEvent(fullEvent).catch(err => {
      console.error('Failed to store compliance event:', err);
    });

    return eventId;
  }

  // Create privacy request
  createPrivacyRequest(request: Omit<DataPrivacyRequest, 'id' | 'requestedAt'>): string {
    const requestId = crypto.randomUUID();
    const fullRequest: DataPrivacyRequest = {
      ...request,
      id: requestId,
      requestedAt: new Date()
    };

    this.privacyRequests.set(requestId, fullRequest);

    // Log the privacy request
    this.logComplianceEvent({
      userId: request.userId,
      ipAddress: 'system',
      userAgent: 'privacy-request-system',
      framework: ComplianceFramework.POPIA,
      dataCategory: DataCategory.PERSONAL_IDENTIFIABLE,
      processingPurpose: ProcessingPurpose.LEGAL_OBLIGATION,
      action: 'access',
      dataSubject: request.userId,
      riskLevel: 'medium',
      metadata: {
        privacyRequestId: requestId,
        requestType: request.type,
        dataCategories: request.dataCategories
      }
    });

    return requestId;
  }

  // Get compliance statistics
  getComplianceStats(timeframe: number = 24): {
    totalEvents: number;
    eventsByFramework: Record<ComplianceFramework, number>;
    eventsByCategory: Record<DataCategory, number>;
    eventsByRiskLevel: Record<string, number>;
    privacyRequestsStats: {
      total: number;
      pending: number;
      completed: number;
      rejected: number;
    };
    crossBorderTransfers: number;
  } {
    const cutoff = new Date(Date.now() - (timeframe * 60 * 60 * 1000));
    const recentEvents = this.complianceEvents.filter(event => event.timestamp >= cutoff);

    const eventsByFramework = recentEvents.reduce((acc, event) => {
      acc[event.framework] = (acc[event.framework] || 0) + 1;
      return acc;
    }, {} as Record<ComplianceFramework, number>);

    const eventsByCategory = recentEvents.reduce((acc, event) => {
      acc[event.dataCategory] = (acc[event.dataCategory] || 0) + 1;
      return acc;
    }, {} as Record<DataCategory, number>);

    const eventsByRiskLevel = recentEvents.reduce((acc, event) => {
      acc[event.riskLevel] = (acc[event.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const privacyRequestsArray = Array.from(this.privacyRequests.values());
    const privacyRequestsStats = {
      total: privacyRequestsArray.length,
      pending: privacyRequestsArray.filter(r => r.status === 'pending').length,
      completed: privacyRequestsArray.filter(r => r.status === 'completed').length,
      rejected: privacyRequestsArray.filter(r => r.status === 'rejected').length
    };

    const crossBorderTransfers = recentEvents.filter(event => event.crossBorderTransfer).length;

    return {
      totalEvents: recentEvents.length,
      eventsByFramework,
      eventsByCategory,
      eventsByRiskLevel,
      privacyRequestsStats,
      crossBorderTransfers
    };
  }

  // Check data retention compliance
  checkRetentionCompliance(dataCategory: DataCategory, dataAge: number): {
    compliant: boolean;
    maxRetentionDays: number;
    daysUntilExpiry: number;
    action: 'retain' | 'review' | 'delete';
  } {
    const retentionPolicies = {
      [DataCategory.PERSONAL_IDENTIFIABLE]: 365, // 1 year
      [DataCategory.SENSITIVE_PERSONAL]: 180, // 6 months
      [DataCategory.FINANCIAL]: 2555, // 7 years (legal requirement)
      [DataCategory.HEALTH]: 2555, // 7 years (legal requirement)
      [DataCategory.BIOMETRIC]: 90, // 3 months
      [DataCategory.GEOLOCATION]: 30, // 30 days
      [DataCategory.COMMUNICATION]: 180 // 6 months
    };

    const maxRetentionDays = retentionPolicies[dataCategory] || 365;
    const daysUntilExpiry = maxRetentionDays - dataAge;

    let action: 'retain' | 'review' | 'delete';
    if (daysUntilExpiry > 30) {
      action = 'retain';
    } else if (daysUntilExpiry > 0) {
      action = 'review';
    } else {
      action = 'delete';
    }

    return {
      compliant: dataAge <= maxRetentionDays,
      maxRetentionDays,
      daysUntilExpiry,
      action
    };
  }

  private mapRiskToSeverity(riskLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    const mapping = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'critical'
    };
    return mapping[riskLevel] as 'low' | 'medium' | 'high' | 'critical' || 'medium';
  }

  private async storeComplianceEvent(event: ComplianceEvent): Promise<void> {
    try {
      const { pool } = await import('../db/pool');

      await pool.query(`
        INSERT INTO compliance_events (
          id, timestamp, user_id, ip_address, user_agent, framework,
          data_category, processing_purpose, action, data_subject,
          consent_record, legal_basis, retention_period, cross_border_transfer,
          risk_level, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO NOTHING
      `, [
        event.id,
        event.timestamp,
        event.userId,
        event.ipAddress,
        event.userAgent,
        event.framework,
        event.dataCategory,
        event.processingPurpose,
        event.action,
        event.dataSubject,
        event.consentRecord,
        event.legalBasis,
        event.retentionPeriod,
        event.crossBorderTransfer,
        event.riskLevel,
        JSON.stringify(event.metadata)
      ]);
    } catch (error) {
      console.error('Failed to store compliance event:', error);
    }
  }
}

// Middleware functions
export const enterpriseComplianceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const complianceManager = EnterpriseComplianceManager.getInstance();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || '';

  // Determine data category based on endpoint and request data
  const dataCategory = determineDataCategory(req.path, req.body);
  
  // Determine processing purpose
  const processingPurpose = determineProcessingPurpose(req.method, req.path);

  // Log compliance event for data processing
  if (shouldLogComplianceEvent(req.method, req.path)) {
    complianceManager.logComplianceEvent({
      userId: (req as any).user?.id,
      ipAddress: ip,
      userAgent,
      framework: ComplianceFramework.POPIA, // Default to POPIA for African compliance
      dataCategory,
      processingPurpose,
      action: mapHttpMethodToAction(req.method),
      dataSubject: (req as any).user?.id || 'anonymous',
      riskLevel: assessRiskLevel(req.path, req.method, dataCategory),
      metadata: {
        endpoint: req.path,
        method: req.method,
        contentType: req.get('Content-Type'),
        referer: req.get('Referer')
      }
    });
  }

  next();
};

// Helper functions
function determineDataCategory(path: string, body: any): DataCategory {
  if (path.includes('/health') || path.includes('/biometric')) {
    return DataCategory.HEALTH;
  }
  if (path.includes('/payment') || path.includes('/billing') || path.includes('/subscription')) {
    return DataCategory.FINANCIAL;
  }
  if (path.includes('/location') || path.includes('/geolocation')) {
    return DataCategory.GEOLOCATION;
  }
  if (path.includes('/contact') || path.includes('/message')) {
    return DataCategory.COMMUNICATION;
  }
  if (body?.idNumber || body?.passport || body?.driverLicense) {
    return DataCategory.SENSITIVE_PERSONAL;
  }
  return DataCategory.PERSONAL_IDENTIFIABLE;
}

function determineProcessingPurpose(method: string, path: string): ProcessingPurpose {
  if (path.includes('/consent')) {
    return ProcessingPurpose.CONSENT;
  }
  if (path.includes('/contract') || path.includes('/subscription')) {
    return ProcessingPurpose.CONTRACTUAL;
  }
  if (path.includes('/legal') || path.includes('/compliance')) {
    return ProcessingPurpose.LEGAL_OBLIGATION;
  }
  return ProcessingPurpose.LEGITIMATE_INTERESTS;
}

function shouldLogComplianceEvent(method: string, path: string): boolean {
  // Skip logging for health checks and static assets
  if (path === '/health' || path.startsWith('/static') || path.startsWith('/assets')) {
    return false;
  }
  
  // Log all data-modifying operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }
  
  // Log GET requests to sensitive endpoints
  const sensitiveEndpoints = ['/user', '/admin', '/trustscore', '/compliance'];
  return sensitiveEndpoints.some(endpoint => path.includes(endpoint));
}

function mapHttpMethodToAction(method: string): ComplianceEvent['action'] {
  switch (method) {
    case 'GET': return 'access';
    case 'POST': return 'store';
    case 'PUT': return 'process';
    case 'DELETE': return 'delete';
    case 'PATCH': return 'process';
    default: return 'access';
  }
}

function assessRiskLevel(path: string, method: string, dataCategory: DataCategory): 'low' | 'medium' | 'high' | 'critical' {
  // Critical risk for sensitive data operations
  if (dataCategory === DataCategory.SENSITIVE_PERSONAL || dataCategory === DataCategory.BIOMETRIC) {
    return 'critical';
  }
  
  // High risk for financial and health data
  if (dataCategory === DataCategory.FINANCIAL || dataCategory === DataCategory.HEALTH) {
    return 'high';
  }
  
  // High risk for admin operations
  if (path.includes('/admin')) {
    return 'high';
  }
  
  // Medium risk for data modification
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return 'medium';
  }
  
  return 'low';
}

export const enterpriseComplianceManager = EnterpriseComplianceManager.getInstance();