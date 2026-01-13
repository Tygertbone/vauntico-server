# Phase 3 TypeScript Refactoring - Contributor Guide

## 🚀 Overview

Phase 3 focuses on systematic TypeScript refactoring across ~320 structural improvements. CI/CD is stable and ready to enforce quality gates.

## 📋 Issue Breakdown Strategy

### 🏷️ Issue Categories & Tagging

Create GitHub Issues with `ts-refactor` tag and specific scopes:

```bash
# Type System Improvements
- ts-refactor/any-types          # Replace `any` with proper types
- ts-refactor/interfaces          # Add missing interfaces
- ts-refactor/type-guards         # Implement type guards
- ts-refactor/generics            # Add proper generics
- ts-refactor/return-types        # Specify explicit return types

# Code Structure
- ts-refactor/error-handling     # Improve error typing
- ts-refactor/async-patterns     # Fix async/await typing
- ts-refactor/component-types      # Component prop typing
- ts-refactor/service-types       # Service layer typing

# Configuration & Build
- ts-refactor/ts-config          # TypeScript config improvements
- ts-refactor/build-issues        # Resolve build warnings
```

### 🎯 Bite-Sized Scopes

Each issue should be focused and achievable:

```markdown
## Example Issue Template

### 🎯 Scope
Replace 5-10 `any` types in `server-v2/src/services/`

### 📝 Description
- Target files: `featureUsageService.ts`, `trustScoreService.ts`
- Current `any` usage: 8 instances
- Define proper interfaces for unknown types

### ✅ Acceptance Criteria
- [ ] All `any` types replaced with specific types
- [ ] New interfaces exported where needed
- [ ] No new `any` types introduced
- [ ] Tests pass with new types

### 🔍 Files to Modify
- `server-v2/src/services/featureUsageService.ts`
- `server-v2/src/services/trustScoreService.ts`
- `server-v2/src/types/` (new interfaces if needed)

### 🧪 Testing Notes
- Run affected tests locally
- Verify service integration still works
- Check API responses unchanged
```

## 👥 Contributor Checklist

### 🔄 Before Any Push

```bash
# 1. Run lint locally (catches most issues fast)
npm run lint

# 2. Verify build compilation
npm run build

# 3. Run unit tests (ensure no regressions)
npm test

# 4. Run integration tests (validate workflows)
npm run test:integration

# 5. Check specific affected areas
npm run test -- --testPathPattern=affected-module
```

### 🚦 Expected CI/CD Behavior

**Our CI/CD will enforce the same gates:**

1. **Lint Enforcement** (`--max-warnings 0`)
   - ❌ Fails on any lint warnings
   - ✅ Catches type issues before merge

2. **Build Verification**
   - ❌ Fails if TypeScript compilation errors
   - ✅ Validates new types are correct

3. **Unit & Integration Tests**
   - ❌ Fails if test coverage drops
   - ✅ Ensures refactoring doesn't break functionality

## 🎯 Current Priority Categories

Based on latest CI run, focus on these areas first:

### 🔥 High Priority (Blocking CI)

```typescript
// 1. Replace 'any' types (8+ instances)
server-v2/src/db/pool.ts#22
server-v2/src/app.ts#27

// 2. Fix missing ESLint rules configuration
// Add @typescript-eslint rules to .eslintrc.json
```

### ⚠️ Medium Priority (Quality)

```typescript
// 3. Console statements (6 instances)
docs/scripts/validate-health-endpoints.js
api/waitlist.js
assets/vauntico_cookie_banner.tsx

// 4. Unused variables (3 instances)
assets/vauntico_cookie_banner.tsx
```

### 💡 Low Priority (Cleanup)

```typescript
// 5. Missing rule definitions
// Update ESLint config for consistency
```

## 🛠️ Development Workflow

### 📁 Working on an Issue

1. **Create Branch**: `ts-refactor/any-types-payment-service`
2. **Make Changes**: Focus on specific scope only
3. **Local Testing**: Run full checklist before commit
4. **Create PR**: Link to specific `ts-refactor` issue
5. **CI Validation**: Let CI/CD validate automatically

### 🔍 Review Process

**PR reviewers should check:**
- [ ] Issue scope respected (no scope creep)
- [ ] All type improvements are justified
- [ ] No new `any` types introduced
- [ ] Tests still pass
- [ ] Documentation updated if needed

## 🎊 Success Metrics

**Phase 3 Success When:**
- ✅ All `any` types eliminated
- ✅ Proper interfaces defined for all unknown types
- ✅ Type guards implemented for runtime checks
- ✅ CI/CD passes consistently
- ✅ Test coverage maintained or improved
- ✅ Build warnings eliminated

## 🆘️ Getting Help

### 📞 Troubleshooting

**CI fails on lint:**
```bash
# Check locally first
npm run lint -- --max-warnings 0

# Common fixes:
# - Add missing types
# - Import proper interfaces
# - Fix unused variables
```

**Tests fail after refactoring:**
```bash
# Check type compatibility
npm run build

# Run specific failing test
npm test -- --testNamePattern="failing-test"
```

### 💬 Communication

- **Slack**: `#phase3-typescript` for daily progress
- **GitHub**: Use `ts-refactor` label for all related issues
- **PR Reviews**: Tag `@phase3-reviewers` for focused review

---

**Ready to start Phase 3! 🚀**

Pick a `ts-refactor` issue, run the contributor checklist, and let the stable CI/CD pipeline validate your improvements.
