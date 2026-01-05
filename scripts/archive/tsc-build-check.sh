#!/bin/bash
# TypeScript Build Check Script for Unix Contributors
# Usage: ./scripts/tsc-build-check.sh

echo "🔍 Running TypeScript sanity check..."

# Run TypeScript type check
npm run tsc:check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript check failed. Fix errors before deploying."
    echo "Please check TypeScript errors above and resolve them before proceeding with deployment."
    exit 1
fi

echo "✅ TypeScript check passed!"
echo "🏗️  Running build..."

# Run build
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Check build errors above."
    exit 1
fi

echo "✅ Build completed successfully!"
echo "🚀 Ready for deployment!"
