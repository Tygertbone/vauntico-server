require('dotenv').config();

async function checkService(serviceName, checkFunction) {
  try {
    const result = await checkFunction();
    return {
      service: serviceName,
      status: 'ok',
      message: result.message || 'Service is healthy'
    };
  } catch (error) {
    return {
      service: serviceName,
      status: 'error',
      message: error.message || 'Unknown error occurred'
    };
  }
}

async function checkResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'test@resend.dev',
      to: 'test@example.com',
      subject: 'Health Check',
      html: '<p>This is a health check email.</p>'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${error}`);
  }

  return { message: 'Email service operational' };
}

async function checkAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: 'Hello'
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  return { message: 'AI service operational' };
}

async function checkPaystack() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY not configured');
  }

  const response = await fetch('https://api.paystack.co/transaction/verify/test', {
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 404) {
    return { message: 'Paystack service accessible (test transaction not found as expected)' };
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Paystack API error: ${response.status} - ${error}`);
  }

  return { message: 'Payment processor operational' };
}

async function checkSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    throw new Error('SENTRY_DSN not configured');
  }

  // Parse DSN to validate format
  const dsnMatch = dsn.match(/https:\/\/([^@]+)@([^\/]+)\/(\d+)/);
  if (!dsnMatch) {
    throw new Error('Invalid SENTRY_DSN format');
  }

  const [, key, host, projectId] = dsnMatch;

  // Try to send a test event (this might not actually create an event in Sentry)
  const response = await fetch(`https://${host}/api/${projectId}/envelope/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-sentry-envelope'
    },
    body: `${key}\n{"type":"session"}\n{"init":true,"started":"2023-01-01T00:00:00.000Z"}`
  });

  // Sentry typically returns 200 even for invalid data
  if (response.status >= 400) {
    throw new Error(`Sentry endpoint error: ${response.status}`);
  }

  return { message: 'Error tracking service configured' };
}

async function checkSlack() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('SLACK_WEBHOOK_URL not configured');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: '🔍 Vauntico Health Check - Slack integration working',
      blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Vauntico Health Check*\nService: Slack Integration\nStatus: ✅ Operational'
        }
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Slack webhook error: ${response.status} - ${error}`);
  }

  return { message: 'Alerting service operational' };
}

async function checkStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === 'sk_test_your-stripe-secret-key') {
    throw new Error('STRIPE_SECRET_KEY not properly configured');
  }

  const response = await fetch('https://api.stripe.com/v1/customers', {
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  if (!data.object === 'list') {
    throw new Error('Unexpected Stripe API response format');
  }

  return { message: 'Payment processor operational (Stripe)' };
}

async function runHealthChecks() {
  const services = [
    'Resend',
    'Anthropic',
    'Paystack',
    'Sentry',
    'Slack'
  ];

  const results = [];

  // Check each service
  for (const service of services) {
    let checkFunction;
    switch (service) {
      case 'Resend':
        checkFunction = checkResend;
        break;
      case 'Anthropic':
        checkFunction = checkAnthropic;
        break;
      case 'Paystack':
        checkFunction = checkPaystack;
        break;
      case 'Sentry':
        checkFunction = checkSentry;
        break;
      case 'Slack':
        checkFunction = checkSlack;
        break;
    }

    console.log(`🔍 Checking ${service}...`);
    const result = await checkService(service, checkFunction);
    results.push(result);

    if (result.status === 'ok') {
      console.log(`✅ ${service}: ${result.message}`);
    } else {
      console.log(`❌ ${service}: ${result.message}`);
    }
  }

  // Check Stripe separately as it's disabled/scaffolded
  console.log(`🔍 Checking Stripe (scaffolded)...`);
  try {
    const stripeResult = await checkService('Stripe', checkStripe);
    results.push(stripeResult);

    if (stripeResult.status === 'ok') {
      console.log(`✅ Stripe: ${stripeResult.message}`);
    } else {
      console.log(`⚠️  Stripe: ${stripeResult.message} (expected if scaffolded)`);
    }
  } catch (error) {
    results.push({
      service: 'Stripe',
      status: 'error',
      message: 'Stripe is disabled or not properly configured (expected for scaffolded service)'
    });
    console.log(`⚠️  Stripe: ${results[results.length - 1].message}`);
  }

  // Determine overall status
  const hasErrors = results.some(result => result.status === 'error');
  const overallStatus = hasErrors ? 'partial' : 'ok';

  const output = {
    status: overallStatus,
    services: results
  };

  console.log(`\n🏥 Overall Status: ${overallStatus.toUpperCase()}`);
  console.log(`📊 Services Checked: ${results.length}`);
  console.log(`✅ Healthy: ${results.filter(r => r.status === 'ok').length}`);
  console.log(`❌ Issues: ${results.filter(r => r.status === 'error').length}`);

  // Output JSON for consumption
  console.log('\n📤 JSON Output:');
  console.log(JSON.stringify(output, null, 2));

  return output;
}

// Run the health checks
if (require.main === module) {
  runHealthChecks().catch(error => {
    console.error('❌ Health check runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runHealthChecks };
