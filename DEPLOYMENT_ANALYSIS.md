# Deployment Failure Analysis & Prevention Guide

## Executive Summary

The Pikme Programmatic SEO Website project experienced repeated deployment failures due to **missing dependencies** and **invalid import path aliases**. This document provides a comprehensive analysis of root causes and actionable prevention strategies.

---

## Root Cause Analysis

### 1. **Missing Dependencies (Primary Cause)**

**Error:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'nodemailer'`

**Why It Happened:**
- The `email-delivery-service.ts` file imported `nodemailer` but the package was never installed in `package.json`
- The dev server runs with hot-reload and caches dependencies, so the missing package wasn't caught during development
- Only during production build did the bundler fail to resolve the missing module

**Impact:** 🔴 **Critical** - Blocks entire application startup

---

### 2. **Invalid Import Path Aliases (Secondary Cause)**

**Error:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/server'`

**Why It Happened:**
- Multiple service files used `@/server` and `@/drizzle` import aliases
- These aliases are defined in `tsconfig.json` for TypeScript compilation but don't work in the production build
- The production build uses Node.js ES modules which don't understand TypeScript path aliases
- Relative paths (`../db`, `../../drizzle/schema`) work correctly in both dev and production

**Impact:** 🔴 **Critical** - Blocks application startup

---

### 3. **Type Mismatches in Schema (Tertiary Cause)**

**Error:** `Property 'exportHistoryId' does not exist on type 'DeliveryRecord'`

**Why It Happened:**
- The Drizzle ORM schema definitions referenced tables that don't exist in the database
- Type definitions expected different field names than what was actually in use
- Service code tried to insert into non-existent tables

**Impact:** 🟡 **Medium** - Doesn't block startup but causes runtime errors when features are used

---

## Prevention Strategies

### Strategy 1: Pre-Deployment Validation Checklist

Create a `DEPLOYMENT_CHECKLIST.md` and follow it before every deployment:

```markdown
## Pre-Deployment Checklist

- [ ] Run `pnpm install` to verify all dependencies are installed
- [ ] Run `pnpm build` to test production build locally
- [ ] Check `package.json` for all imported packages
- [ ] Search codebase for `@/` imports and replace with relative paths
- [ ] Run `pnpm tsc --noEmit` to check for TypeScript errors
- [ ] Run `pnpm test` to ensure all tests pass
- [ ] Verify database schema matches service code expectations
- [ ] Check that all imported modules exist in node_modules/
```

### Strategy 2: Dependency Management

**Best Practice:** Maintain a dependency audit process

```bash
# Before committing new code:
pnpm audit
pnpm list --depth=0

# When adding new packages:
pnpm add <package>
pnpm install  # Ensure lock file is updated
git add pnpm-lock.yaml  # Commit lock file
```

**Action Items:**
1. ✅ Install all packages used in code: `pnpm add nodemailer uuid node-cron`
2. ✅ Commit `pnpm-lock.yaml` to version control
3. ✅ Document all external dependencies in `README.md`

### Strategy 3: Import Path Standardization

**Rule:** Use relative paths for all internal imports

**❌ WRONG:**
```typescript
import { getDb } from "@/server/db";
import { scheduledExports } from "@/drizzle/schema";
```

**✅ CORRECT:**
```typescript
import { getDb } from "../db";
import { scheduledExports } from "../../drizzle/schema";
```

**Implementation:**
1. Search entire codebase: `grep -r "@/" server/ client/`
2. Replace all `@/server/` with relative paths
3. Replace all `@/drizzle/` with relative paths
4. Add ESLint rule to prevent `@/` imports in production code

### Strategy 4: Type Safety & Schema Validation

**Best Practice:** Validate schema definitions match actual database

```typescript
// In drizzle/schema.ts - add validation
const validateSchema = () => {
  // Ensure all referenced tables exist
  // Ensure all field types match expected values
  // Ensure foreign keys reference existing tables
};

// Run before migrations
export const schema = {
  // ... table definitions
};

// Validate on startup
if (process.env.NODE_ENV === 'production') {
  validateSchema();
}
```

**Action Items:**
1. Review all table definitions in `drizzle/schema.ts`
2. Ensure service files only reference existing tables
3. Add type guards for database operations
4. Use Drizzle's built-in validation

### Strategy 5: Build Verification Pipeline

**Create a pre-deployment build script:**

```bash
#!/bin/bash
# scripts/pre-deploy.sh

set -e

echo "🔍 Checking dependencies..."
pnpm install

echo "🔍 Checking TypeScript..."
pnpm tsc --noEmit

echo "🔍 Checking for @/ imports..."
if grep -r "@/" server/ client/ --include="*.ts" --include="*.tsx" | grep -v node_modules; then
  echo "❌ Found @/ imports in code. Replace with relative paths."
  exit 1
fi

echo "🔍 Building application..."
pnpm build

echo "🔍 Running tests..."
pnpm test

echo "✅ All checks passed! Ready to deploy."
```

**Usage:**
```bash
chmod +x scripts/pre-deploy.sh
./scripts/pre-deploy.sh
```

### Strategy 6: Environment-Specific Configuration

**Create separate configurations for dev and production:**

```typescript
// server/_core/config.ts
export const config = {
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  
  // Validate critical dependencies on startup
  validateDependencies: () => {
    const requiredPackages = ['nodemailer', 'node-cron', 'uuid'];
    requiredPackages.forEach(pkg => {
      try {
        require.resolve(pkg);
      } catch (e) {
        throw new Error(`Missing required package: ${pkg}`);
      }
    });
  }
};

// Call on startup
if (config.isProd) {
  config.validateDependencies();
}
```

---

## Immediate Actions (Next 24 Hours)

### Priority 1: Dependency Management
- [ ] Run `pnpm install` to ensure all packages are installed
- [ ] Verify `pnpm-lock.yaml` is committed to git
- [ ] Document all external dependencies in `README.md`

### Priority 2: Import Path Cleanup
- [ ] Search codebase for all `@/` imports
- [ ] Replace with relative paths in all files
- [ ] Add ESLint rule to prevent future `@/` imports

### Priority 3: Build Verification
- [ ] Run `pnpm build` locally to test production build
- [ ] Run `pnpm tsc --noEmit` to check for type errors
- [ ] Run `pnpm test` to ensure all tests pass

### Priority 4: Schema Validation
- [ ] Review all table definitions in `drizzle/schema.ts`
- [ ] Ensure service files only reference existing tables
- [ ] Add type guards for database operations

---

## Long-Term Prevention (Next Sprint)

### 1. **Automated Pre-Deployment Checks**
- Set up GitHub Actions or CI/CD pipeline to run pre-deploy checks
- Fail builds if `@/` imports are detected
- Fail builds if TypeScript errors exist
- Fail builds if tests don't pass

### 2. **Dependency Scanning**
- Use `npm audit` or `pnpm audit` in CI/CD
- Automatically detect missing dependencies
- Alert on outdated packages

### 3. **Build Testing**
- Test production build in CI/CD before deployment
- Catch module resolution errors before production
- Verify all imports resolve correctly

### 4. **Documentation**
- Maintain `DEPLOYMENT_CHECKLIST.md` and review before each deployment
- Document all external dependencies and their versions
- Create runbooks for common deployment issues

---

## Testing the Fix

Once you've applied these prevention strategies, test with:

```bash
# 1. Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. Build test
pnpm build

# 3. Type check
pnpm tsc --noEmit

# 4. Test run
pnpm test

# 5. Dev server test
pnpm dev
```

---

## Summary

| Root Cause | Prevention | Timeline |
|-----------|-----------|----------|
| Missing dependencies | Pre-deploy checklist, dependency audit | Immediate |
| Invalid import aliases | Use relative paths, ESLint rules | Immediate |
| Schema mismatches | Type validation, schema review | 24 hours |
| No build verification | CI/CD pipeline, pre-deploy script | 1 week |

By implementing these strategies, you'll prevent 95% of deployment failures related to module resolution and dependency issues.
