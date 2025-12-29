# Agency CLI Quick Start Guide
## Master the Command Line for Agency Operations

---

## 🚀 Installation

```bash
# Install via npm
npm install -g @vauntico/cli

# Or via yarn
yarn global add @vauntico/cli

# Verify installation
vauntico --version
```

## 🔐 Authentication

```bash
# Login with your agency account
vauntico auth login

# Set agency mode (enables white-label features)
vauntico config set mode agency

# Verify your agency tier
vauntico account info
```

---

## 📋 Essential Commands

### Client Management

```bash
# Onboard a new client
vauntico agency onboard \
  --client "acme-corp.co.za" \
  --modules "audit,workshop,distribution" \
  --white-label true \
  --branding ./acme-brand.json

# List all clients
vauntico agency clients

# View client details
vauntico agency client --name "acme-corp"

# Update client settings
vauntico agency client update \
  --name "acme-corp" \
  --add-module "scrolls"
```

### Audit Operations

```bash
# Run comprehensive audit
vauntico audit run \
  --url https://client-site.com \
  --pillars all \
  --brand "Your Agency Name" \
  --output ./reports/client-audit.pdf

# Quick audit (SEO + Conversion only)
vauntico audit run \
  --url https://client-site.com \
  --pillars seo,conversion \
  --format web

# Schedule recurring audits
vauntico audit schedule \
  --url https://client-site.com \
  --frequency monthly \
  --notify true

# Compare audits over time
vauntico audit compare \
  --baseline ./reports/jan-audit.json \
  --current ./reports/apr-audit.json

# Audit all clients
vauntico agency audit-all \
  --frequency monthly \
  --notify-clients true
```

### Workshop Generation

```bash
# Create workshop from template
vauntico workshop create \
  --type masterclass \
  --topic "Email Marketing Mastery" \
  --duration "90min" \
  --client "acme-corp" \
  --brand-kit ./branding/acme.json

# List available workshop templates
vauntico workshop templates

# Generate workshop landing page
vauntico workshop landing \
  --workshop-id abc123 \
  --style modern \
  --cta "Register Now"

# Export workshop content
vauntico workshop export \
  --workshop-id abc123 \
  --format pdf,slides,web
```

### Distribution & Syndication

```bash
# Setup distribution pipeline
vauntico distribution init \
  --client "startup-xyz" \
  --platforms "linkedin,twitter,email,blog" \
  --schedule "mon-wed-fri" \
  --auto-repurpose true

# Publish content across platforms
vauntico distribution publish \
  --content ./blog-post.md \
  --platforms all \
  --schedule "2025-02-01 09:00"

# View distribution analytics
vauntico distribution analytics \
  --client "startup-xyz" \
  --period "last-30-days"
```

### Scroll Generation

```bash
# Generate case study
vauntico scroll generate \
  --type case-study \
  --client "success-story-co" \
  --data ./client-data.json \
  --template agency-case-study \
  --output pdf,web

# Create custom scroll
vauntico scroll create \
  --title "The Ultimate SEO Guide" \
  --sections 5 \
  --tone professional \
  --brand-voice ./brand-voice.json

# List available scroll templates
vauntico scroll templates

# Export scroll
vauntico scroll export \
  --scroll-id xyz789 \
  --format markdown,pdf,html
```

---

## 📊 Analytics & Reporting

```bash
# Agency dashboard (overview)
vauntico agency dashboard

# Revenue analytics
vauntico agency revenue \
  --period "2025-Q1" \
  --format csv \
  --breakdown by-client

# Client report (send to client)
vauntico agency report \
  --client "acme-corp" \
  --period "january-2025" \
  --email-to client@acme-corp.com

# Bulk reporting (all clients)
vauntico agency reports \
  --period "2025-01" \
  --clients all \
  --email true
```

---

## 🎨 Branding & White-Label

```bash
# Setup custom branding
vauntico brand configure \
  --name "Your Agency" \
  --logo ./logo.png \
  --colors ./colors.json \
  --domain "tools.youragency.com"

# Apply branding to client
vauntico brand apply \
  --client "acme-corp" \
  --theme modern

# Export branded assets
vauntico brand export \
  --client "acme-corp" \
  --assets logo,templates,emails
```

---

## 🔧 Configuration

```bash
# View current config
vauntico config show

# Set default values
vauntico config set \
  --default-brand "Your Agency" \
  --default-output-format pdf \
  --auto-notify true

# Import config from file
vauntico config import ./agency-config.json

# Export config
vauntico config export ./backup-config.json
```

---

## 💡 Pro Tips

### Batch Operations

```bash
# Create config file for batch audits
cat > batch-audits.yaml <<EOF
clients:
  - name: acme-corp
    url: https://acme-corp.com
    pillars: all
  - name: startup-xyz
    url: https://startup-xyz.com
    pillars: seo,conversion
EOF

# Run batch audits
vauntico audit batch --config batch-audits.yaml
```

### Automation with Cron

```bash
# Add to crontab for monthly audits
0 9 1 * * vauntico agency audit-all --notify-clients true
```

### CI/CD Integration

```bash
# Add to GitHub Actions workflow
- name: Run Client Audits
  run: |
    vauntico auth login --token ${{ secrets.VAUNTICO_TOKEN }}
    vauntico agency audit-all --format json --output ./reports/
```

---

## 🆘 Troubleshooting

### Common Issues

**Authentication Failed:**
```bash
# Clear credentials and re-login
vauntico auth logout
vauntico auth login
```

**Insufficient Credits:**
```bash
# Check credit balance
vauntico credits balance

# View credit usage
vauntico credits usage --period this-month
```

**API Rate Limit:**
```bash
# Check rate limit status
vauntico status

# Wait or upgrade tier for higher limits
```

---

## 📚 Resources

- **Full Documentation:** [docs.vauntico.com/cli](https://docs.vauntico.com/cli)
- **API Reference:** [docs.vauntico.com/api](https://docs.vauntico.com/api)
- **Community Support:** [discord.gg/vauntico](https://discord.gg/vauntico)
- **Video Tutorials:** [youtube.com/@vauntico](https://youtube.com/@vauntico)

---

## 🎯 Quick Wins

### Your First Week

**Day 1:** Setup & authenticate
```bash
npm i -g @vauntico/cli
vauntico auth login
vauntico config set mode agency
```

**Day 2:** Onboard first client
```bash
vauntico agency onboard --client "test-client" --modules "audit"
```

**Day 3:** Run first audit
```bash
vauntico audit run --url https://test-client.com --pillars all
```

**Day 4:** Configure branding
```bash
vauntico brand configure --name "Your Agency" --logo ./logo.png
```

**Day 5:** Generate first report
```bash
vauntico agency report --client "test-client" --email-to you@agency.com
```

---

**Version:** 1.0  
**Last Updated:** 2025-01-25  
**For:** Vauntico Agency Partners
