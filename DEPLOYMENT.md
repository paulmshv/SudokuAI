# 🚀 Deployment Guide

This guide covers deployment options for the Sudoku Game application.

## Table of Contents
- [GitHub Pages (Recommended)](#github-pages-recommended)
- [Vercel](#vercel)
- [Netlify](#netlify)
- [Custom Server](#custom-server)

---

## GitHub Pages (Recommended)

### Automatic Deployment (CI/CD)

This project includes GitHub Actions workflows for automatic deployment.

#### Quick Setup

1. **Push your code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

2. **Configure environment:**
```bash
# Update .env.production with your repo info
echo "VITE_BASE_URL=/your-username/your-repo-name/" > .env.production
git add .env.production
git commit -m "Configure GitHub Pages"
git push
```

3. **Enable GitHub Pages:**
   - Go to your repository → **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The site will be deployed automatically

4. **Access your site:**
   ```
   https://your-username.github.io/your-repo-name/
   ```

#### Using the Setup Script

```bash
chmod +x setup-gh-pages.sh
./setup-gh-pages.sh
```

The script automatically:
- Detects your repository name
- Configures the base URL
- Updates Vite configuration

### Manual Deployment

If you prefer to deploy manually:

```bash
# Build the project
npm run build

# The dist/ folder contains your static site
# Upload it to your hosting provider
```

---

## Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/sudoku-game)

### Manual Deployment

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? **Select your account**
   - Link to existing project? **N**
   - Project name? **sudoku-game**
   - Directory? **./**
   - Override settings? **N**

---

## Netlify

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/sudoku-game)

### Manual Deployment

1. **Install Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Build and deploy:**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Configuration File

Create `netlify.toml` in the root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Custom Server

### Build for Production

```bash
npm run build
```

The `dist/` folder contains all static files.

### Serve with Node.js

Create `server.js`:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('dist'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Install and run:

```bash
npm install express
node server.js
```

### Serve with Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Environment Variables

### `.env.production`

```bash
# Base URL for GitHub Pages
VITE_BASE_URL=/your-username/your-repo-name/
```

### `.env.development`

```bash
# Development base URL (usually just /)
VITE_BASE_URL=/
```

---

## Build Optimization

### Analyze Bundle Size

```bash
npm run build
```

Check the output for bundle sizes. The current build:
- HTML: ~3 KB
- CSS: ~50 KB (gzipped: ~7.5 KB)
- JS: ~174 KB (gzipped: ~56 KB)

### Performance Tips

1. **Enable compression** on your server (gzip/brotli)
2. **Use a CDN** for static assets
3. **Set proper cache headers** for static files
4. **Enable HTTP/2** for better performance

---

## Troubleshooting

### Blank Page After Deployment

**Problem:** Site loads but shows blank page

**Solution:**
- Check `VITE_BASE_URL` in `.env.production`
- Ensure it matches your deployment path exactly
- Rebuild and redeploy

### Assets Not Loading (404 Errors)

**Problem:** CSS/JS files return 404

**Solution:**
- Verify base URL configuration
- Check that all assets are in the `dist/` folder
- Ensure file paths are relative, not absolute

### Routing Issues

**Problem:** Direct navigation to routes fails

**Solution:**
- Configure server to redirect all routes to `index.html`
- For GitHub Pages, this is handled automatically
- For custom servers, use the redirect configurations above

---

## Continuous Deployment

### GitHub Actions Workflow

The included workflow (`.github/workflows/deploy.yml`) automatically:
- Builds on every push to `main`
- Runs tests (if configured)
- Deploys to GitHub Pages

### Custom Workflow

To customize the deployment:

1. Edit `.github/workflows/deploy.yml`
2. Add custom steps (testing, linting, etc.)
3. Commit and push changes

---

## Support

For deployment issues:
1. Check the [GitHub Actions logs](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)
2. Review the [Vite deployment guide](https://vitejs.dev/guide/static-deploy.html)
3. Open an issue on GitHub

---

**Happy deploying! 🚀**
