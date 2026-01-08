#!/bin/bash

# Cloudflare DNS Setup Script for Vauntico Trust-Score Backend
# Replace the placeholder values with your actual Cloudflare credentials

ZONE_ID="6e9495157a71051ee462ae12f1024bbb"
API_TOKEN="YKYZ_9d1EesPspT2Z8xbufZ7VcjQ-ep9CHFAfiMA"
DOMAIN="trust-score.vauntico.com"
IP_ADDRESS="84.8.135.161"

echo "Creating DNS A record for ${DOMAIN} pointing to ${IP_ADDRESS}..."

# Create the DNS record
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"A\",
    \"name\": \"${DOMAIN}\",
    \"content\": \"${IP_ADDRESS}\",
    \"ttl\": 1,
    \"proxied\": true
  }"

echo ""
echo "DNS record creation initiated!"
echo ""
echo "Next steps:"
echo "1. Wait 2-5 minutes for DNS propagation"
echo "2. Test with: nslookup ${DOMAIN}"
echo "3. Verify HTTPS: curl -I https://${DOMAIN}"
echo ""
echo "Backend deployment:"
echo "oci compute instance ssh --instance-id ocid1.instance.oc1.af-johannesburg-1.anvg4ljr4eq3kmqc7xrszmhs2geuocplk74cxm3sozcjr7otloapshomte3q"
