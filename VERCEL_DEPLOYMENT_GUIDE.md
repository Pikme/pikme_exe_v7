# Vercel Deployment Guide - Pikme PSEO

## Issues Fixed for Vercel Deployment

This guide documents the fixes applied to resolve Vercel build errors.

### 1. **Fixed HTML Entry Point Path**
**Error:** `Failed to resolve /src/main.tsx from /vercel/path0/client/index.html`

**Solution:** 
- Changed script path in `client/index.html` from `/src/main.tsx` to `./src/main.tsx`
- Updated `vite.config.ts` to explicitly specify the HTML entry point in rollupOptions

**Files Modified:**
- `client/index.html` - Changed script src path to relative path
- `vite.config.ts` - Added rollupOptions with explicit input path

### 2. **Fixed Analytics Environment Variables**
**Error:** `%VITE_ANALYTICS_ENDPOINT% is not defined in env variables`

**Solution:**
- Updated `client/index.html` to conditionally load analytics script only if environment variables are defined
- This prevents build failures when analytics variables are missing

**Files Modified:**
- `client/index.html` - Added conditional script loading for analytics

## Deployment Steps

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project settings and add the following environment variables:

```
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
VITE_APP_ID=your-app-id
VITE_APP_TITLE=Pikme USA | Elite Luxury Travel
VITE_APP_LOGO=https://your-cdn.com/logo.png
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-api-key
VITE_OAUTH_PORTAL_URL=https://manus.im
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id
RECAPTCHA_SECRET_KEY=your-recaptcha-key
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

### Step 2: Push to GitHub

Ensure your code is pushed to the GitHub repository that's connected to Vercel:

```bash
git add .
git commit -m "Fix Vercel deployment issues"
git push origin main
```

### Step 3: Deploy to Vercel

1. Go to your Vercel project dashboard
2. Click "Deploy" or wait for automatic deployment from GitHub
3. Monitor the build logs for any errors
4. Once deployment is successful, your site will be live

## Build Configuration

The project uses the following build configuration:

- **Framework:** Next.js/React with TypeScript
- **Build Tool:** Vite
- **Package Manager:** pnpm
- **Node Version:** 18+ (recommended)

### Build Script

```bash
pnpm run build
```

This runs:
1. `vite build` - Builds the React frontend
2. `esbuild server/_core/index.ts` - Bundles the Express server

### Output

- Frontend: `dist/public/` - Static files for CDN
- Server: `dist/index.js` - Node.js entry point

## Troubleshooting

### Build Fails with "Failed to resolve /src/main.tsx"

**Solution:** Ensure `client/index.html` has the correct script path:
```html
<script type="module" src="./src/main.tsx"></script>
```

### Analytics Script Errors

**Solution:** The analytics script now conditionally loads. If you don't have analytics set up, you can leave `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` empty.

### Database Connection Issues

**Solution:** Ensure your `DATABASE_URL` environment variable is correctly set in Vercel project settings.

## Production Checklist

- [ ] All environment variables are set in Vercel
- [ ] Database is properly configured and accessible
- [ ] GitHub repository is connected to Vercel
- [ ] Build completes successfully (no errors in logs)
- [ ] Site is accessible at your Vercel domain
- [ ] Admin panel is working at `/admin`
- [ ] Activities are loading correctly

## Support

If you encounter any issues during deployment:

1. Check the Vercel build logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure the database is accessible from Vercel
4. Check GitHub repository for any uncommitted changes

## Next Steps

After successful deployment:

1. Test all admin features
2. Verify CSV import functionality
3. Check SEO pages are rendering correctly
4. Monitor analytics and performance
