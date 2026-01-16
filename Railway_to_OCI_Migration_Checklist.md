# Vauntico Railway to OCI Migration Checklist

## Migration Overview

Migrating Vauntico deployment pipeline from Railway to OCI with improved reliability and enterprise-grade infrastructure.

## ✅ Completed Tasks

### Phase 1: Analysis & Planning

- [x] Analyzed current project structure and confirmed we're in vauntico-server repo
- [x] Confirmed server-v2 code structure and Railway.toml configuration
- [x] Reviewed GitHub workflows - no Railway references found (already OCI-ready)
- [x] Verified all required secrets are configured in GitHub
- [x] Examined validation scripts and health endpoints
- [x] Confirmed OCI infrastructure is already in place

## 🚧 In Progress Tasks

### Phase 2: Server-v2 Migration

- [ ] Move server-v2 code to root of vauntico-server repo
- [ ] Remove Railway-specific configuration (railway.toml)
- [ ] Update package.json and Dockerfile configurations
- [ ] Test local build and deployment

### Phase 3: OCI Deployment Workflow Enhancement

- [ ] Review and enhance existing OCI deployment workflow
- [ ] Ensure Docker image builds correctly for OCI Container Registry
- [ ] Validate OCI Container Registry push functionality
- [ ] Test deployment to OCI compute/OKE services

### Phase 4: Secrets Management

- [x] DATABASE_URL - ✅ Configured
- [x] STRIPE_SECRET_KEY - ✅ Configured
- [x] PAYSTACK_SECRET_KEY - ✅ Configured
- [x] SESSION_SECRET - ✅ Configured
- [ ] Validate all secrets work with OCI deployment

### Phase 5: Validation Scripts Enhancement

- [ ] Update validation scripts for OCI endpoints with retries
- [ ] Add longer timeouts for OCI infrastructure
- [ ] Test /health endpoint validation
- [ ] Test /api/v1/trustscore endpoint validation
- [ ] Test /api/v1/brand endpoint validation
- [ ] Test /api/v1/pass endpoint validation

### Phase 6: Final Deployment Validation

- [ ] Execute full deployment pipeline
- [ ] Confirm green check on OCI deploy
- [ ] Validate all endpoints are accessible
- [ ] Run smoke tests
- [ ] Monitor performance and logs

## 📋 Key Migration Details

### Repository Structure Changes

```
vauntico-server/
├── src/                    # Move from server-v2/src
├── package.json           # Move from server-v2/
├── Dockerfile             # Update for OCI
├── .github/workflows/     # Already OCI-ready
└── migrations/           # Move from server-v2/migrations
```

### Required Secrets (Already Configured)

- ✅ DATABASE_URL
- ✅ STRIPE_SECRET_KEY
- ✅ PAYSTACK_SECRET_KEY
- ✅ SESSION_SECRET
- ✅ OCI\_\* secrets for deployment

### OCI Deployment Targets

- Container Registry: OCI Container Registry
- Compute Service: OCI Compute Instances or OKE
- Endpoint: api.vauntico.com

## 🎯 Success Criteria

- [ ] Server-v2 code successfully migrated to vauntico-server repo
- [ ] Railway references completely removed
- [ ] OCI deployment pipeline working end-to-end
- [ ] All health endpoints responding correctly
- [ ] Green check on OCI deployment
- [ ] Validation scripts passing with retries and timeouts

## 🚨 Risks & Mitigations

- **Risk**: Database connection issues during migration
  **Mitigation**: Verify DATABASE_URL works with OCI networking
- **Risk**: Docker build failures on OCI
  **Mitigation**: Test Dockerfile locally before push
- **Risk**: Timeout issues with OCI infrastructure
  **Mitigation**: Implement proper retry logic and timeouts

## 📊 Timeline Estimate

- Phase 2: 1-2 hours
- Phase 3: 1-2 hours
- Phase 4: 30 minutes (validation)
- Phase 5: 1 hour
- Phase 6: 2-3 hours

**Total Estimated Time**: 5.5-8.5 hours
