# VAUNTICO.md
Living Memory File for Vauntico Engineering

This file records recurring issues, fixes, and best practices so contributors and automation agents learn from past mistakes. **Every mistake becomes a rule.**

---

## Rules

### Rule 1: Node.js Version
Always use **Node.js v24** in workflows. Never downgrade to v18.

### Rule 2: Submodules
Do not add orphaned or broken submodules. Remove unused references immediately.

### Rule 3: Package-Lock Consistency
Regenerate `package-lock.json` whenever dependencies change. Commit the lockfile to ensure CI consistency.

### Rule 4: Workspace Configuration
Only include existing workspaces in `package.json`. Do not reference non-existent packages.

### Rule 5: Semantic Commits
Use semantic commit prefixes (`feat:`, `fix:`, `docs:`, `ci:`, `chore:`, `scripts:`, `security:`). Group changes logically.

### Rule 6: CI/CD Verification
All pull requests must pass:
- Unit tests
- Integration tests
- Security scans (Trivy, Snyk)
- Browser-based smoke tests

### Rule 7: Slash Commands
Use project scripts (`npm run deploy`, `npm run validate`, `npm run cleanup`) instead of manual commands.

### Rule 8: Documentation Discipline
Update `CONTRIBUTOR_ONBOARDING.md` whenever workflows or scripts change. Keep onboarding time <30 minutes.

### Rule 9: Workflow Parallelization
CI/CD pipelines must run jobs in parallel (test, lint, security, build) to maximize efficiency.

### Rule 10: Verification Loops
Every automated agent or CI job must verify its own output (tests, scans, browser checks) before merging.

---
