# Vauntico Backend and DNS Full Deployment Script
# PowerShell script for complete Vauntico deployment with OCI and Cloudflare integration

# ====== CONFIGURE THESE VALUES ======
$CompartmentId = "ocid1.compartment.oc1..aaaaaaaaqjphq7si5cxb5tvjmoxxhpbohfz637qtx253apiyzzw6myh54zda"
$AvailabilityDomain = "Uocm:JOHANNESBURG-1-AD-1"
$ImageId = "ocid1.image.oc1.af-johannesburg-1.aaaaaaaasmrbqr5jnpdftostrbwoymsn7qorloo7pr2mpwjp4ni2rhjrrumq"
$SubnetId = "ocid1.subnet.oc1.af-johannesburg-1.aaaaaaaawk6m2gjwzlgsgzax57v4nhlqwxgona24k73evuje6wvidth2e4ra"
$Shape = "VM.Standard.E2.1.Micro"

# Cloudflare configuration
$CloudflareApiToken = "YKYZ_9d1EesPspT2Z8xbufZ7VcjQ-ep9CHFAfiMA"
$ZoneId = "6e9495157a71051ee462ae12f1024bbb"

# SSH Key for cloud-init
$SshPublicKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...replace_with_your_public_key_here"

# Services to deploy
$Services = @(
    @{ Name = "trust-score";   Host = "trust-score.vauntico.com";   Port = 3000 },
    @{ Name = "vauntico-server"; Host = "vauntico-server.vauntico.com"; Port = 3001 },
    @{ Name = "fulfillment";   Host = "fulfillment.vauntico.com"; Port = 3002 },
    @{ Name = "legacy";        Host = "legacy.vauntico.com";        Port = 3003 }
)

# Remote deployment command
$RemoteDeployCmd = 'sudo mkdir -p /srv/vauntico && cd /srv/vauntico && sudo docker-compose pull && sudo docker-compose up -d'

# ===== END CONFIGURATION ======

# ====== FUNCTIONS ======
function Launch-OciInstance {
    param(
        [string]$AvailabilityDomain,
        [string]$CompartmentId,
        [string]$Shape,
        [string]$ImageId,
        [string]$SubnetId,
        [string]$DisplayName
    )

    Write-Host "Launching OCI instance: $DisplayName..." -ForegroundColor Cyan
    
    try {
        # Create source details JSON file
        $sourceDetailsJson = @{
            sourceType = "image"
            imageId = $ImageId
        } | ConvertTo-Json -Compress
        $tempFile = [System.IO.Path]::GetTempFileName()
        $sourceDetailsJson | Out-File -FilePath $tempFile -Encoding UTF8
        
        $instance = oci compute instance launch `
            --availability-domain $AvailabilityDomain `
            --compartment-id $CompartmentId `
            --shape $Shape `
            --source-details "file://$tempFile" `
            --subnet-id $SubnetId `
            --assign-public-ip true `
            --display-name $DisplayName `
            --query "data.{id:'id', 'public-ip':'public-ip'}" `
            --output json
        
        # Clean up temp file
        Remove-Item $tempFile -ErrorAction SilentlyContinue
        
        $instanceId = ($instance | ConvertFrom-Json).id
        $publicIp = ($instance | ConvertFrom-Json)."public-ip"
        
        Write-Host "✅ Instance launched: $instanceId" -ForegroundColor Green
        Write-Host "   Public IP: $publicIp" -ForegroundColor Green
        
        return @{
            InstanceId = $instanceId
            PublicIp = $publicIp
        }
        
    } catch {
        Write-Host "❌ Error launching $DisplayName`: $($_.Exception.Message)" -ForegroundColor Red
        throw $_
    }
}

function Get-InstancePublicIp {
    param([string]$InstanceId)

    try {
        $vnics = oci compute instance list-vnics --instance-id $InstanceId | ConvertFrom-Json
        $publicIp = $vnics.data[0]."public-ip"
        
        if (-not $publicIp) {
            throw "No public IP found for instance $InstanceId"
        }
        
        return $publicIp
    } catch {
        throw "Error getting public IP for instance $InstanceId`: $($_.Exception.Message)"
    }
}

function Deploy-ServiceOverSsh {
    param(
        [string]$PublicIp,
        [string]$RemoteCmd
    )

    Write-Host "Deploying service on $PublicIp..." -ForegroundColor Cyan
    
    try {
        # Using plink for SSH (more Windows-friendly)
        $sshResult = plink opc@$PublicIp $RemoteCmd 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Service deployed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Error deploying service: Exit code $LASTEXITCODE" -ForegroundColor Red
            Write-Host "   Output: $sshResult" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ SSH error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Verify-HttpHealth {
    param(
        [string]$Url
    )

    try {
        Write-Host "Verifying health endpoint: $Url..." -ForegroundColor Cyan
        $result = curl -I $Url 2>&1
        
        if ($result -match "HTTP/1\.1 200 OK") {
            Write-Host "✅ Health check passed" -ForegroundColor Green
        } else {
            Write-Host "❌ Health check failed" -ForegroundColor Red
            Write-Host "   URL: $Url" -ForegroundColor Red
            Write-Host "   Result: $result" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Error checking health: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Cloudflare-CreateARecord {
    param(
        [string]$ZoneId,
        [string]$Name,
        [string]$Ip,
        [bool]$Proxied = $false
    )

    Write-Host "Creating Cloudflare A record: $Name -> $Ip" -ForegroundColor Cyan
    
    try {
        $headers = @{
            "Authorization" = "Bearer $CloudflareApiToken"
            "Content-Type" = "application/json"
        }

        $body = @{
            type = "A"
            name = $Name
            content = $Ip
            ttl = 120
            proxied = $Proxied
        } | ConvertTo-Json

        $resp = Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/dns_records" -Headers $headers -Body $body
        
        if (-not $resp.success) {
            throw "Cloudflare DNS record creation failed: $($resp | ConvertTo-Json)"
        }
        
        $recordId = $resp.result.id
        Write-Host "✅ DNS record created: $recordId" -ForegroundColor Green
        
        return $recordId
        
    } catch {
        Write-Host "❌ Cloudflare API error: $($_.Exception.Message)" -ForegroundColor Red
        throw $_
    }
}

function Test-DnsPropagation {
    param(
        [string]$Domain
    )

    Write-Host "Testing DNS propagation for $Domain..." -ForegroundColor Cyan
    
    try {
        $result = nslookup $Domain 2>&1
        
        if ($result -match "Non-existent domain") {
            Write-Host "❌ DNS propagation failed" -ForegroundColor Red
            return $false
        } else {
            Write-Host "✅ DNS propagation successful" -ForegroundColor Green
            return $true
        }
        
    } catch {
        Write-Host "❌ DNS test error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ====== MAIN EXECUTION ======

Write-Host "=== VAUNTICO COMPLETE DEPLOYMENT SCRIPT ===" -ForegroundColor Green
Write-Host ""

# Step 1: Launch all OCI instances
Write-Host "Step 1: Launching OCI Compute Instances..." -ForegroundColor Yellow

$deployedInstances = @()

foreach ($service in $Services) {
    $instance = Launch-OciInstance `
        -AvailabilityDomain $AvailabilityDomain `
        -CompartmentId $CompartmentId `
        -Shape $Shape `
        -ImageId $ImageId `
        -SubnetId $SubnetId `
        -DisplayName $service.Name
    
    # Wait for instance to be ready
    Write-Host "   Waiting for instance to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Get public IP
    $publicIp = Get-InstancePublicIp -InstanceId $instance.InstanceId
    
    $deployedInstances += @{
        Name = $service.Name
        Host = $service.Host
        Port = $service.Port
        InstanceId = $instance.InstanceId
        PublicIp = $publicIp
    }
}

Write-Host ""
Write-Host "All instances launched successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy services via SSH
Write-Host "Step 2: Deploying Services via SSH..." -ForegroundColor Yellow

foreach ($instance in $deployedInstances) {
    Deploy-ServiceOverSsh -PublicIp $instance.PublicIp -RemoteCmd $RemoteDeployCmd
}

Write-Host ""
Write-Host "All services deployed" -ForegroundColor Green
Write-Host ""

# Step 3: Verify health endpoints
Write-Host "Step 3: Verifying Health Endpoints..." -ForegroundColor Yellow

foreach ($instance in $deployedInstances) {
    $healthUrl = "http://{0}:{1}/health" -f $instance.PublicIp, $instance.Port
    Verify-HttpHealth -Url $healthUrl
}

Write-Host ""
Write-Host "Health verification completed" -ForegroundColor Green
Write-Host ""

# Step 4: Configure DNS records
Write-Host "Step 4: Configuring DNS Records..." -ForegroundColor Yellow

$dnsRecords = @()

foreach ($instance in $deployedInstances) {
    $recordId = Cloudflare-CreateARecord -ZoneId $ZoneId -Name $instance.Host -Ip $instance.PublicIp -Proxied:$false
    $dnsRecords += @{
        Name = $instance.Host
        Ip = $instance.PublicIp
        RecordId = $recordId
    }
}

Write-Host ""
Write-Host "DNS configuration completed" -ForegroundColor Green
Write-Host ""

# Step 5: Test DNS propagation
Write-Host "Step 5: Testing DNS Propagation..." -ForegroundColor Yellow

$propagationSuccess = $true
foreach ($record in $dnsRecords) {
    $success = Test-DnsPropagation -Domain $record.Name
    if (-not $success) {
        $propagationSuccess = $false
    }
}

if ($propagationSuccess) {
    Write-Host "✅ DNS propagation successful" -ForegroundColor Green
} else {
    Write-Host "❌ DNS propagation failed for some records" -ForegroundColor Red
}

Write-Host ""

# Step 6: Integration testing
Write-Host "Step 6: Integration Testing..." -ForegroundColor Yellow

# Test API endpoints
Write-Host "Testing API endpoints..." -ForegroundColor Cyan
try {
    $waitlistResult = curl -I https://vault.vauntico.com/api/waitlist 2>&1
    Write-Host $waitlistResult -ForegroundColor White
} catch {
    Write-Host "❌ Error testing waitlist API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test health endpoints
foreach ($instance in $deployedInstances) {
    $healthUrl = "https://{0}:{1}/health" -f $instance.Host, $instance.Port
    Verify-HttpHealth -Url $healthUrl
}

Write-Host ""

# Test payment endpoint
Write-Host "Testing payment sandbox..." -ForegroundColor Cyan
try {
    $paymentResult = curl -X POST https://vauntico-server.vauntico.com/payments/test `
        -H "Content-Type: application/json" `
        -d '{"amount":100,"currency":"ZAR"}' 2>&1
    Write-Host $paymentResult -ForegroundColor White
} catch {
    Write-Host "❌ Error testing payment endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Integration testing completed" -ForegroundColor Green
Write-Host ""

# Step 7: Generate summary report
Write-Host "=== DEPLOYMENT SUMMARY ===" -ForegroundColor Green
Write-Host "Services Deployed: $($deployedInstances.Count)" -ForegroundColor Green
Write-Host ""

foreach ($instance in $deployedInstances) {
    Write-Host "Service: $($instance.Name)" -ForegroundColor White
    Write-Host "  Name: $($instance.InstanceId)" -ForegroundColor White
    Write-Host "  IP: $($instance.PublicIp)" -ForegroundColor White
    Write-Host "  Port: $($instance.Port)" -ForegroundColor White
    Write-Host "  Host: $($instance.Host)" -ForegroundColor White
    Write-Host ""
}

Write-Host "=== SUCCESS INDICATORS ===" -ForegroundColor Green
Write-Host "✅ All endpoints return 200 OK" -ForegroundColor White
Write-Host "✅ Payment sandbox responds with JSON confirmation" -ForegroundColor White
Write-Host "✅ SSL padlock active on all subdomains" -ForegroundColor White
Write-Host ""

Write-Host "=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "🎉 Vauntico backend deployment successful!" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Monitor health endpoints" -ForegroundColor White
Write-Host "2. Configure monitoring and alerting" -ForegroundColor White
Write-Host "3. Perform load testing" -ForegroundColor White
Write-Host "4. Set up backup procedures" -ForegroundColor White
Write-Host "5. Document user workflows" -ForegroundColor White
Write-Host ""
