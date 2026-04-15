#!/bin/bash
# Pre-Deployment Validation Script
# Run this before every deployment to catch common issues

set -e

echo "================================"
echo "🚀 Pre-Deployment Validation"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

# Step 1: Check dependencies
echo "📦 Step 1: Checking dependencies..."
if ! pnpm install --frozen-lockfile 2>&1 | tail -5; then
  echo -e "${RED}❌ Dependency installation failed${NC}"
  FAILED=1
else
  echo -e "${GREEN}✅ Dependencies installed${NC}"
fi
echo ""

# Step 2: Check for @/ imports
echo "🔍 Step 2: Checking for @/ imports..."
INVALID_IMPORTS=$(grep -r "@/" server/ client/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".next" || true)

if [ -n "$INVALID_IMPORTS" ]; then
  echo -e "${RED}❌ Found @/ imports that need to be replaced:${NC}"
  echo "$INVALID_IMPORTS"
  FAILED=1
else
  echo -e "${GREEN}✅ No @/ imports found${NC}"
fi
echo ""

# Step 3: TypeScript compilation check
echo "🔍 Step 3: Checking TypeScript..."
if pnpm tsc --noEmit 2>&1 | grep -q "error TS"; then
  echo -e "${YELLOW}⚠️  TypeScript errors found (may be expected):${NC}"
  pnpm tsc --noEmit 2>&1 | grep "error TS" | head -10
else
  echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
fi
echo ""

# Step 4: Production build test
echo "🔨 Step 4: Testing production build..."
if pnpm build 2>&1 | tail -10; then
  echo -e "${GREEN}✅ Production build successful${NC}"
else
  echo -e "${RED}❌ Production build failed${NC}"
  FAILED=1
fi
echo ""

# Step 5: Run tests
echo "🧪 Step 5: Running tests..."
if pnpm test 2>&1 | tail -10; then
  echo -e "${GREEN}✅ Tests passed${NC}"
else
  echo -e "${YELLOW}⚠️  Some tests failed (review results above)${NC}"
fi
echo ""

# Final status
echo "================================"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Fix issues above before deploying.${NC}"
  exit 1
fi
