# 🚀 Deployment Recovery Checklist

## Current Status: Docker CLI Installing (65% complete)

Your Docker Desktop "empty package" issue is being resolved with Docker CLI only installation. Here's your complete recovery checklist:

## ✅ Phase 1: Docker CLI Installation (IN PROGRESS)

**Status**: Installing at 65% - approximately 2-3 minutes remaining
**Command**: `choco install docker-cli -y`

### When Installation Completes (Next 2-3 minutes):

1. **Verify Installation**:

   ```cmd
   docker --version
   docker compose version
   ```

2. **Test Docker Functionality**:
   ```cmd
   docker run --rm hello-world
   ```

## 🔴 Phase 2: Critical OCI Secrets Setup (URGENT)

**Timeline**: 5 minutes
**Impact**: Production services are DOWN until this is complete

### Required Actions:

1. **Navigate to GitHub Secrets**:
   - URL: https://github.com/Tygertbone/vauntico-server/settings/secrets/actions
   - Click "New repository secret"

2. **Add OCI_PRIVATE_KEY**:
   - Name: `OCI_PRIVATE_KEY`
   - Value: Base64-encoded OCI private key PEM file
   - Description: "OCI API private key for authentication"

3. **Add OCI_FINGERPRINT**:
   - Name: `OCI_FINGERPRINT`
   - Value: MD5 fingerprint from OCI Console (format: "12:34:56:...:f0")
   - Description: "OCI API key fingerprint for authentication"

### Quick Base64 Conversion (if needed):

```powershell
# Convert OCI private key to Base64
$filePath = "C:\path\to\oci_api_key.pem"
$content = Get-Content -Path $filePath -Raw
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content)) | Set-Clipboard
```

## 🧪 Phase 3: Authentication Test (2 minutes)

### Test OCI Configuration:

```cmd
gh workflow run mcp-oci-connector.yml --field oci_action=authenticate
```

### Monitor Results:

```cmd
gh workflow view
```

**Expected Success**: "OCI authentication successful" with namespace shown

## 🚀 Phase 4: Production Deployment (10 minutes)

### Deploy to OCI:

```cmd
gh workflow run mcp-oci-connector.yml --field oci_action=build-push --field image_tag=v20260117-0140
```

### Monitor Deployment:

```cmd
gh workflow view
gh run list --workflow=mcp-oci-connector.yml
```

## ✅ Phase 5: Production Validation (5 minutes)

### Validate All Services:

```cmd
./scripts/validate-deployment.sh https://api.vauntico.com production
```

### Manual Health Checks:

```cmd
curl https://api.vauntico.com/health
curl https://api.vauntico.com/api/status
```

## 🏃 Phase 6: Local Testing (Optional, 5 minutes)

### Start Local Services:

```cmd
# Start databases first
docker compose up -d postgres redis

# Wait 10 seconds
timeout /t 10

# Start backend services
docker compose up -d trust-score-backend vauntico-server

# Check status
docker compose ps

# Health checks
curl http://localhost:3001/health
curl http://localhost:3002/health
```

## 📊 Timeline Summary

| Phase                 | Duration        | Status               |
| --------------------- | --------------- | -------------------- |
| Docker CLI Install    | 2-3 min         | ⏳ In Progress (65%) |
| OCI Secrets Setup     | 5 min           | 🔴 Ready to Start    |
| Authentication Test   | 2 min           | ⏳ Waiting           |
| Production Deployment | 10 min          | ⏳ Waiting           |
| Validation            | 5 min           | ⏳ Waiting           |
| **Total Recovery**    | **~25 minutes** | **🚀 Starting Soon** |

## 🚨 Critical Path

**IMMEDIATE PRIORITY ORDER**:

1. ✅ Wait for Docker CLI installation (2-3 min)
2. 🔴 Add OCI secrets to GitHub (5 min) - **PRODUCTION DEPENDS ON THIS**
3. 🧪 Test authentication (2 min)
4. 🚀 Deploy to production (10 min)
5. ✅ Validate services (5 min)

## 🔧 Troubleshooting Commands

### If Docker CLI Fails:

```cmd
# Alternative download method
powershell -Command "Invoke-WebRequest -Uri 'https://download.docker.com/win/static/stable/x86_64/docker-29.1.4.zip' -OutFile 'docker-cli.zip'"
powershell -Command "Expand-Archive -Path 'docker-cli.zip' -DestinationPath 'C:\docker'"
```

### If OCI Authentication Fails:

```cmd
# Check workflow logs
gh workflow list
gh run list --workflow=mcp-oci-connector.yml
gh run view <run-id>
```

### If Services Don't Start:

```cmd
# Check Docker Compose configuration
docker compose config

# View service logs
docker compose logs -f
docker compose logs trust-score-backend
docker compose logs vauntico-server
```

## 📋 Quick Reference Commands

```cmd
# 1. Verify Docker (after install)
docker --version
docker run hello-world

# 2. Test OCI (after secrets)
gh workflow run mcp-oci-connector.yml --field oci_action=authenticate

# 3. Deploy to production
gh workflow run mcp-oci-connector.yml --field oci_action=build-push --field image_tag=v20260117-0140

# 4. Validate deployment
./scripts/validate-deployment.sh https://api.vauntico.com production

# 5. Start local services
docker compose up -d postgres redis
docker compose up -d trust-score-backend vauntico-server
```

## 🎯 Success Criteria

### Recovery Complete When:

- ✅ Docker CLI installed and working
- ✅ All 5 OCI secrets configured in GitHub
- ✅ OCI authentication successful
- ✅ Container images built and pushed to OCI
- ✅ Production endpoints responding (200 OK)
- ✅ Health checks passing

### Final Validation URLs:

- **API Health**: https://api.vauntico.com/health
- **API Status**: https://api.vauntico.com/api/status
- **Service Monitoring**: Available via your monitoring stack

---

## 🚀 Ready to Execute

**Current Time**: ~1:43 AM
**Estimated Recovery**: ~2:10 AM (25 minutes from now)
**Priority**: 🚨 CRITICAL - Production services down
**Next Action**: Wait for Docker CLI installation, then immediately add OCI secrets
