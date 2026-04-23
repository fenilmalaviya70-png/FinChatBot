#!/bin/bash
# Instructions to push code to GitHub

# Replace YOUR_GITHUB_USERNAME and YOUR_REPO_NAME with your actual values
# Example: https://github.com/Fenil412/Financial-ChatBot.git

echo "Step 1: Add remote repository"
echo "Run this command (replace with your GitHub URL):"
echo "git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git"
echo ""
echo "Step 2: Verify remote was added"
echo "git remote -v"
echo ""
echo "Step 3: Push to GitHub"
echo "git push -u origin main"
echo ""
echo "If you get authentication errors, you may need to:"
echo "1. Use a Personal Access Token instead of password"
echo "2. Or set up SSH keys"
echo ""
echo "To create a Personal Access Token:"
echo "1. Go to GitHub Settings > Developer settings > Personal access tokens"
echo "2. Generate new token (classic)"
echo "3. Select 'repo' scope"
echo "4. Use the token as your password when pushing"
