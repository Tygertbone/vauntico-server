# Monitoring & Alerting Setup Guide

## Vercel Dashboard (Primary Monitoring)

### Real-time Monitoring
1. Login to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `vauntico-mvp` project
3. Navigate to **Functions** tab for:
   - Request durations
   - Error rates
   - Cold start frequencies

### Logs & Error Tracking
- **Runtime Logs**: Search for API endpoint calls
- **Error Tracking**: Filter by status codes (500, 401, etc.)
- **Performance**: Monitor function execution times

## Uptime Monitoring Setup

### Option 1: UptimeRobot (Free Tier)
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create free account
3. Add monitor:
   - **URL**: `https://api.vauntico.com/health`
   - **Monitoring Interval**: 5 minutes
   - **Monitor Type**: HTTP(s)

### Option 2: Pingdom (Trial/Paid)
1. Sign up at [pingdom.com](https://pingdom.com)
2. Add new check:
   - **URL**: `https://api.vauntico.com/health`
   - **Check interval**: Every 1 minute
   - **Expected status**: 200

### Option 3: Vercel Analytics
Already included - no setup needed:
- Uptime tracking
- Performance metrics
- Error analytics

## Error Alerting

### Slack Integration via Webhook

#### Step 1: Create Slack Webhook
1. Go to [slack.com/apps](https://slack.com/apps)
2. Search for "Incoming Webhooks"
3. Add to your workspace
4. Choose channel (e.g., #alerts)
5. Copy webhook URL

#### Step 2: Environment Variables in Vercel
Add to your project environment variables:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

#### Step 3: Add Slack Alerting (Optional)
For custom alerting beyond Vercel, you could add to server-v2:

```typescript
// server-v2/src/utils/slack-alerts.ts
export const sendSlackAlert = async (message: string, details?: any) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) return;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Vauntico API Alert: ${message}`,
      attachments: details ? [{ text: JSON.stringify(details, null, 2) }] : []
    })
  });
};
```

## Log Analysis Queries

### Common Vercel Log Searches

```
# API Errors (last 24h)
statusCode:500 OR statusCode:401 OR statusCode:403

# Slow requests (>2000ms)
duration:>2000

# Authentication issues
statusCode:401

# CORS issues (for debugging)
"CORS blocked"

# Health checks (skip these in summary views)
-method:GET -url:/health
```

## Key Metrics to Monitor

### API Performance
- **P95 Response Time**: <2000ms target
- **Error Rate**: <5% target
- **Uptime**: 99.9% target

### Business Metrics
- Active API calls per hour
- Trust score calculation frequency
- Authentication success rates

## Alert Thresholds

### Critical (Immediate Alert)
- API down >5 minutes
- Error rate >10%
- P95 latency >5000ms

### Warning (Daily Review)
- P95 latency 2000-5000ms
- Error rate 5-10%
- Unusual traffic spikes

## Troubleshooting

### Common Monitoring Issues

1. **No logs appearing**
   - Verify environment deployed correctly
   - Check Vercel function cold starts

2. **False positive alerts**
   - Adjust monitoring intervals
   - Filter out health check endpoints

3. **High latency spikes**
   - Check database connection pools
   - Monitor concurrent request limits
   - Verify Redis/Upstash performance

## Cost Optimization

- **Vercel Analytics**: $0/month (included)
- **UptimeRobot**: Free tier sufficient for basic monitoring
- **Pingdom**: ~$10/month for advanced features
- **Logtail**: ~$7/month for centralized logging
