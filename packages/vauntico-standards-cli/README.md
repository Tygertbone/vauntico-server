# @vauntico/standards-cli

Vauntico Standards Enforcement CLI - Automated governance and compliance enforcement for Vauntico projects.

## Installation

### Global Installation

```bash
npm install -g @vauntico/standards-cli
```

### Local Installation

```bash
npm install @vauntico/standards-cli --save-dev
```

## Usage

### Basic Commands

#### Initialize Standards Enforcement

```bash
# Initialize with basic template
vauntico-standards init

# Initialize with enterprise template
vauntico-standards init --template enterprise

# Initialize microservice template
vauntico-standards init --template microservice
```

#### Run Compliance Checks

```bash
# Run comprehensive standards check
vauntico-standards check

# Run specific category
vauntico-standards check --category security
vauntico-standards check --category lint
vauntico-standards check --category coverage

# Quick scan for critical issues
vauntico-standards check --quick

# Comprehensive scan with detailed reporting
vauntico-standards check --comprehensive

# Auto-fix common issues
vauntico-standards check --fix

# Generate compliance report
vauntico-standards check --report
```

#### Configuration Management

```bash
# Set configuration value
vauntico-standards config --set coverage.threshold=80

# Get configuration value
vauntico-standards config --get coverage.threshold

# List all configuration
vauntico-standards config --list
```

#### Dashboard and Monitoring

```bash
# Start compliance dashboard
vauntico-standards dashboard --port 3000

# Start continuous monitoring
vauntico-standards monitor --interval 300 --webhook https://hooks.slack.com/...
```

#### Generate Reports

```bash
# Generate markdown report
vauntico-standards report --format markdown --output compliance-report.md

# Generate JSON report
vauntico-standards report --format json --output compliance-report.json

# Email report
vauntico-standards report --email team@company.com
```

## Configuration

The CLI can be configured via:

1. **Command-line options** (as shown above)
2. **Configuration file** (`.vauntico-standards.json`)
3. **Environment variables**

### Configuration File Example

```json
{
  "coverage": {
    "threshold": 80,
    "exclude": ["**/*.test.js", "**/*.spec.js"]
  },
  "security": {
    "secretPatterns": ["password", "api_key", "secret", "token"]
  },
  "workflow": {
    "commitTypes": [
      "feat",
      "fix",
      "docs",
      "style",
      "refactor",
      "test",
      "chore"
    ],
    "semanticCommits": true
  },
  "notifications": {
    "webhook": "https://hooks.slack.com/...",
    "email": "team@company.com"
  }
}
```

## Integration with CI/CD

### GitHub Actions

```yaml
name: Standards Enforcement

on: [push, pull_request]

jobs:
  standards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
      - name: Install Vauntico Standards CLI
        run: npm install -g @vauntico/standards-cli
      - name: Run Standards Check
        run: vauntico-standards check --comprehensive --report
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: compliance-report
          path: compliance-report.json
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit
vauntico-standards check --quick
if [ $? -ne 0 ]; then
  echo "❌ Standards check failed. Commit aborted."
  exit 1
fi
```

## Cross-Repo Propagation

To ensure all Vauntico repositories inherit the same guardrails:

1. **Add to package.json**:

```json
{
  "devDependencies": {
    "@vauntico/standards-cli": "^1.0.0"
  },
  "scripts": {
    "standards": "vauntico-standards check",
    "standards:fix": "vauntico-standards check --fix",
    "standards:report": "vauntico-standards report"
  }
}
```

2. **Initialize in each repository**:

```bash
cd vauntico-repo
vauntico-standards init --template enterprise
```

3. **Add to CI/CD workflows**:

- Include standards checks in all CI pipelines
- Block merges on standards failures
- Generate compliance reports for visibility

## Features

### 🚀 Enforcement Categories

- **Lint & Hygiene**: ESLint, Prettier, code style
- **Security**: Secret detection, dependency scanning, security workflows
- **Testing**: Coverage thresholds, test quality, CI integration
- **Documentation**: Required files, README completeness, API docs
- **Workflow**: Semantic commits, PR standards, branch protection
- **Governance**: KPI tracking, compliance scoring, trend analysis

### 🔧 Automated Remediation

- **ESLint auto-fix**: Automatic fixing of common linting issues
- **Prettier formatting**: Code formatting with consistent style
- **Dependency updates**: Security vulnerability fixes
- **Import organization**: ES module conversion suggestions

### 📊 Monitoring & Reporting

- **Real-time dashboard**: Grafana integration for metrics visualization
- **Compliance scoring**: Overall project health assessment
- **Trend analysis**: Historical compliance tracking
- **Alert notifications**: Webhook and email notifications

### 🎯 Governance KPIs

- **Test Coverage**: Minimum 80% threshold enforcement
- **Commit Frequency**: Development activity monitoring
- **Documentation Coverage**: Required files and completeness
- **Security Posture**: Vulnerability tracking and remediation
- **Contributor Onboarding**: New contributor setup completion

## Metrics and Monitoring

The CLI integrates with Prometheus and Grafana for comprehensive monitoring:

### Prometheus Metrics

- `vauntico_standards_compliance_percentage`: Overall compliance score
- `vauntico_test_coverage_percentage`: Test coverage percentage
- `vauntico_lint_violations_count`: Number of lint violations
- `vauntico_security_findings_total`: Security findings count
- `vauntico_commit_frequency`: Development activity rate

### Grafana Dashboards

- **Compliance Overview**: Standards adherence trends
- **Security Posture**: Vulnerability tracking and remediation
- **Quality Metrics**: Code quality and testing metrics
- **Governance KPIs**: Overall governance compliance score

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © Vauntico Engineering

## Support

- **Documentation**: [Full documentation](https://github.com/vauntico/standards-cli#readme)
- **Issues**: [GitHub Issues](https://github.com/vauntico/standards-cli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/vauntico/standards-cli/discussions)
- **Email**: engineering@vauntico.com
