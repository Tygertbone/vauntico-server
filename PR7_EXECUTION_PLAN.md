# PR #7 Execution Plan - CLI-Ready Commands

## 🎯 **Objective**

Drive PR #7 to merge by executing CLI-ready commands for each failing status check with minimal data usage.

---

## 📋 **Task Execution List**

### **Task 1: Linting Triage** (IMMEDIATE - HIGH PRIORITY)

```bash
[Step 1] → [Command] → [Likely Cause] → [Fix] → [Semantic Commit Message]
cd server-v2 && npm run lint --format=verbose → TS strict rules, unused imports, formatting → npm run lint:fix → targeted edits for TS errors → fix(lint): resolve TypeScript and ESLint violations for PR #7
```

### **Task 2: Unit Test Triage** (HIGH PRIORITY)

```bash
[Step 2] → [Command] → [Likely Cause] → [Fix] → [Semantic Commit Message]
cd server-v2 && npm run test:unit --verbose → middleware changes, auth mocks, env-dependent tests → update mocks, ensure deterministic inputs, isolate env usage → fix(test): stabilize unit tests for middleware and auth flows
```

### **Task 3: Integration Test Triage** (MEDIUM PRIORITY)

```bash
[Step 3] → [Command] → [Likely Cause] → [Fix] → [Semantic Commit Message]
cd server-v2 && npm run test:integration --verbose → DB connection, migrations not seeded, test data setup → ensure test DB URL, run migrations in test setup, seed fixtures → fix(test): repair integration setup with migrations and seeded fixtures
```

### **Task 4: OCI Auth Test Triage** (MEDIUM PRIORITY)

```bash
[Step 4] → [Command] → [Likely Cause] → [Fix] → [Semantic Commit Message]
cd server-v2 && npm run test:oci-auth → missing/incorrect secrets, token scope, endpoint mismatch → verify secrets in CI, align env names, mock external calls → fix(ci): align OCI auth secrets and mocks for CI reliability
```

---

## 🔧 **Minimal Data Usage Protocol**

### **Guardrails for CI/CD**

- ✅ **Always run locally before CI** to save data
- ✅ **Batch fixes into small semantic commits** to minimize network usage
- ✅ **Avoid network-heavy tests** unless necessary; prefer mocks
- ✅ **Surface failing test names and stack traces** in short summary
- ✅ **Use deterministic inputs** to ensure reproducible results

---

## 📝 **Commands Ready for Execution**

### **Execute in Order:**

```bash
# === TASK 1: LINTING ===
cd server-v2
npm run lint --format=verbose
npm run lint:fix
git add .
git commit -m "fix(lint): resolve TypeScript and ESLint violations for PR #7"

# === TASK 2: UNIT TESTS ===
npm run test:unit --verbose
# [Manual fixes based on output]
git add .
git commit -m "fix(test): stabilize unit tests for middleware and auth flows"

# === TASK 3: INTEGRATION TESTS ===
npm run test:integration --verbose
# [Manual fixes based on output]
git add .
git commit -m "fix(test): repair integration setup with migrations and seeded fixtures"

# === TASK 4: OCI AUTH TESTS ===
npm run test:oci-auth
# [Manual fixes based on output]
git add .
git commit -m "fix(ci): align OCI auth secrets and mocks for CI reliability"

# === PUSH AND VERIFY ===
git push origin fix-idempotent-migration
gh pr checks 7
```

---

## 📊 **Success Verification Before Each Push**

### **Local Verification Checklist:**

```bash
# 1. Tests pass locally
npm test

# 2. Linting passes
npm run lint

# 3. Build succeeds
npm run build

# 4. Git status is clean
git status
```

---

## 🚀 **Deployment Readiness Checklist**

### **Post-Fix Actions:**

1. ✅ **Monitor CI/CD Pipeline**: Watch GitHub Actions for each test run
2. ✅ **Verify Status Checks**: Ensure all 4 status checks pass
3. ✅ **Request Review**: Get collaborator approval with write access
4. ✅ **Merge to Main**: Once approved, merge to main branch
5. ✅ **Production Deployment**: Monitor automated deployment to production

---

## 🔍 **Debugging Commands**

### **Environment Verification:**

```bash
# Check test environment
cd server-v2 && npm run test:env

# Check test database connection
npm run test:db-connection

# Verify test data seeding
npm run test:seed
```

### **Cache Management:**

```bash
# Clear problematic cache
npm cache clean --force

# Fresh install with specific registry
npm ci --registry https://registry.npmjs.org/
```

---

## 📈 **Expected Timeline**

- **Task 1 (Linting)**: 30-45 minutes
- **Task 2 (Unit Tests)**: 45-90 minutes
- **Task 3 (Integration)**: 30-60 minutes
- **Task 4 (OCI Auth)**: 15-30 minutes

**Total Estimated Time**: 2-3 hours

---

## 🎯 **Final Success Criteria**

### **Target Status After All Tasks:**

- ✅ Integration Tests: PASS
- ✅ Linting: PASS
- ✅ Unit Tests: PASS
- ✅ OCI Auth Test: PASS
- ✅ All Status Checks: PASS
- ✅ PR becomes mergeable and deployable

---

## 📞 **Rollback Plan**

### **If Tests Fail After Push:**

```bash
# 1. Check CI logs immediately
gh run list --repo Tygertbone/vauntico-server --branch fix-idempotent-migration

# 2. Get specific run details
gh run view [run-id]

# 3. Fix locally based on CI failures
# 4. Create minimal fix commit
git add . && git commit -m "hotfix(ci): address CI failures"

# 5. Push fix
git push origin fix-idempotent-migration
```

---

## 🔥 **Immediate Actions Required**

### **START NOW - TASK 1 (LINTING):**

```bash
cd server-v2
npm run lint --format=verbose
```

**Expected Output**: Detailed linting errors with file paths and line numbers

**Next Step**: Run `npm run lint:fix` and address remaining issues manually

---

## 📋 **Progress Tracking**

### **Current Status**: 🔄 **READY FOR EXECUTION**

### **Priority**: 🚨 **HIGH** - Execute CLI-ready commands in specified order

### **Next Action**: **START TASK 1 IMMEDIATELY**

---

_Execution Plan Created: 2026-01-13_  
_Priority: CRITICAL - Execute commands in sequence to unblock PR #7_  
_Status: Ready for immediate execution of Task 1 (Linting)_
