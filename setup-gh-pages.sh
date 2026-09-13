#!/bin/bash

# Setup script for GitHub Pages deployment
# This script configures the project for deployment to GitHub Pages

echo "🚀 Setting up GitHub Pages deployment..."

# Get repository name from git remote
REPO_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: No git remote found. Please initialize a git repository and add a remote."
    echo "   git init"
    echo "   git remote add origin https://github.com/your-username/your-repo-name.git"
    exit 1
fi

# Extract repository name from URL
if [[ $REPO_URL =~ github.com[:/]([^/]+)/([^.]+) ]]; then
    USERNAME="${BASH_REMATCH[1]}"
    REPO_NAME="${BASH_REMATCH[2]}"
else
    echo "❌ Error: Could not parse repository URL: $REPO_URL"
    exit 1
fi

echo "✅ Found repository: $USERNAME/$REPO_NAME"

# Update .env.production with correct base URL
cat > .env.production << EOF
# GitHub Pages Configuration
VITE_BASE_URL=/$USERNAME/$REPO_NAME/
EOF

echo "✅ Updated .env.production with base URL: /$USERNAME/$REPO_NAME/"

# Update vite.config.js to use environment variable
if ! grep -q "base:" vite.config.js; then
    # Add base configuration to vite.config.js
    sed -i.bak 's/export default defineConfig({/export default defineConfig({\n  base: process.env.VITE_BASE_URL || "\/",/' vite.config.js
    rm vite.config.js.bak
    echo "✅ Updated vite.config.js with base configuration"
else
    echo "ℹ️  vite.config.js already has base configuration"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Commit the changes:"
echo "   git add ."
echo "   git commit -m 'Configure GitHub Pages deployment'"
echo ""
echo "2. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "3. Enable GitHub Pages in repository settings:"
echo "   - Go to Settings → Pages"
echo "   - Source: GitHub Actions"
echo ""
echo "4. Your site will be available at:"
echo "   https://$USERNAME.github.io/$REPO_NAME/"
echo ""
