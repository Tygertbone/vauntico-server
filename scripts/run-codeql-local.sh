#!/bin/bash

# Local CodeQL Analysis Script for Vauntico
# Usage: ./scripts/run-codeql-local.sh

set -e

echo "🔍 Starting local CodeQL analysis for Vauntico..."

# Check if CodeQL CLI is installed
if ! command -v codeql &> /dev/null; then
    echo "❌ CodeQL CLI not found. Installing..."
    npm install -g @github/codeql-cli
fi

# Ensure we're in the right directory
cd server-v2

# Clean previous results
echo "🧹 Cleaning previous analysis results..."
rm -rf codeql-db codeql-results.sarif

# Create CodeQL database
echo "📊 Creating CodeQL database..."
codeql database create \
    --language=javascript \
    --source-root=./src \
    --command="npm run build" \
    codeql-db

# Run security analysis
echo "🔬 Running security queries..."
codeql database analyze \
    --format=sarif-latest \
    --output=codeql-results.sarif \
    codeql-db

# Check if results exist
if [ -f "codeql-results.sarif" ]; then
    echo "✅ CodeQL analysis completed successfully!"
    echo "📄 Results saved to: server-v2/codeql-results.sarif"
    
    # Display summary
    echo ""
    echo "📋 Analysis Summary:"
    echo "=================="
    
    # Count results using jq if available
    if command -v jq &> /dev/null; then
        result_count=$(cat codeql-results.sarif | jq '.runs[0].results | length')
        echo "Total issues found: $result_count"
        
        # Show severity breakdown
        echo ""
        echo "🚨 Issues by Severity:"
        cat codeql-results.sarif | jq -r '.runs[0].results[] | "\(.level // "unknown"): \(.ruleId // "unknown")"' | sort | uniq -c
    else
        echo "Install jq for detailed summary or view the SARIF file directly"
    fi
    
    echo ""
    echo "💡 Next steps:"
    echo "1. Review the SARIF file: codeql-results.sarif"
    echo "2. Fix high and critical severity issues first"
    echo "3. Re-run analysis after fixes"
    echo "4. Upload results to GitHub Security tab if needed"
    
else
    echo "❌ CodeQL analysis failed!"
    exit 1
fi

echo ""
echo "🎯 Local CodeQL analysis complete!"
echo "📖 For more options, run: codeql --help"
