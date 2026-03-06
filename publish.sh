#!/bin/bash
# Publish portfolio to GitHub Pages
# Run this in Terminal; you may be asked for your GitHub username and password/token.
set -e
cd "$(dirname "$0")"
echo "Pushing to GitHub..."
git push -u origin main
echo ""
echo "Done. Enable GitHub Pages if you haven't:"
echo "  1. Open https://github.com/ethanchinag3/portfolio"
echo "  2. Settings → Pages → Source: Deploy from a branch"
echo "  3. Branch: main, Folder: / (root) → Save"
echo ""
echo "Your site will be at: https://ethanchinag3.github.io/portfolio/"
