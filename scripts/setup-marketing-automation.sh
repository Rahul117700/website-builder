#!/bin/bash

# Marketing Automation Setup Script
# This script helps you set up automatic content posting

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Marketing Automation Setup for Sell Earn Direct       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js first: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found:${NC} $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found:${NC} $(npm --version)"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install axios dotenv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed (axios, dotenv)${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Create config directory if it doesn't exist
mkdir -p config

# Copy config example
if [ ! -f "config/marketing-config.js" ]; then
    cp config/marketing-config.example.js config/marketing-config.js
    echo -e "${GREEN}✅ Created config/marketing-config.js${NC}"
    echo -e "${YELLOW}⚠️  Please edit config/marketing-config.js and add your API keys${NC}"
else
    echo -e "${YELLOW}⚠️  config/marketing-config.js already exists, skipping${NC}"
fi
echo ""

# Create logs directory
mkdir -p logs
echo -e "${GREEN}✅ Created logs directory${NC}"
echo ""

# Show instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}1. Get API Keys:${NC}"
echo "   Medium:   https://medium.com/me/settings/security"
echo "   Dev.to:   https://dev.to/settings/extensions"
echo "   Hashnode: https://hashnode.com/settings/developer"
echo ""
echo -e "${YELLOW}2. Add API Keys:${NC}"
echo "   Edit: config/marketing-config.js"
echo "   nano config/marketing-config.js"
echo ""
echo -e "${YELLOW}3. Test Run:${NC}"
echo "   node scripts/auto-post-marketing.js"
echo ""
echo -e "${YELLOW}4. Start Automated Posting:${NC}"
echo "   Option A - Run continuously:"
echo "   node scripts/schedule-marketing-posts.js"
echo ""
echo "   Option B - Use PM2 (recommended for VPS):"
echo "   npm install -g pm2"
echo "   pm2 start scripts/schedule-marketing-posts.js --name marketing"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "   Option C - Cron job (daily at 10 AM):"
echo "   crontab -e"
echo "   0 10 * * * cd $(pwd) && node scripts/auto-post-marketing.js >> logs/marketing.log 2>&1"
echo ""
echo -e "${YELLOW}5. Read Full Guide:${NC}"
echo "   cat MARKETING_AUTOMATION_GUIDE.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✨ Setup complete! Start by getting your API keys.${NC}"
echo ""

