#!/bin/bash

# DNS Verification Script for vauntico.com
echo "=== DNS Verification for vauntico.com ==="

# Check if dig is available, otherwise use nslookup
if command -v dig &> /dev/null; then
    echo "Using dig for DNS queries..."
    
    echo "Checking CNAME for vauntico.com:"
    dig vauntico.com CNAME +short
    
    echo "Checking CNAME for www.vauntico.com:"
    dig www.vauntico.com CNAME +short
    
    echo "Checking A records for vauntico.com:"
    dig vauntico.com A +short
    
    echo "Checking A records for www.vauntico.com:"
    dig www.vauntico.com A +short
    
else
    echo "Using nslookup for DNS queries..."
    
    echo "Checking vauntico.com:"
    nslookup vauntico.com
    
    echo "Checking www.vauntico.com:"
    nslookup www.vauntico.com
fi

echo ""
echo "=== Expected Configuration ==="
echo "CNAME vauntico.com → cname.vercel-dns.com"
echo "CNAME www.vauntico.com → cname.vercel-dns.com"
echo ""
echo "=== Cloudflare CLI Commands (if needed) ==="
echo "# To add CNAME records if missing:"
echo "cfcli dns add vauntico.com CNAME cname.vercel-dns.com"
echo "cfcli dns add www.vauntico.com CNAME cname.vercel-dns.com"
echo ""
echo "# To list current DNS records:"
echo "cfcli dns list vauntico.com"
