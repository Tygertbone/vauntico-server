# 🐳 Docker Desktop Installation Recovery Guide

## Issue Analysis

You're experiencing an "empty package" error during Docker Desktop installation, which is blocking your deployment pipeline. Based on your project setup, you have:

- **Multi-service Docker Compose architecture** with PostgreSQL, Redis, multiple backend services, monitoring stack
- **OCI-based deployment pipeline** using GitHub Actions
- **Critical production services** currently down due to missing OCI secrets
- **Container-based deployment** requiring Docker functionality

## Immediate Solutions (Fastest Recovery)

### Option 1: Use Docker CLI Directly (Recommended for Deployment)

Since you're targeting OCI deployment, you don't actually need Docker Desktop locally. Use Docker CLI directly:

```bash
# Install Docker CLI without Desktop (Windows)
# Using Chocolatey
choco install docker-cli

# Or using scoop
scoop install docker

# Or download directly from Docker Hub
# https://download.docker.com/win/static/stable/x86_64/
```

**Benefits:**

- Faster installation (no GUI overhead)
- Command-line only (perfect for CI/CD)
- No "empty package" issues
- Immediate deployment capability

### Option 2: Use Podman as Docker Alternative

```bash
# Install Podman (Docker-compatible)
choco install podman

# Use Docker commands with Podman
podman-compose up -d  # Works with your docker-compose.yml
```

### Option 3: Windows Subsystem for Linux (WSL2) + Docker

```bash
# Install WSL2
wsl --install

# In WSL2 Ubuntu:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## Docker Desktop "Empty Package" Fix

If you still need Docker Desktop specifically:

### Method 1: Fresh Download

1. **Clear existing installation:**

   ```cmd
   # Uninstall completely
   wmic product where "name like '%Docker%'" call uninstall

   # Clean registry and folders
   rmdir /s "%APPDATA%\Docker"
   rmdir /s "%LOCALAPPDATA%\Docker"
   ```

2. **Download fresh installer:**

   ```cmd
   # Use PowerShell to download directly
   Invoke-WebRequest -Uri "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe" -OutFile "DockerDesktopInstaller.exe"
   ```

3. **Install with parameters:**
   ```cmd
   DockerDesktopInstaller.exe --quiet --accept-license --backend=wsl-2
   ```

### Method 2: Alternative Download Sources

- **Docker Hub Releases**: https://github.com/docker/docker-ce/releases
- **Chocolatey**: `choco install docker-desktop`
- **Microsoft Store**: Search "Docker Desktop"

## Deployment Recovery Plan

### Phase 1: Immediate (5-10 minutes)

1. **Install Docker CLI only** (skip Desktop)
2. **Test Docker functionality:**
   ```cmd
   docker --version
   docker compose version
   ```

### Phase 2: Validate OCI Setup (10-15 minutes)

1. **Configure missing OCI secrets** in GitHub repository:
   - `OCI_PRIVATE_KEY` (Base64-encoded)
   - `OCI_FINGERPRINT`
   - `OCI_USER_OCID` ✅ (present)
   - `OCI_TENANCY_OCID` ✅ (present)
   - `OCI_REGION` ✅ (present)

2. **Test OCI workflow:**
   ```bash
   gh workflow run mcp-oci-connector.yml --field oci_action=authenticate
   ```

### Phase 3: Deploy to OCI (15-20 minutes)

1. **Build and push containers:**

   ```bash
   gh workflow run mcp-oci-connector.yml --field oci_action=build-push --field image_tag=latest
   ```

2. **Validate deployment:**
   ```bash
   ./scripts/validate-deployment.sh https://api.vauntico.com production
   ```

## Alternative Deployment Strategies

### Option A: Cloud-Native Build

Skip local Docker entirely and use cloud builds:

```yaml
# In your GitHub Actions, use cloud builders
- uses: docker/build-push-action@v4
  with:
    context: .
    push: true
    tags: your-registry/vauntico-server:latest
```

### Option B: Development with Docker CLI

For local development using your `docker-compose.yml`:

```cmd
# Start services locally
docker compose up -d postgres redis

# Start individual services
docker compose up -d trust-score-backend
docker compose up -d vauntico-server

# Check logs
docker compose logs -f
```

## Production Deployment Commands

### Local Testing (with Docker CLI):

```cmd
# Build all services
docker compose build

# Test locally
docker compose up -d

# Run health checks
docker compose ps
curl http://localhost:3001/health  # trust-score-backend
curl http://localhost:3002/health  # vauntico-server
```

### Production Deployment (OCI):

```bash
# Trigger deployment workflow
gh workflow run mcp-oci-connector.yml \
  --field oci_action=build-push \
  --field image_tag=v$(date +%Y%m%d-%H%M%S)

# Monitor deployment
gh workflow view

# Validate deployment
./scripts/validate-deployment.sh https://api.vauntico.com production
```

## Monitoring Setup (Post-Deployment)

Your docker-compose.yml includes comprehensive monitoring:

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3004 (admin/admin123)
- **Uptime Kuma**: http://localhost:3003
- **Node Exporter**: http://localhost:9100/metrics

## Quick Recovery Commands

```cmd
# 1. Install Docker CLI (fastest)
choco install docker-cli

# 2. Test Docker
docker --version
docker run hello-world

# 3. Start your services locally
docker compose up -d postgres redis
docker compose up -d trust-score-backend vauntico-server

# 4. Deploy to production
gh workflow run mcp-oci-connector.yml --field oci_action=build-push
```

## Next Steps

1. **Immediate**: Install Docker CLI only (5 minutes)
2. **Critical**: Add missing OCI secrets to GitHub (10 minutes)
3. **Urgent**: Trigger OCI deployment workflow (5 minutes)
4. **Monitor**: Validate all services are operational (10 minutes)

**Total Recovery Time**: ~30 minutes

---

**Status**: 🔧 Ready for immediate recovery  
**Priority**: 🚨 Critical - Production services down  
**Impact**: 💰 High - Revenue and user experience affected  
**Recovery**: ⚡ Fast - Use Docker CLI + OCI workflow
