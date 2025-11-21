#!/bin/bash
# Frontend Deployment Setup Script

echo "🚀 Setting up frontend for deployment..."
echo ""

cd /Users/mdaliulislamriad/Desktop/frontend

# Initialize git
echo "📦 Initializing Git repository..."
git init

# Add all files
echo "📝 Adding files..."
git add .

# Create initial commit
echo "💾 Creating commit..."
git commit -m "Initial commit - ready for deployment"

echo ""
echo "✅ Frontend is ready for GitHub!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new GitHub repository called 'peptide-ai-frontend'"
echo "2. Run this command (replace YOUR_USERNAME with your GitHub username):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/peptide-ai-frontend.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
