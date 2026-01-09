#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates required environment variables for Vauntico application
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.nodeEnv = process.env.NODE_ENV || 'development';
  }

  /**
   * Validate all required environment variables
   */
  validate() {
    console.log(`🔍 Validating environment variables for ${this.nodeEnv} environment...\n`);

    this.validateCoreSecrets();
    this.validateDatabaseConfig();
    this.validateAuthConfig();
    this.validatePaymentConfig();
    this.validateExternalServices();
    this.validateApplicationConfig();

    if (this.nodeEnv === 'production') {
      this.validateProductionConfig();
    }

    this.printResults();

    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  /**
   * Validate core application secrets
   */
  validateCoreSecrets() {
    const requiredSecrets = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'CRON_SECRET',
      'SESSION_SECRET',
      'ADMIN_ACCESS_KEY'
    ];

    requiredSecrets.forEach(secret => {
      if (!process.env[secret]) {
        this.errors.push(`Missing required secret: ${secret}`);
      } else if (process.env[secret].length < 32) {
        this.warnings.push(`${secret} is shorter than recommended (32+ characters)`);
      }
    });
  }

  /**
   * Validate database configuration
   */
  validateDatabaseConfig() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      this.errors.push('Missing required DATABASE_URL');
      return;
    }

    // Validate PostgreSQL URL format
    const postgresRegex = /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/.+$/;
    if (!postgresRegex.test(databaseUrl)) {
      this.errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    }

    // Check for localhost in production
    if (this.nodeEnv === 'production' && databaseUrl.includes('localhost')) {
      this.errors.push('DATABASE_URL should not use localhost in production');
    }
  }

  /**
   * Validate authentication configuration
   */
  validateAuthConfig() {
    // OAuth configuration
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      this.errors.push('Google OAuth credentials are required (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)');
    } else if (!googleClientId.includes('.apps.googleusercontent.com')) {
      this.warnings.push('GOOGLE_CLIENT_ID should be a valid Google OAuth client ID');
    }
  }

  /**
   * Validate payment configuration
   */
  validatePaymentConfig() {
    const requiredPaymentVars = [
      'PAYSTACK_SECRET_KEY',
      'PAYSTACK_PUBLIC_KEY',
      'PAYSTACK_CREATOR_PASS_PLAN_CODE',
      'PAYSTACK_ENTERPRISE_PLAN_CODE'
    ];

    requiredPaymentVars.forEach(varName => {
      if (!process.env[varName]) {
        this.errors.push(`Missing required payment variable: ${varName}`);
      }
    });

    // Validate Paystack keys format
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (paystackSecret && !paystackSecret.startsWith('sk_')) {
      this.warnings.push('PAYSTACK_SECRET_KEY should start with "sk_"');
    }

    const paystackPublic = process.env.PAYSTACK_PUBLIC_KEY;
    if (paystackPublic && !paystackPublic.startsWith('pk_')) {
      this.warnings.push('PAYSTACK_PUBLIC_KEY should start with "pk_"');
    }

    // Stripe validation (if enabled)
    if (process.env.STRIPE_ENABLED === 'true') {
      const stripeVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
      stripeVars.forEach(varName => {
        if (!process.env[varName]) {
          this.errors.push(`Stripe is enabled but missing: ${varName}`);
        }
      });
    }
  }

  /**
   * Validate external services configuration
   */
  validateExternalServices() {
    // Redis configuration
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      this.errors.push('Redis configuration is required (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)');
    } else if (!redisUrl.includes('upstash.io')) {
      this.warnings.push('UPSTASH_REDIS_REST_URL should be a valid Upstash Redis URL');
    }

    // Email service
    if (!process.env.RESEND_API_KEY) {
      this.errors.push('Email service configuration is required (RESEND_API_KEY)');
    } else if (!process.env.RESEND_API_KEY.startsWith('re_')) {
      this.warnings.push('RESEND_API_KEY should start with "re_"');
    }

    // Anthropic AI
    if (!process.env.ANTHROPIC_API_KEY) {
      this.errors.push('Anthropic AI configuration is required (ANTHROPIC_API_KEY)');
    } else if (!process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-api03-')) {
      this.warnings.push('ANTHROPIC_API_KEY should be a valid Anthropic API key');
    }

    // Slack (optional but recommended)
    if (!process.env.SLACK_WEBHOOK_URL) {
      this.warnings.push('SLACK_WEBHOOK_URL is not configured - notifications will be disabled');
    }
  }

  /**
   * Validate application configuration
   */
  validateApplicationConfig() {
    // Frontend URL
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      this.errors.push('FRONTEND_URL is required');
    } else {
      try {
        new URL(frontendUrl);
      } catch {
        this.errors.push('FRONTEND_URL must be a valid URL');
      }
    }

    // Rate limiting
    const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS);
    const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS);

    if (isNaN(rateLimitWindow) || rateLimitWindow < 60000) {
      this.warnings.push('RATE_LIMIT_WINDOW_MS should be at least 60000ms (1 minute)');
    }

    if (isNaN(rateLimitMax) || rateLimitMax < 10) {
      this.warnings.push('RATE_LIMIT_MAX_REQUESTS should be at least 10');
    }

    // Emergency revenue features
    const paymentBridgeFee = parseFloat(process.env.PAYMENT_BRIDGE_FEE_PERCENTAGE);
    const contentRecoveryFee = parseFloat(process.env.CONTENT_RECOVERY_FEE_PERCENTAGE);

    if (isNaN(paymentBridgeFee) || paymentBridgeFee < 0 || paymentBridgeFee > 100) {
      this.errors.push('PAYMENT_BRIDGE_FEE_PERCENTAGE must be between 0 and 100');
    }

    if (isNaN(contentRecoveryFee) || contentRecoveryFee < 0 || contentRecoveryFee > 100) {
      this.errors.push('CONTENT_RECOVERY_FEE_PERCENTAGE must be between 0 and 100');
    }
  }

  /**
   * Validate production-specific configuration
   */
  validateProductionConfig() {
    // OCI configuration
    const ociVars = ['OCI_COMPARTMENT_ID', 'OCI_USER_OCID', 'OCI_TENANCY', 'OCI_REGION'];
    ociVars.forEach(varName => {
      if (!process.env[varName]) {
        this.errors.push(`Production requires OCI configuration: ${varName}`);
      }
    });

    // Vercel configuration
    const vercelVars = ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_ORG_ID'];
    vercelVars.forEach(varName => {
      if (!process.env[varName]) {
        this.errors.push(`Production requires Vercel configuration: ${varName}`);
      }
    });

    // Instance configuration
    if (!process.env.INSTANCE_PRIVATE_IP || !process.env.INSTANCE_PUBLIC_IP) {
      this.errors.push('Production requires instance IP configuration (INSTANCE_PRIVATE_IP, INSTANCE_PUBLIC_IP)');
    }

    // Security headers
    if (process.env.NODE_ENV !== 'production') {
      this.warnings.push('NODE_ENV should be "production" in production environment');
    }
  }

  /**
   * Print validation results
   */
  printResults() {
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All environment variables are valid!');
      return;
    }

    if (this.errors.length > 0) {
      console.log('❌ Critical Errors:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log('');
    }

    if (this.errors.length > 0) {
      console.log('💥 Environment validation failed! Please fix the errors above.');
    } else {
      console.log('✅ Environment validation passed with warnings.');
    }
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new EnvironmentValidator();
  validator.validate();
}

export default EnvironmentValidator;
