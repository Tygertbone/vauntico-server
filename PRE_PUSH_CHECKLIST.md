# 🚀 Pre-Push Ritual: Complete Guide

## 📋 Quick Start

**Run this before EVERY push:**

```bash
npm run pre-push-ritual
```

## 🔍 What the Ritual Checks

### 1. Local Validation

- ✅ Build completes successfully
- ✅ All tests pass
- ✅ Linting passes
- ✅ Type checking passes (if available)

### 2. Environment Security

- ✅ Required environment variables present
- ✅ No exposed secrets in staged changes
- ✅ Environment files properly configured

### 3. Dependency Health

- ✅ Lockfile exists and is current
- ✅ node_modules is up to date
- ✅ Cache settings optimized

### 4. Log Verbosity

- ✅ LOG_LEVEL set to minimal (warn/error)
- ✅ NPM logging optimized
- ✅ Debug flags disabled

### 5. Git Hygiene

- ✅ Working directory clean
- ✅ No large files staged
- ✅ No unnecessary artifacts

### 6. Network Optimization

- ✅ Offline-first settings configured
- ✅ Cache strategies in place
- ✅ Minimal network requests

## 🛠️ Manual Commands (Backup)

If the script fails, run these manually:

```bash
# 1. Build and test
npm run build
npm test
npm run lint
npm run typecheck  # if available

# 2. Check environment
cat .env | grep REQUIRED_SECRET

# 3. Optimize dependencies
npm ci --prefer-offline

# 4. Set minimal logging
export LOG_LEVEL=warn

# 5. Git hygiene
git status
git diff --cached

# 6. Push only when ready
git push origin main
```

## 📊 Expected Results

### ✅ Success Indicators

- All checks pass (green checkmarks)
- Data usage < 1GB per workflow
- Build time < 10 minutes
- Cache hit rate > 80%

### ⚠️ Warning Signs

- Any check fails
- Large files detected
- Missing environment variables
- Verbose logging detected

## 🚨 Stop Conditions

**DO NOT PUSH if:**

- Build fails
- Tests fail
- Large files (>10MB) staged
- Secrets detected in changes
- Environment variables missing

## 🔄 Troubleshooting

### Common Issues & Solutions

**Build Failures:**

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm ci --prefer-offline
```

**Test Failures:**

```bash
# Run specific tests with more output
npm test -- --verbose
```

**Large Files:**

```bash
# Find large files
find . -type f -size +10M -not -path "./node_modules/*"
```

**Cache Issues:**

```bash
# Clear npm cache
npm cache clean --force
```

## 📈 Performance Targets

| Metric         | Target | Current |
| -------------- | ------ | ------- |
| Data Usage     | <1GB   | TBD     |
| Build Time     | <10min | TBD     |
| Cache Hit Rate | >80%   | TBD     |
| Failure Rate   | <5%    | TBD     |

## 🎯 Best Practices

### Daily Workflow

1. **Start** with `npm run pre-push-ritual`
2. **Review** any warnings or failures
3. **Fix** issues before pushing
4. **Monitor** CI/CD performance
5. **Optimize** based on metrics

### Team Guidelines

- Always run the ritual before pushing
- Share optimization techniques
- Monitor and report issues
- Participate in weekly reviews

## 📚 Related Resources

- [Data Efficiency Strategy](./DATA_EFFICIENCY_STRATEGY.md)
- [Memory Guardrails](./memories.md)
- [NPM Configuration](./.npmrc)
- [Optimized Workflows](./.github/workflows/)

## 🆘 Getting Help

If you encounter issues:

1. Check the ritual output for specific errors
2. Review the troubleshooting section above
3. Consult the Data Efficiency Strategy document
4. Ask the team for help with specific issues

---

**Remember**: The pre-push ritual saves time, reduces costs, and prevents failed CI runs. It's your first line of defense against data waste!

**Every byte saved is a win!** 🎉
