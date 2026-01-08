# Vauntico Backend Deployment Script
# PowerShell script for deploying Vauntico backend services to OCI

# Variables - Replace with your actual OCIDs
$compartmentId = "ocid1.compartment.oc1..aaaaaaaaqjphq7si5cxb5tvjmoxxhpbohfz637qtx253apiyzzw6myh54zda"
$availabilityDomain = "Uocm:JOHANNESBURG-1-AD-1"
$imageId = "ocid1.image.oc1.af-johannesburg-1.aaaaaaaasmrbqr5jnpdftostrbwoymsn7qorloo7pr2mpwjp4ni2rhjrrumq"
$subnetId = "ocid1.subnet.oc1.af-johannesburg-1.aaaaaaaawk6m2gjwzlgsgzax57v4nhlqwxgona24k73evuje6wvidth2e4ra"
$shape = "VM.Standard.E2.1.Micro"

# Services to deploy
$services = @(
    @{
        Name = "vauntico-trust-score-vm"
        Port = 3000
        Service = "trust-score"
    },
    @{
        Name = "vauntico-server-vm"
        Port = 3001
        Service = "vauntico-server"
    },
    @{
        Name = "vauntico-fulfillment-vm"
        Port = 3002
        Service = "fulfillment"
    },
    @{
        Name = "vauntico-legacy-vm"
        Port = 3003
        Service = "legacy"
    }
)

Write-Host "=== VAUNTICO BACKEND DEPLOYMENT SCRIPT ===" -ForegroundColor Green
Write-Host ""

# Step 1: Configure OCI CLI
Write-Host "Step 1: Configuring OCI CLI..." -ForegroundColor Yellow
try {
    oci setup config --config-file "$env:USERPROFILE\.oci\config" --auth security_token
    Write-Host "OCI CLI configuration completed" -ForegroundColor Green
} catch {
    Write-Host "Error configuring OCI CLI: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Launch Compute Instances
Write-Host "Step 2: Launching Compute Instances..." -ForegroundColor Yellow

$deployedInstances = @()

foreach ($service in $services) {
    Write-Host "Launching $($service.Name)..." -ForegroundColor Cyan
    
    try {
        $instance = oci compute instance launch `
            --availability-domain $availabilityDomain `
            --compartment-id $compartmentId `
            --shape $shape `
            --image-id $imageId `
            --subnet-id $subnetId `
            --assign-public-ip true `
            --display-name $service.Name `
            --query "data.{id:'id', 'public-ip':'public-ip'}" `
            --output json
        
        $instanceId = ($instance | ConvertFrom-Json).id
        $publicIp = ($instance | ConvertFrom-Json)."public-ip"
        
        Write-Host "✅ Instance launched: $instanceId" -ForegroundColor Green
        Write-Host "   Public IP: $publicIp" -ForegroundColor Green
        
        $deployedInstances += @{
            Name = $service.Name
            Id = $instanceId
            PublicIp = $publicIp
            Port = $service.Port
            Service = $service.Service
        }
        
        # Wait for instance to be ready
        Write-Host "   Waiting for instance to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
    } catch {
        Write-Host "❌ Error launching $($service.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Instance launch completed" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy Services via SSH
Write-Host "Step 3: Deploying Services via SSH..." -ForegroundColor Yellow

foreach ($instance in $deployedInstances) {
    Write-Host "Deploying $($instance.Service) on $($instance.PublicIp)..." -ForegroundColor Cyan
    
    try {
        $sshCommand = "cd /srv/vauntico && docker-compose up -d"
        
        # Using plink for SSH (more Windows-friendly)
        $sshResult = plink opc@$($instance.PublicIp) $sshCommand 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $($instance.Service) deployed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Error deploying $($instance.Service): Exit code $LASTEXITCODE" -ForegroundColor Red
            Write-Host "   Output: $sshResult" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ SSH error for $($instance.Service): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Step 4: Verify Health Endpoints
Write-Host "Step 4: Verifying Health Endpoints..." -ForegroundColor Yellow

foreach ($instance in $deployedInstances) {
    Write-Host "Testing $($instance.Service) health endpoint..." -ForegroundColor Cyan
    
    try {
        $healthUrl = "http://$($instance.PublicIp):$($instance.Port)/health"
        $healthResult = curl -I $healthUrl 2>&1
        
        if ($healthResult -match "HTTP/1.1 200 OK") {
            Write-Host "✅ $($instance.Service) health check passed" -ForegroundColor Green
        } else {
            Write-Host "❌ $($instance.Service) health check failed" -ForegroundColor Red
            Write-Host "   URL: $healthUrl" -ForegroundColor Red
            Write-Host "   Result: $healthResult" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Error checking $($instance.Service) health: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Step 5: Generate DNS Configuration
Write-Host "Step 5: Generating DNS Configuration..." -ForegroundColor Yellow

$dnsCommands = @()
foreach ($instance in $deployedInstances) {
    $subdomain = "$($instance.Service).vauntico.com"
    $dnsCommand = "cfcli dns add A $subdomain vault $($instance.PublicIp)"
    $dnsCommands += $dnsCommand
    Write-Host "DNS Record: $subdomain -> $($instance.PublicIp)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== DNS CONFIGURATION COMMANDS ===" -ForegroundColor Green
foreach ($cmd in $dnsCommands) {
    Write-Host $cmd -ForegroundColor White
}
Write-Host ""

# Step 6: Generate Integration Test Commands
Write-Host "Step 6: Generating Integration Test Commands..." -ForegroundColor Yellow

Write-Host "=== INTEGRATION TEST COMMANDS ===" -ForegroundColor Green
Write-Host "# Test API endpoints" -ForegroundColor White
Write-Host 'curl -I https://vault.vauntico.com/api/waitlist' -ForegroundColor White
Write-Host 'curl -I https://trust-score.vauntico.com/health' -ForegroundColor White
Write-Host 'curl -I https://vauntico-server.vauntico.com/api/waitlist' -ForegroundColor White
Write-Host ""

Write-Host "# Test payment sandbox" -ForegroundColor White
Write-Host 'curl -X POST https://vauntico-server.vauntico.com/payments/test -H "Content-Type: application/json" -d "{\"amount\":100,\"currency\":\"ZAR\"}"' -ForegroundColor White
Write-Host ""

Write-Host "# Success indicators:" -ForegroundColor White
Write-Host "# - All endpoints return 200 OK" -ForegroundColor White
Write-Host "# - Payment sandbox responds with JSON confirmation" -ForegroundColor White
Write-Host "# - SSL padlock active on all subdomains" -ForegroundColor White
Write-Host ""

# Step 7: Summary Report
Write-Host "=== DEPLOYMENT SUMMARY ===" -ForegroundColor Green
Write-Host "Services Deployed: $($deployedInstances.Count)" -ForegroundColor Green
Write-Host ""

foreach ($instance in $deployedInstances) {
    Write-Host "Service: $($instance.Service)" -ForegroundColor White
    Write-Host "  Name: $($instance.Name)" -ForegroundColor White
    Write-Host "  IP: $($instance.PublicIp)" -ForegroundColor White
    Write-Host "  Port: $($instance.Port)" -ForegroundColor White
    Write-Host ""
}

Write-Host "=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run DNS configuration commands above" -ForegroundColor White
Write-Host "2. Wait for DNS propagation" -ForegroundColor White
Write-Host "3. Execute integration test commands" -ForegroundColor White
Write-Host "4. Verify SSL certificate validation" -ForegroundColor White
Write-Host ""
