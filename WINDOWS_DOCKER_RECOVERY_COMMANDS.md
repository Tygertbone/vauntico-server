# 🪟 Windows Docker Recovery Commands

## Current Status: Installing Docker CLI (15% complete)

The installation is running in the background. While it downloads, here are the immediate next steps:

## Step 1: Verify Docker CLI Installation (after download completes)

```cmd
docker --version
```

Expected output:

```
Docker version 29.1.4, build ...
```

## Step 2: Test Docker Functionality

```cmd
docker run --rm hello-world
```

## Step 3: Start Your Services Locally

```cmd
# Start PostgreSQL and Redis first
docker compose up -d postgres redis

# Wait 10 seconds for databases to initialize
timeout /t 10

# Start your backend services
docker compose up -d trust-score-backend vauntico-server

# Check service status
docker compose ps
```

## Step 4: Add Missing OCI Secrets to GitHub

**CRITICAL** - Your production is down due to missing secrets:

1. **Go to**: GitHub Repository → Settings → Secrets and variables → Actions
2. **Add these secrets**:
   - `OCI_PRIVATE_KEY` (Base64-encoded OCI API key PEM file)
   - `OCI_FINGERPRINT` (OCI API key fingerprint)

## Step 5: Deploy to Production

```cmd
# Test OCI authentication first
gh workflow run mcp-oci-connector.yml --field oci_action=authenticate

# Build and deploy to OCI
gh workflow run mcp-oci-connector.yml --field oci_action=build-push --field image_tag=v20260117-0140

# Monitor deployment
gh workflow view
```

## Step 6: Validate Production Deployment

```cmd
./scripts/validate-deployment.sh https://api.vauntico.com production
```

## Alternative: Direct Docker CLI Download (if Chocolatey fails)

If the Chocolatey installation doesn't complete, download directly:

```cmd
# Download Docker CLI directly
powershell -Command "Invoke-WebRequest -Uri 'https://download.docker.com/win/static/stable/x86_64/docker-29.1.4.zip' -OutFile 'docker-cli.zip'"

# Extract and add to PATH
powershell -Command "Expand-Archive -Path 'docker-cli.zip' -DestinationPath 'C:\docker'"
powershell -Command "[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';C:\docker', 'User')"
```

## Quick Verification Commands

```cmd
# Check Docker is working
docker --version
docker run hello-world

# Check your services
docker compose config
docker compose ps

# Health checks
curl http://localhost:3001/health  # trust-score-backend
curl http://localhost:3002/health  # vauntico-server
```

## Timeline

- **Docker CLI install**: 2-3 more minutes (currently downloading)
- **Local testing**: 2 minutes
- **OCI secrets setup**: 5 minutes
- **Production deployment**: 10 minutes
- **Total recovery**: ~20 minutes

## Current Status

✅ Docker CLI downloading (15% complete)  
⏳ Waiting for installation to complete  
🎯 Ready for next steps once installed

---

**Priority**: 🚨 CRITICAL - Production services down  
**Next Action**: Wait for Docker CLI installation, then add OCI secrets  
**Recovery Time**: ~20 minutes from now
