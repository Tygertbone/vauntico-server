#!/bin/bash

# GPG Signing Setup Script for Vauntico SDK Releases
# This script sets up GPG signing for automated releases

set -euo pipefail

# Configuration
GPG_KEY_NAME="${GPG_KEY_NAME:-Vauntico SDK Release}"
GPG_KEY_EMAIL="${GPG_KEY_EMAIL:-releases@vauntico.com}"
GPG_KEY_EXPIRY="${GPG_KEY_EXPIRY:-2y}"  # 2 years default
GPG_KEY_LENGTH="${GPG_KEY_LENGTH:-4096}"  # 4096-bit RSA

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v gpg &> /dev/null; then
        log_error "GPG is not installed. Please install GPG."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed. Please install Git."
        exit 1
    fi
    
    log_success "Dependencies check passed"
}

# Generate GPG key if not exists
generate_gpg_key() {
    log_info "Checking for existing GPG key..."
    
    # Check if key already exists
    if gpg --list-secret-keys --keyid-format LONG | grep -q "${GPG_KEY_EMAIL}"; then
        log_warning "GPG key already exists for ${GPG_KEY_EMAIL}"
        log_info "Using existing key for signing"
        return 0
    fi
    
    log_info "Generating new GPG key..."
    
    # Generate key non-interactively
    cat > gpg-key-config << EOF
    %echo Generating GPG key for Vauntico SDK releases
    Key-Type: RSA
    Key-Length: ${GPG_KEY_LENGTH}
    Subkey-Type: RSA
    Subkey-Length: ${GPG_KEY_LENGTH}
    Name: ${GPG_KEY_NAME}
    Email: ${GPG_KEY_EMAIL}
    Expire-Date: ${GPG_KEY_EXPIRY}
    %no-protection
    %commit
    %echo done
EOF
    
    gpg --batch --generate-key gpg-key-config
    
    # Clean up
    rm -f gpg-key-config
    
    log_success "GPG key generated successfully"
}

# Export public key
export_public_key() {
    log_info "Exporting public key..."
    
    KEY_ID=$(gpg --list-secret-keys --keyid-format LONG | grep "${GPG_KEY_EMAIL}" | awk '{print $1}')
    
    if [ -z "${KEY_ID}" ]; then
        log_error "Could not find GPG key ID"
        return 1
    fi
    
    # Export public key
    gpg --armor --export "${KEY_ID}" > vauntico-sdk-release-public.key
    
    log_success "Public key exported to vauntico-sdk-release-public.key"
    log_info "Key ID: ${KEY_ID}"
    
    # Display fingerprint
    FINGERPRINT=$(gpg --fingerprint "${KEY_ID}")
    log_info "Fingerprint: ${FINGERPRINT}"
}

# Setup Git signing
setup_git_signing() {
    log_info "Configuring Git for GPG signing..."
    
    KEY_ID=$(gpg --list-secret-keys --keyid-format LONG | grep "${GPG_KEY_EMAIL}" | awk '{print $1}')
    
    if [ -z "${KEY_ID}" ]; then
        log_error "Could not find GPG key ID for Git configuration"
        return 1
    fi
    
    # Configure Git to use the GPG key
    git config user.signingkey "${KEY_ID}"
    git config commit.gpgsign true
    git config tag.gpgsign true
    
    log_success "Git GPG signing configured"
}

# Create GitHub Actions secret file
create_github_secret() {
    log_info "Creating GitHub Actions secret file..."
    
    KEY_ID=$(gpg --list-secret-keys --keyid-format LONG | grep "${GPG_KEY_EMAIL}" | awk '{print $1}')
    
    if [ -z "${KEY_ID}" ]; then
        log_error "Could not find GPG key ID for secret creation"
        return 1
    fi
    
    # Export private key for GitHub Actions
    gpg --armor --export-secret-keys --export-options export-backup="${GPG_KEY_ID}" > private-key.asc
    
    log_info "Private key exported to private-key.asc"
    log_warning "Add this as GPG_PRIVATE_KEY secret to your GitHub repository"
    log_info "The passphrase should be added as GPG_PASSPHRASE secret"
    
    # Create instructions
    cat > gpg-setup-instructions.md << EOF
    # GitHub Actions Setup Instructions
    
    ## 1. Add Secrets to GitHub Repository
    
    Go to your GitHub repository settings > Secrets and variables > Actions and add:
    
    - \`GPG_PRIVATE_KEY\`: Contents of \`private-key.asc\`
    - \`GPG_PASSPHRASE\`: The passphrase you used (or generate a new one)
    
    ## 2. Update Workflow Files
    
    Ensure your GitHub Actions workflows include:
    
    \`\`\`yaml
    - name: Import GPG key
      uses: crazy-max/ghaction-import-gpg@v6
      with:
        gpg_private_key: \${{ secrets.GPG_PRIVATE_KEY }}
        passphrase: \${{ secrets.GPG_PASSPHRASE }}
        git_user_signingkey: true
        git_commit_gpgsign: true
    \`\`\`
    
    ## 3. Test the Setup
    
    Commit and push a test change to verify GPG signing works.
    
    ## Security Notes
    
    - Store the private key securely in GitHub Secrets
    - Never commit the private key to your repository
    - Use a strong, unique passphrase
    - Consider using GitHub's OIDC provider for enhanced security
    EOF
    
    log_success "GitHub setup instructions created in gpg-setup-instructions.md"
}

# Test GPG signing
test_gpg_signing() {
    log_info "Testing GPG signing..."
    
    # Create a test file
    echo "Test file for GPG signing" > test.txt
    
    # Sign the test file
    echo "${GPG_PASSPHRASE:-}" | gpg --batch --yes --passphrase-fd 0 --pinentry-mode loopback --sign test.txt
    
    # Verify the signature
    if gpg --verify test.txt.gpg test.txt; then
        log_success "GPG signing test passed"
    else
        log_error "GPG signing test failed"
        return 1
    fi
    
    # Clean up test files
    rm -f test.txt test.txt.gpg
}

# Main execution
main() {
    log_info "Starting GPG setup for Vauntico SDK releases..."
    
    check_dependencies
    
    # Check if we're in automated mode
    if [ "${1:-}" = "--automated" ]; then
        log_info "Running in automated mode (GitHub Actions)"
        
        # Import existing key from secret
        if [ -n "${GPG_PRIVATE_KEY}" ]; then
            echo "${GPG_PRIVATE_KEY}" | gpg --import --batch --passphrase "${GPG_PASSPHRASE:-}"
            setup_git_signing
            log_success "GPG key imported and configured"
        else
            log_error "GPG_PRIVATE_KEY not provided in automated mode"
            exit 1
        fi
    else
        log_info "Running in interactive mode"
        
        # Generate new key
        generate_gpg_key
        export_public_key
        setup_git_signing
        
        # Ask for testing
        read -p "Test GPG signing? (y/N): " -n 1 -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            test_gpg_signing
        fi
        
        # Create GitHub setup
        create_github_secret
        
        log_success "GPG setup completed!"
        log_info "Next steps:"
        log_info "1. Add GPG_PRIVATE_KEY secret to GitHub repository"
        log_info "2. Add GPG_PASSPHRASE secret to GitHub repository"
        log_info "3. Update your workflows to import the GPG key"
        log_info "4. Test with a sample commit and tag"
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --automated    Run in automated mode (for GitHub Actions)"
    echo "  --help         Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  GPG_KEY_NAME     Name for GPG key (default: Vauntico SDK Release)"
    echo "  GPG_KEY_EMAIL    Email for GPG key (default: releases@vauntico.com)"
    echo "  GPG_KEY_EXPIRY   Key expiration (default: 2y)"
    echo "  GPG_KEY_LENGTH    Key length in bits (default: 4096)"
    echo "  GPG_PRIVATE_KEY   Private key content (automated mode)"
    echo "  GPG_PASSPHRASE  Private key passphrase (automated mode)"
    echo ""
    echo "Examples:"
    echo "  # Interactive mode (generate new key)"
    echo "  $0"
    echo ""
    echo "  # Automated mode (import existing key)"
    echo "  GPG_PRIVATE_KEY=\"-----BEGIN PGP PRIVATE KEY BLOCK-----\""
    echo "  GPG_PASSPHRASE=\"your-passphrase\""
    echo "  $0 --automated"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_usage
        exit 0
        ;;
    --automated)
        main --automated
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
