# Secrets Setup Guide for Vauntico Deployment

## Required GitHub Actions Secrets

Add the following secrets to your GitHub repository settings:

### Core API Keys
- `RESEND_API_KEY`: Your Resend email service API key
- `PAYSTACK_SECRET_KEY`: Your Paystack payment processor secret key
- `ANTHROPIC_API_KEY`: Your Anthropic Claude API key
- `SENTRY_DSN`: Your Sentry error tracking DSN
- `SLACK_WEBHOOK_URL`: Your Slack webhook URL for notifications
- `SERVICE_API_KEY`: Your internal service API key

### Email Configuration
- `SENDER_EMAIL`: The email address used as sender (e.g., noreply@yourdomain.com)

### Payment Processing
- `STRIPE_SECRET_KEY`: Your Stripe secret key (if using Stripe)

### OCI Cloud Infrastructure (if applicable)
- `OCI_PRIVATE_KEY`: Oracle Cloud Infrastructure private key
- `OCI_USER_OCID`: Oracle Cloud user OCID
- `OCI_TENANCY_OCID`: Oracle Cloud tenancy OCID
- `OCI_FINGERPRINT`: Oracle Cloud API key fingerprint
- `OCI_REGION`: Oracle Cloud region (e.g., us-ashburn-1)
- `OCI_BASTION_CONFIG`: Oracle Cloud bastion configuration
- `OCI_BASTION_CIDR`: Oracle Cloud bastion CIDR configuration

### Additional Services
- `RAILWAY_TOKEN`: Railway deployment token (if using Railway)

## Vercel Environment Variables

Add the following environment variables to your Vercel project:

### Public Variables (exposed to frontend)
- `NEXT_PUBLIC_API_URL`: Your backend API URL
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Your Paystack public key
- `NEXT_PUBLIC_ENABLE_PAYMENT_BRIDGE`: true
- `NEXT_PUBLIC_ENABLE_VERIFICATION`: true
- `NEXT_PUBLIC_ENABLE_CONTENT_RECOVERY`: true

### Secret Variables
- `RESEND_API_KEY`: Same as GitHub Actions
- `PAYSTACK_SECRET_KEY`: Same as GitHub Actions
- `ANTHROPIC_API_KEY`: Same as GitHub Actions
- `SENTRY_DSN`: Same as GitHub Actions
- `SLACK_WEBHOOK_URL`: Same as GitHub Actions
- `SERVICE_API_KEY`: Same as GitHub Actions
- `SENDER_EMAIL`: Same as GitHub Actions

## Setup Instructions

### GitHub Actions
1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret from the list above
5. Ensure "Keep values for pull requests from forks" is checked if needed

### Vercel
1. Go to your Vercel dashboard
2. Select your Vauntico project
3. Navigate to Settings > Environment Variables
4. Add each variable from the list above
5. Mark sensitive variables as "Secret"

## Validation

After setting up secrets, you can validate by:

1. Running the health check script: `node server-v2/services-health-check.js`
2. Testing the build pipeline: Trigger a GitHub Actions build
3. Verifying environment variable access in your application

## Security Notes

- Never commit secrets to your repository
- Use different keys for development and production environments
- Rotate keys regularly
- Monitor access logs and usage patterns
- Implement proper key revocation procedures

## Troubleshooting

If services fail to start:
1. Check that secrets are correctly spelled and formatted
2. Verify environment variable names match exactly
3. Check service provider dashboards for API key status
4. Review GitHub Actions logs for detailed error messages
