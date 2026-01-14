# Railway Multi-Service Deployment Guide

## Overview

This configuration deploys all Vauntico backend services as separate Railway instances with isolated environments and health checks.

## Services Configuration

### 1. Trust Score Backend (`trust-score-backend`)

- **Path:** `server-v2/`
- **Port:** 3001
- **Health:** `/health`
- **Start:** `npm run start`
- **Environment Variables:**
  ```env
  DATABASE_URL=postgresql://user:password@host:port/database
  UPSTASH_REDIS_REST_URL=redis://user:password@host:port
  UPSTASH_REDIS_REST_TOKEN=your-redis-token
  JWT_SECRET=your-jwt-secret
  PAYSTACK_SECRET_KEY=your-paystack-secret
  STRIPE_SECRET_KEY=your-stripe-secret
  SENDER_EMAIL=noreply@yourapp.com
  RESEND_API_KEY=your-resend-key
  ANTHROPIC_API_KEY=your-claude-key
  ```

### 2. Fulfillment Engine (`fulfillment-engine`)

- **Path:** `vauntico-fulfillment-engine/`
- **Port:** 5000
- **Health:** `/api/status`
- **Start:** `npm run start`
- **Environment Variables:**
  ```env
  AIRTABLE_API_KEY=your-airtable-key
  AIRTABLE_BASE_ID=your-airtable-base-id
  AIRTABLE_TABLE_NAME=your-table-name
  CLAUDE_API_KEY=your-claude-key
  RESEND_API_KEY=your-resend-key
  SENDER_EMAIL=noreply@yourapp.com
  ```

### 3. Legacy Server (`legacy-server`)

- **Path:** `server/`
- **Port:** 5000
- **Health:** `/api/status`
- **Start:** `npm run start`
- **Environment Variables:** (Same as fulfillment-engine)

### 4. Vauntico Server Alternative (`vauntico-server`)

- **Path:** `vauntico-server/`
- **Port:** 3001
- **Health:** `/health`
- **Start:** `npm run start`
- **Environment Variables:** (Same as trust-score-backend)

## Deployment Process

### 1. Environment Setup

1. Go to Railway dashboard
2. Create 4 separate projects for each service
3. Configure environment variables for each service as shown above
4. Connect GitHub repository to each project

### 2. Automatic Deployment

- Push to GitHub triggers automatic deployment
- Each service deploys independently with isolated environments
- Health checks ensure services are running correctly

### 3. Health Check Endpoints

- `trust-score-backend`: `GET /health` → `{ "status": "ok" }`
- `fulfillment-engine`: `GET /api/status` → `{ "status": "ok", "message": "Vauntico Fulfillment Engine is live" }`
- `legacy-server`: `GET /api/status` → Same as fulfillment-engine
- `vauntico-server`: `GET /health` → `{ "status": "ok" }`

## Service Isolation

### Benefits

- **Independent Scaling:** Each service can scale based on its own load
- **Fault Tolerance:** Failure in one service doesn't affect others
- **Environment Separation:** No shared environment variables between services
- **Independent Rollbacks:** Each service can be rolled back independently

### Communication Between Services

- Use Railway internal networking for service-to-service communication
- Environment variables for service URLs:
  ```env
  TRUST_SCORE_BACKEND_URL=https://trust-score-backend-production.up.railway.app
  FULFILLMENT_ENGINE_URL=https://fulfillment-engine-production.up.railway.app
  ```

## Monitoring

### Railway Dashboard

- Monitor each service individually
- Check logs, metrics, and health status separately
- Set up alerts for each service

### Health Monitoring

- All services expose health endpoints
- Railway automatically monitors health check paths
- Configure alerting for service failures

## Troubleshooting

### Service-Specific Issues

1. **Check service logs** in Railway dashboard
2. **Verify environment variables** for the specific service
3. **Test health endpoint** manually
4. **Check build logs** for deployment issues

### Common Issues

- **Port conflicts:** Each service uses different default ports
- **Environment variables:** Ensure correct variables per service
- **Health check failures:** Verify health endpoint exists and returns 200

## Rollback Strategy

### Individual Service Rollback

1. Go to Railway project for the specific service
2. Deploy previous commit
3. Other services continue running unaffected

### Full Rollback

1. Rollback each service individually
2. Use GitHub revert if needed
3. Redeploy all services

## Performance Optimization

### Railway-Specific Optimizations

- Use Railway's built-in CDN for static assets
- Configure appropriate service sizes based on expected load
- Enable Railway's automatic scaling for high-traffic services

### Database Connections

- Use Railway's managed PostgreSQL for primary services
- Configure connection pooling for optimal performance
- Consider Redis caching for frequently accessed data

## Security Considerations

### Environment Variables

- Never commit sensitive environment variables
- Use Railway's encrypted environment variable storage
- Rotate API keys regularly

### Service Communication

- Use Railway's internal networking for secure service-to-service communication
- Implement proper authentication between services
- Validate all incoming requests

## Cost Optimization

### Resource Allocation

- Monitor resource usage per service
- Right-size Railway plans based on actual usage
- Consider scaling patterns (vertical vs horizontal)

### Database Costs

- Use Railway's managed PostgreSQL efficiently
- Implement proper indexing
- Consider read replicas for read-heavy services

## Deployment Commands

### Manual Deployment

```bash
# Deploy all services
git push origin main

# Deploy specific service (if using separate branches)
git checkout trust-score-backend
git push origin trust-score-backend
```

### Environment Promotion

```bash
# Deploy to staging
git push origin staging

# Deploy to production
git push origin main
```

## Conclusion

This multi-service Railway configuration provides:

- ✅ **Service Isolation** - Each backend runs independently
- ✅ **Health Monitoring** - All services have health checks
- ✅ **Independent Scaling** - Scale services based on individual needs
- ✅ **Fault Tolerance** - One service failure doesn't cascade
- ✅ **Environment Security** - Isolated environment variables per service

The configuration is production-ready and follows Railway best practices for multi-service deployments.
