# 🔐 OCI Secrets Setup Guide

## 🚨 CRITICAL - Production Services Down

Your production deployment is blocked due to missing OCI secrets in GitHub. Follow this guide immediately after Docker CLI installation completes.

## Required OCI Secrets

You need to add **2 missing secrets** to your GitHub repository:

### 1. OCI_PRIVATE_KEY

- **Format**: Base64-encoded PEM file
- **How to get**: OCI Console → Identity → Users → Your User → API Keys
- **Steps**:
  1. Generate new API key in OCI Console if needed
  2. Download the private key PEM file
  3. Convert to Base64:
     ```cmd
     # On Windows (PowerShell)
     $content = Get-Content -Path "path/to/your/oci_api_key.pem" -Raw
     $base64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
     $base64 | Set-Clipboard
     ```
  4. Paste the Base64 string as the secret value

### 2. OCI_FINGERPRINT

- **Format**: MD5 fingerprint (e.g., "12:34:56:78:9a:bc:de:f0:12:34:56:78:9a:bc:de:f0")
- **How to get**: Same OCI Console page as API keys
- **Copy directly** from the OCI Console

## Step-by-Step Setup

### 1. Navigate to GitHub Secrets

1. Go to: https://github.com/Tygertbone/vauntico-server/settings/secrets/actions
2. Click "New repository secret"

### 2. Add OCI_PRIVATE_KEY

1. **Name**: `OCI_PRIVATE_KEY`
2. **Value**: Paste your Base64-encoded private key
3. **Description**: "OCI API private key for authentication"

### 3. Add OCI_FINGERPRINT

1. **Name**: `OCI_FINGERPRINT`
2. **Value**: Paste your fingerprint from OCI Console
3. **Description**: "OCI API key fingerprint for authentication"

### 4. Verify All Secrets Present

You should now have all 5 OCI secrets:

- ✅ `OCI_PRIVATE_KEY` (NEW)
- ✅ `OCI_FINGERPRINT` (NEW)
- ✅ `OCI_USER_OCID` (already present)
- ✅ `OCI_TENANCY_OCID` (already present)
- ✅ `OCI_REGION` (already present)

## Quick OCI API Key Generation (if needed)

### Generate New API Key in OCI Console

1. Sign in to OCI Console
2. Navigate: Identity → Users → Your User
3. Click "API Keys" → "Add API Key"
4. Select "Generate API Key Pair"
5. Download the private key PEM file
6. Copy the fingerprint shown
7. Save the configuration file (optional)

### Convert to Base64 (Windows)

```cmd
# Using PowerShell
$filePath = "C:\path\to\oci_api_key.pem"
$content = Get-Content -Path $filePath -Raw
$base64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
Write-Host "Base64 encoded private key:"
$base64

# Copy to clipboard
$base64 | Set-Clipboard
```

### Alternative: Direct PEM (if Base64 doesn't work)

Some workflows prefer the raw PEM content. Try this if Base64 fails:

```cmd
# Copy raw PEM content (with headers)
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...rest of key...
-----END PRIVATE KEY-----
```

## Test Your Setup

After adding secrets, test immediately:

```cmd
# Test OCI authentication
gh workflow run mcp-oci-connector.yml --field oci_action=authenticate

# Monitor the workflow
gh workflow view
```

Expected results:

- ✅ "OCI authentication successful"
- ✅ Shows your Object Storage namespace

## Troubleshooting

### Common Issues

1. **Base64 encoding errors**:
   - Ensure you include the entire PEM file (including BEGIN/END lines)
   - Use UTF-8 encoding when converting

2. **Fingerprint format**:
   - Must include colons: "12:34:56:...:f0"
   - Copy exactly from OCI Console (no extra spaces)

3. **Authentication failures**:
   - Verify the API key is active in OCI Console
   - Check that the user has proper permissions

### Debug Workflow

```cmd
# Check workflow logs
gh workflow list
gh run list --workflow=mcp-oci-connector.yml

# View specific run details
gh run view <run-id>
```

## Quick Commands

```cmd
# 1. Convert PEM to Base64 (PowerShell)
$cert = Get-Content "C:\path\to\oci_api_key.pem" -Raw
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($cert)) | Set-Clipboard

# 2. Test authentication
gh workflow run mcp-oci-connector.yml --field oci_action=authenticate

# 3. Deploy to production
gh workflow run mcp-oci-connector.yml --field oci_action=build-push --field image_tag=v20260117-0140
```

## Timeline

- **Secrets setup**: 5 minutes
- **Authentication test**: 2 minutes
- **Production deployment**: 10 minutes
- **Total recovery**: ~17 minutes (after Docker CLI)

## Next Steps

1. **Wait for Docker CLI installation** to complete (currently at 33%)
2. **Add the 2 missing OCI secrets** immediately
3. **Test authentication** with GitHub workflow
4. **Deploy to production** to restore services

---

**Status**: 🚨 CRITICAL - Production down due to missing secrets  
**Priority**: 🔴 URGENT - Add OCI secrets immediately after Docker CLI  
**Recovery**: ⚡ 17 minutes once secrets are configured
