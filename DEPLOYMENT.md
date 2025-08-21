# 🚀 Usafix Netlify Deployment Guide

This guide will walk you through deploying the Usafix application to Netlify.

## ✅ Pre-Deployment Checklist

- [x] Build process tested and working
- [x] Environment variables documented
- [x] Netlify configuration file created
- [x] SPA routing configured
- [x] All dependencies resolved

## 🌐 Deployment Steps

### Step 1: Prepare Your Repository

1. **Ensure your code is pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

### Step 2: Connect to Netlify

1. **Go to [Netlify](https://netlify.com) and sign in**
2. **Click "New site from Git"**
3. **Choose your Git provider** (GitHub recommended)
4. **Select your repository:** `Philip38-hub/usafix`
5. **Configure build settings:**
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### Step 3: Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_from_dashboard
VITE_CIVIC_AUTH_CLIENT_ID=your_civic_client_id_from_console
VITE_APP_NAME=Usafix
DATABASE_TYPE=supabase
```

### Step 4: Deploy

1. **Click "Deploy site"**
2. **Wait for the build to complete** (usually 2-5 minutes)
3. **Your site will be available at:** `https://random-name.netlify.app`

### Step 5: Custom Domain (Optional)

1. **Go to Site settings > Domain management**
2. **Add custom domain:** `usafix.com` or your preferred domain
3. **Configure DNS** as instructed by Netlify
4. **SSL certificate** will be automatically provisioned

## 🔧 Build Configuration

The application uses the following build configuration:

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🌍 Environment-Specific Settings

### Production Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_CIVIC_AUTH_CLIENT_ID` | Civic Auth client ID | `your-civic-client-id` |
| `VITE_APP_NAME` | Application name | `Usafix` |
| `DATABASE_TYPE` | Database type | `supabase` |

### Civic Auth Configuration

Make sure to update your Civic Auth settings:

1. **Go to [Civic Developer Console](https://civic.com/developers)**
2. **Add your Netlify domain** to allowed origins:
   - `https://your-app-name.netlify.app`
   - `https://usafix.com` (if using custom domain)

### Supabase Configuration

Update your Supabase project settings:

1. **Go to Supabase Dashboard > Authentication > URL Configuration**
2. **Add your Netlify URL** to:
   - Site URL: `https://your-app-name.netlify.app`
   - Redirect URLs: `https://your-app-name.netlify.app/**`

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails:**
   - Check environment variables are set correctly
   - Ensure all dependencies are in `package.json`
   - Check build logs for specific errors

2. **Routing Issues (404 on refresh):**
   - Verify `netlify.toml` redirects are configured
   - Check that `dist/index.html` exists after build

3. **Environment Variables Not Working:**
   - Ensure variables start with `VITE_`
   - Redeploy after adding new variables
   - Check variable names match exactly

4. **Civic Auth Issues:**
   - Verify client ID is correct
   - Check allowed origins in Civic console
   - Ensure HTTPS is used (not HTTP)

### Debug Commands

```bash
# Test build locally
npm run build

# Preview build locally
npm run preview

# Check deployment readiness
node scripts/prepare-deployment.js
```

## 📊 Performance Optimization

### Automatic Optimizations

Netlify provides:
- **Global CDN** for fast content delivery
- **Automatic compression** (Gzip/Brotli)
- **Image optimization** for static assets
- **HTTP/2** support
- **SSL certificates** (Let's Encrypt)

### Manual Optimizations

1. **Code Splitting:** Consider implementing dynamic imports for large components
2. **Bundle Analysis:** Use `npm run build -- --analyze` to analyze bundle size
3. **Asset Optimization:** Optimize images and fonts before deployment

## 🔒 Security

### Automatic Security Features

- **HTTPS enforcement**
- **Security headers** (configured in `netlify.toml`)
- **DDoS protection**
- **Bot filtering**

### Additional Security

1. **Environment Variables:** Never commit sensitive data to Git
2. **CORS Configuration:** Properly configure Supabase CORS settings
3. **Content Security Policy:** Consider adding CSP headers

## 📈 Monitoring

### Netlify Analytics

Enable Netlify Analytics for:
- **Traffic insights**
- **Performance metrics**
- **Error tracking**
- **User behavior**

### External Monitoring

Consider integrating:
- **Sentry** for error tracking
- **Google Analytics** for user analytics
- **Uptime monitoring** services

## 🚀 Deployment Success!

Once deployed, your Usafix application will be available at:
- **Netlify URL:** `https://your-app-name.netlify.app`
- **Custom Domain:** `https://usafix.com` (if configured)

### Post-Deployment Checklist

- [ ] Test all major features
- [ ] Verify authentication works
- [ ] Check booking flow
- [ ] Test on mobile devices
- [ ] Verify environment variables
- [ ] Test database connections
- [ ] Check error handling

## 🎉 You're Live!

Your Usafix application is now deployed and ready to connect Kenyans with trusted service providers!

For support or questions, refer to:
- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/guides/deploying)
