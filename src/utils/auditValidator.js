/**
 * 🔐 Vauntico Audit Validator - Lore-Sealing Audit Engine
 * Part of Section 2B: Validator Evolution + Syndication Scrolls
 * 
 * Upgrades basic timestamp + signature checking into a comprehensive
 * audit logging system with scroll-based recording.
 */

import CryptoJS from 'crypto-js'

// Audit Types Registry
export const AUDIT_TYPES = {
  GIT_ARCHEOLOGY: 'git-archeology',
  DEPLOYMENT_HEALTH: 'deployment-health',
  MODULE_MAPPING: 'module-mapping',
  SECURITY_SCAN: 'security-scan',
  PERFORMANCE_AUDIT: 'performance-audit',
  CODE_QUALITY: 'code-quality',
  WEBHOOK_VALIDATION: 'webhook-validation',
  ACCESS_GRANT: 'access-grant',
  SUBSCRIPTION_EVENT: 'subscription-event'
}

// Audit Severity Levels
export const AUDIT_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
}

/**
 * Generate a cryptographic signature for audit records
 * @param {Object} payload - The data to sign
 * @param {string} secret - Secret key for signing
 * @returns {string} - SHA-256 signature hash
 */
export function generateAuditSignature(payload, secret = 'vauntico-audit-seal') {
  const dataString = JSON.stringify(payload)
  return CryptoJS.SHA256(dataString + secret).toString()
}

/**
 * Verify an audit signature
 * @param {Object} payload - The original data
 * @param {string} signature - The signature to verify
 * @param {string} secret - Secret key used for signing
 * @returns {boolean} - Whether signature is valid
 */
export function verifyAuditSignature(payload, signature, secret = 'vauntico-audit-seal') {
  const expectedSignature = generateAuditSignature(payload, secret)
  return expectedSignature === signature
}

/**
 * Create a sealed audit scroll (immutable audit log entry)
 * @param {Object} params - Audit parameters
 * @returns {Object} - Sealed audit scroll
 */
export function createAuditScroll({
  auditType,
  result,
  metadata = {},
  severity = AUDIT_SEVERITY.INFO,
  userId = 'anonymous'
}) {
  const timestamp = new Date().toISOString()
  const scrollId = `scroll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const payload = {
    scrollId,
    timestamp,
    auditType,
    userId,
    severity,
    result,
    metadata
  }
  
  const signature = generateAuditSignature(payload)
  
  const sealedScroll = {
    ...payload,
    signature,
    sealed: true,
    version: '1.0'
  }
  
  return sealedScroll
}

/**
 * Verify the integrity of an audit scroll
 * @param {Object} scroll - The audit scroll to verify
 * @returns {Object} - Verification result
 */
export function verifyAuditScroll(scroll) {
  if (!scroll.sealed) {
    return { valid: false, reason: 'Scroll is not sealed' }
  }
  
  const { signature, ...payload } = scroll
  const isValid = verifyAuditSignature(payload, signature)
  
  return {
    valid: isValid,
    reason: isValid ? 'Signature verified' : 'Signature mismatch',
    scrollId: scroll.scrollId,
    timestamp: scroll.timestamp
  }
}

/**
 * Audit Log Manager - LocalStorage-based for MVP
 * Future: Migrate to backend Audit-as-a-Service
 */
export class AuditLogManager {
  constructor(storageKey = 'vauntico_audit_scrolls') {
    this.storageKey = storageKey
  }
  
  /**
   * Save an audit scroll to localStorage
   * @param {Object} scroll - The sealed audit scroll
   */
  saveScroll(scroll) {
    const scrolls = this.getAllScrolls()
    scrolls.push(scroll)
    localStorage.setItem(this.storageKey, JSON.stringify(scrolls))
    
    // Also maintain a separate index for quick lookups
    this.updateScrollIndex(scroll)
  }
  
  /**
   * Retrieve all audit scrolls
   * @returns {Array} - All stored audit scrolls
   */
  getAllScrolls() {
    const scrollsJson = localStorage.getItem(this.storageKey)
    return scrollsJson ? JSON.parse(scrollsJson) : []
  }
  
  /**
   * Get scrolls by audit type
   * @param {string} auditType - The type of audit to filter by
   * @returns {Array} - Filtered audit scrolls
   */
  getScrollsByType(auditType) {
    return this.getAllScrolls().filter(scroll => scroll.auditType === auditType)
  }
  
  /**
   * Get scrolls by date range
   * @param {Date} startDate - Start of range
   * @param {Date} endDate - End of range
   * @returns {Array} - Filtered audit scrolls
   */
  getScrollsByDateRange(startDate, endDate) {
    return this.getAllScrolls().filter(scroll => {
      const scrollDate = new Date(scroll.timestamp)
      return scrollDate >= startDate && scrollDate <= endDate
    })
  }
  
  /**
   * Get scrolls by severity level
   * @param {string} severity - Severity level to filter by
   * @returns {Array} - Filtered audit scrolls
   */
  getScrollsBySeverity(severity) {
    return this.getAllScrolls().filter(scroll => scroll.severity === severity)
  }
  
  /**
   * Update the scroll index for quick lookups
   * @param {Object} scroll - The audit scroll to index
   */
  updateScrollIndex(scroll) {
    const indexKey = `${this.storageKey}_index`
    const index = JSON.parse(localStorage.getItem(indexKey) || '{}')
    
    // Index by type
    if (!index.byType) index.byType = {}
    if (!index.byType[scroll.auditType]) index.byType[scroll.auditType] = []
    index.byType[scroll.auditType].push(scroll.scrollId)
    
    // Index by severity
    if (!index.bySeverity) index.bySeverity = {}
    if (!index.bySeverity[scroll.severity]) index.bySeverity[scroll.severity] = []
    index.bySeverity[scroll.severity].push(scroll.scrollId)
    
    // Update counts
    if (!index.counts) index.counts = { total: 0 }
    index.counts.total += 1
    
    localStorage.setItem(indexKey, JSON.stringify(index))
  }
  
  /**
   * Get audit statistics
   * @returns {Object} - Audit statistics
   */
  getStats() {
    const scrolls = this.getAllScrolls()
    const stats = {
      total: scrolls.length,
      byType: {},
      bySeverity: {},
      recentScrolls: scrolls.slice(-10).reverse(),
      oldestScroll: scrolls[0]?.timestamp,
      newestScroll: scrolls[scrolls.length - 1]?.timestamp
    }
    
    // Count by type
    Object.values(AUDIT_TYPES).forEach(type => {
      stats.byType[type] = scrolls.filter(s => s.auditType === type).length
    })
    
    // Count by severity
    Object.values(AUDIT_SEVERITY).forEach(severity => {
      stats.bySeverity[severity] = scrolls.filter(s => s.severity === severity).length
    })
    
    return stats
  }
  
  /**
   * Verify all scrolls for integrity
   * @returns {Object} - Verification report
   */
  verifyAllScrolls() {
    const scrolls = this.getAllScrolls()
    const results = scrolls.map(scroll => ({
      scrollId: scroll.scrollId,
      verification: verifyAuditScroll(scroll)
    }))
    
    const valid = results.filter(r => r.verification.valid).length
    const invalid = results.filter(r => !r.verification.valid).length
    
    return {
      total: scrolls.length,
      valid,
      invalid,
      integrityScore: scrolls.length > 0 ? (valid / scrolls.length) * 100 : 0,
      details: results
    }
  }
  
  /**
   * Export scrolls for backup or migration
   * @returns {string} - JSON string of all scrolls
   */
  exportScrolls() {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      version: '1.0',
      scrolls: this.getAllScrolls()
    }, null, 2)
  }
  
  /**
   * Import scrolls from backup
   * @param {string} jsonData - JSON string of scrolls
   */
  importScrolls(jsonData) {
    const data = JSON.parse(jsonData)
    const existingScrolls = this.getAllScrolls()
    const mergedScrolls = [...existingScrolls, ...data.scrolls]
    
    // Remove duplicates by scrollId
    const uniqueScrolls = mergedScrolls.filter((scroll, index, self) =>
      index === self.findIndex(s => s.scrollId === scroll.scrollId)
    )
    
    localStorage.setItem(this.storageKey, JSON.stringify(uniqueScrolls))
    
    // Rebuild index
    localStorage.removeItem(`${this.storageKey}_index`)
    uniqueScrolls.forEach(scroll => this.updateScrollIndex(scroll))
  }
  
  /**
   * Clear all audit scrolls (use with caution!)
   * @param {string} confirmationCode - Must be 'CLEAR_ALL_AUDITS' to proceed
   */
  clearAllScrolls(confirmationCode) {
    if (confirmationCode === 'CLEAR_ALL_AUDITS') {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem(`${this.storageKey}_index`)
      return { success: true, message: 'All audit scrolls cleared' }
    }
    return { success: false, message: 'Invalid confirmation code' }
  }
}

/**
 * Webhook Validator with Audit Logging
 * Validates incoming webhook payloads and logs them as audit scrolls
 */
export class WebhookValidator {
  constructor() {
    this.auditManager = new AuditLogManager()
  }
  
  /**
   * Validate webhook timestamp (prevent replay attacks)
   * @param {string} timestamp - ISO timestamp from webhook
   * @param {number} maxAgeSeconds - Maximum age in seconds
   * @returns {Object} - Validation result
   */
  validateTimestamp(timestamp, maxAgeSeconds = 300) {
    const webhookTime = new Date(timestamp)
    const now = new Date()
    const ageSeconds = (now - webhookTime) / 1000
    
    const valid = ageSeconds >= 0 && ageSeconds <= maxAgeSeconds
    
    return {
      valid,
      age: ageSeconds,
      reason: valid ? 'Timestamp valid' : 
        ageSeconds < 0 ? 'Timestamp is in the future' : 'Timestamp too old'
    }
  }
  
  /**
   * Validate webhook signature
   * @param {Object} payload - Webhook payload
   * @param {string} receivedSignature - Signature from webhook headers
   * @param {string} secret - Webhook secret
   * @returns {Object} - Validation result
   */
  validateSignature(payload, receivedSignature, secret) {
    const expectedSignature = generateAuditSignature(payload, secret)
    const valid = expectedSignature === receivedSignature
    
    return {
      valid,
      reason: valid ? 'Signature verified' : 'Signature mismatch'
    }
  }
  
  /**
   * Validate and log a webhook event
   * @param {Object} params - Webhook validation parameters
   * @returns {Object} - Validation result with audit scroll
   */
  validateWebhook({
    payload,
    signature,
    timestamp,
    secret,
    eventType = 'webhook'
  }) {
    const results = {
      timestamp: this.validateTimestamp(timestamp),
      signature: this.validateSignature(payload, signature, secret)
    }
    
    const allValid = results.timestamp.valid && results.signature.valid
    
    // Create audit scroll
    const auditScroll = createAuditScroll({
      auditType: AUDIT_TYPES.WEBHOOK_VALIDATION,
      result: {
        valid: allValid,
        checks: results,
        eventType,
        payload: allValid ? payload : '[REDACTED]' // Only log payload if valid
      },
      severity: allValid ? AUDIT_SEVERITY.INFO : AUDIT_SEVERITY.HIGH,
      metadata: {
        webhookTimestamp: timestamp,
        receivedAt: new Date().toISOString()
      }
    })
    
    // Save to audit log
    this.auditManager.saveScroll(auditScroll)
    
    return {
      valid: allValid,
      results,
      auditScroll
    }
  }
}

// Export singleton instances
export const auditManager = new AuditLogManager()
export const webhookValidator = new WebhookValidator()

// Helper function to log generic audits
export function logAudit({ auditType, result, metadata, severity, userId }) {
  const scroll = createAuditScroll({ auditType, result, metadata, severity, userId })
  auditManager.saveScroll(scroll)
  return scroll
}
