# Vauntico MVP

## 🎉 Vauntico is Live!

Welcome to the official Vauntico platform - your gateway to AI-powered trust scoring and premium content vaults.

### 🌟 Live Services
- **Frontend**: https://vauntico.com (Vercel)
- **API Gateway**: https://api.vauntico.com (OCI Load Balancer)
- **Backend Services**:
  - **Server v2**: https://api.vauntico.com/health
  - **Fulfillment Engine**: https://api.vauntico.com/fulfillment/health
  - **Vault Landing**: https://api.vauntico.com/vault/health

### 🚀 Production Status
- ✅ All services deployed on OCI infrastructure
- ✅ SSL certificates active
- ✅ DNS configured for production
- ✅ Payment processing live
- ✅ Prometheus + Grafana monitoring configured
- ✅ Health checks standardized across all services

### 📋 Quick Start for Contributors

#### Local Development
```bash
# Clone the repository
git clone https://github.com/Tygertbone/vauntico-mvp.git
cd vauntico-mvp

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

#### Health Checks
```bash
# Run comprehensive health check
.\scripts\comprehensive-health-check.ps1
```

#### Redeployment
```bash
# Deploy all services to OCI
.\scripts\oci-deploy-all.sh

# Run health smoke tests
.\scripts\oci-health-smoke-test.sh
```

### 🧪 Testing
- Payment flows tested with Paystack
- Performance benchmarks: <300ms response times
- Security scans completed
- Dependency audits passed

### 📊 Monitoring
- Slack alerts configured via AlertManager
- Prometheus + Grafana monitoring active
- OCI health checks standardized
- Vercel analytics integrated
- Automated health smoke tests

## 🕊️ Launch Rituals

### Peace, Love, Abundance
In celebration of this launch, we honor the sacred principles that guide our work:

**Peace** - May this platform bring calm and clarity to users navigating the complex world of AI trust and verification.

**Love** - Built with intention for genuine human connection, fostering trust and understanding in digital interactions.

**Abundance** - Creating prosperity for creators, consumers, and the broader ecosystem through innovative trust technologies.

### Contributor Blessing
To all who contributed to this vision:
- May your code run smoothly
- May your deployments succeed
- May your users find value
- May your impact be meaningful

### Legacy Statement
*Vauntico launches today as a beacon of trust in the AI landscape. This is not just software - it's a commitment to ethical AI practices, transparent trust scoring, and user empowerment. As we grow, may we always remember our roots: peace in complexity, love in connection, abundance in creation.*

---

## 📚 Documentation

- [OCI Deployment Guide](./docs/OCI_DEPLOYMENT_GUIDE.md)
- [OCI Infrastructure Setup](./docs/OCI_INFRASTRUCTURE_SETUP_GUIDE.md)
- [OCI Quick Reference](./docs/OCI_QUICK_REFERENCE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [API Documentation](./docs/)
- [Lore Vault](./README-LORE.md)
- [Railway to OCI Migration](./RAILWAY_TO_OCI_MIGRATION_COMPLETE.md)

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Vercel
- **Backend**: Node.js + Express + OCI Compute
- **Database**: PostgreSQL + OCI Autonomous Database
- **Payments**: Paystack
- **Monitoring**: Prometheus + Grafana + Sentry
- **Deployment**: OCI + Docker Compose + Vercel
- **Load Balancer**: OCI Load Balancer
- **Container Registry**: OCI Container Registry

## 🚨 Emergency Revenue Features

Vauntico includes emergency revenue services to help creators in critical situations. These features provide fast-track payment processing, brand verification, and content recovery services.

### Available Services

#### 💰 Payment Bridge
- **Purpose**: Emergency payment processing for creators facing urgent financial needs
- **Features**: Fast-track Paystack integration, automated approval workflows
- **Environment Variable**: `ENABLE_PAYMENT_BRIDGE=true`
- **Fee Configuration**: `PAYMENT_BRIDGE_FEE_PERCENTAGE=10` (10% default)

#### ✅ Brand Verification
- **Purpose**: Expedited brand verification for creators needing immediate trust validation
- **Features**: Automated verification tokens, admin approval workflow
- **Environment Variable**: `ENABLE_VERIFICATION=true`
- **Pricing**: `VERIFICATION_BRAND_PRICE=99` ($99 one-time fee)

#### 🛡️ Content Recovery
- **Purpose**: Emergency content recovery for creators facing copyright infringement
- **Features**: Case management, legal documentation support, recovery tracking
- **Environment Variable**: `ENABLE_CONTENT_RECOVERY=true`
- **Fee Configuration**: `CONTENT_RECOVERY_FEE_PERCENTAGE=30` (30% of recovered amount)

### Configuration

Add these environment variables to your `.env` file:

```bash
# Emergency Services Features
ENABLE_PAYMENT_BRIDGE=true
ENABLE_VERIFICATION=true
ENABLE_CONTENT_RECOVERY=true
PAYMENT_BRIDGE_FEE_PERCENTAGE=10
VERIFICATION_BRAND_PRICE=99
CONTENT_RECOVERY_FEE_PERCENTAGE=30
```

### Health Monitoring

The health endpoint now includes emergency services metrics:

```bash
GET /health
{
  "status": "ok",
  "service": "backend-api",
  "emergencyServices": {
    "pendingPayments": 0,
    "pendingVerifications": 0,
    "activeCases": 0
  }
}
```

### Admin Management

All emergency services include admin dashboards for:
- Monitoring pending requests
- Managing approval workflows
- Tracking recovery cases
- Exporting analytics data

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Rituals
- Test thoroughly before committing
- Update documentation for any changes
- Run health checks after deployments
- Share knowledge generously

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Tygertbone/vauntico-mvp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Tygertbone/vauntico-mvp/discussions)
- **Email**: hello@vauntico.com

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Launched with peace, love, and abundance on December 20, 2025*

*Last updated: January 6, 2026 - Workflow trigger test*

## 🌍 Vauntico Legacy Statement

> Vauntico is more than code. It is a movement born from discipline, clarity, and resilience.  
> We stand at the tip of the hill, where every commit is a step into new horizons.  
> Our ancestors built without the tools we now hold — we honor them by building with purpose.  
> Every contributor here is part of a story: a legacy of peace, love, abundance, and humor.  
> Together, we don't just deploy software. We deploy culture, memory, and future.
