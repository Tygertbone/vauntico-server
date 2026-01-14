# 🧹 BFG Repo-Cleaner Instructions

## Prerequisites

1. Download BFG Repo-Cleaner from: https://rtyley.github.io/bfg-repo-cleaner/
2. Ensure Java is installed (required for BFG)

## Step-by-Step Cleanup

### 1. Create Passwords File

Create a file named `passwords.txt` with the following content:

```
npg_BNyQzvI6EZ5i
npg_laWfvsB7Rb1y
re_ZWNrjxiz_KaY7DmQL7H6RMUeenhFCUKLB
neondb_owner
```

### 2. Run BFG Commands

```bash
# Remove all .env files from history
bfg --delete-files "*.env"

# Replace all passwords in repository history
bfg --replace-text passwords.txt

# Remove specific commit if needed (replace HASH with actual commit hash)
# bfg --delete-commits HASH
```

### 3. Clean Up and Force Push

```bash
# Clean up residual files
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push the cleaned repository
git push --force
```

### 4. Verify Cleanup

```bash
# Search for any remaining secrets
git log --all --full-history -- "*env*"
git log --all --full-history | grep -i "password\|secret\|key"
```

## Alternative: git-filter-repo

If you prefer git-filter-repo (more modern tool):

```bash
# Install git-filter-repo
pip3 install git-filter-repo

# Remove .env files
git-filter-repo --path .env --invert-paths

# Replace text in files
echo "npg_BNyQzvI6EZ5i==>REMOVED" > replacements.txt
echo "npg_laWfvsB7Rb1y==>REMOVED" >> replacements.txt
echo "re_ZWNrjxiz_KaY7DmQL7H6RMUeenhFCUKLB==>REMOVED" >> replacements.txt
git-filter-repo --replace-text replacements.txt
```

## Important Notes

- This will permanently rewrite git history
- All team members will need to re-clone the repository
- Coordinate with your team before running these commands
- Test on a separate branch first if possible

## Safety Precautions

### Before Running BFG

1. **BACKUP REPOSITORY**: Create a complete backup of the current repository
2. **NOTIFY TEAM**: Inform all developers about the upcoming history rewrite
3. **TEST BRANCH**: Practice on a test branch first
4. **DOCUMENT**: Document all changes for future reference

### After Running BFG

1. **VERIFY**: Double-check that all secrets are removed
2. **NOTIFY**: Inform team that they need to re-clone
3. **UPDATE**: Update any integrated systems or CI/CD pipelines
4. **MONITOR**: Watch for any issues after the force push

## Additional Cleanup Commands

### Remove Specific File Types

```bash
# Remove all environment files
bfg --delete-files "*.env*"

# Remove all backup files
bfg --delete-files "*.backup"
bfg --delete-files "*.bak"

# Remove all temporary files
bfg --delete-files "*.tmp"
bfg --delete-files "*.temp"
```

### Replace Specific Patterns

```bash
# Create a more comprehensive replacements file
cat > replacements.txt << EOF
npg_BNyQzvI6EZ5i==>REMOVED
npg_laWfvsB7Rb1y==>REMOVED
re_ZWNrjxiz_KaY7DmQL7H6RMUeenhFCUKLB==>REMOVED
neondb_owner==>REMOVED_USER
DATABASE_URL==>REMOVED_URL
API_KEY==>REMOVED_KEY
SECRET_KEY==>REMOVED_SECRET
EOF

# Apply replacements
bfg --replace-text replacements.txt
```

## Verification Scripts

### Search for Remaining Secrets

```bash
# Search for environment files
git log --all --full-history --name-only | grep -E "\.env"

# Search for password patterns
git log --all --full-history --grep -i "password"

# Search for API key patterns
git log --all --full-history --grep -i "api[_-]?key"

# Search for secret patterns
git log --all --full-history --grep -i "secret"
```

### Automated Secret Detection

```bash
# Use git-secrets for additional scanning
git secrets --register-aws
git secrets --scan-history

# Use truffleHog for advanced detection
trufflehog --regex --entropy=False /path/to/repo
```

## Post-Cleanup Validation Checklist

- [ ] All .env files removed from history
- [ ] All passwords replaced with "REMOVED"
- [ ] All API keys replaced with "REMOVED"
- [ ] No secrets found in commit history
- [ ] No secrets found in file contents
- [ ] Repository functions correctly after cleanup
- [ ] All team members notified of changes
- [ ] CI/CD pipelines updated if needed
- [ ] Backup of original repository created
- [ ] Documentation updated with new procedures

## Emergency Rollback

If something goes wrong during cleanup:

```bash
# If you have a backup
git reset --hard backup-branch-name

# If you need to restore from remote backup
git remote add backup /path/to/backup/repo.git
git fetch backup
git reset --hard backup/main
```

## Contact Information

- **BFG Repo-Cleaner GitHub**: https://github.com/rtyley/bfg-repo-cleaner
- **git-filter-repo Documentation**: https://github.com/newren/git-filter-repo
- **Git Secrets Documentation**: https://github.com/awslabs/git-secrets
