#!/bin/bash

# Marketing Automation PM2 Setup Script
# Run this on your VPS server

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    Marketing Automation - PM2 Setup                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in website-builder directory${NC}"
    echo "Please run: cd ~/website-builder && ./setup-pm2-marketing.sh"
    exit 1
fi

echo -e "${BLUE}📍 Current directory:${NC} $(pwd)"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 is not installed${NC}"
    echo "Installing PM2..."
    npm install -g pm2
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install PM2${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ PM2 installed${NC}"
fi

echo -e "${GREEN}✅ PM2 found:${NC} $(pm2 --version)"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Please create .env file with your API keys first"
    echo "See: env-template-marketing.txt"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# Check if required env variables are set
echo -e "${BLUE}🔍 Checking environment variables...${NC}"

if grep -q "DEVTO_API_KEY=your" .env; then
    echo -e "${YELLOW}⚠️  DEVTO_API_KEY not configured${NC}"
    echo "Please edit .env and add your Dev.to API key"
fi

if grep -q "HASHNODE_API_KEY=your" .env; then
    echo -e "${YELLOW}⚠️  HASHNODE_API_KEY not configured${NC}"
    echo "Please edit .env and add your Hashnode API key"
fi

echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install axios dotenv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Create logs directory
mkdir -p logs
echo -e "${GREEN}✅ Logs directory created${NC}"
echo ""

# Check if marketing-automation is already running
if pm2 list | grep -q "marketing-automation"; then
    echo -e "${YELLOW}⚠️  marketing-automation is already running${NC}"
    echo ""
    read -p "Do you want to restart it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pm2 restart marketing-automation
        echo -e "${GREEN}✅ Restarted marketing-automation${NC}"
    fi
else
    # Start with PM2
    echo -e "${BLUE}🚀 Starting marketing automation with PM2...${NC}"
    pm2 start scripts/schedule-marketing-posts.js --name "marketing-automation"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Marketing automation started${NC}"
    else
        echo -e "${RED}❌ Failed to start marketing automation${NC}"
        echo "Try running manually to see errors:"
        echo "node scripts/schedule-marketing-posts.js"
        exit 1
    fi
fi
echo ""

# Save PM2 configuration
echo -e "${BLUE}💾 Saving PM2 configuration...${NC}"
pm2 save

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PM2 configuration saved${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to save PM2 configuration${NC}"
fi
echo ""

# Check if PM2 startup is configured
if ! pm2 startup | grep -q "already"; then
    echo -e "${YELLOW}⚠️  PM2 startup not configured${NC}"
    echo "Run this to enable PM2 on server reboot:"
    echo -e "${BLUE}pm2 startup${NC}"
    echo "Then run the command it gives you (with sudo)"
    echo ""
fi

# Show status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📊 Current PM2 Status:${NC}"
pm2 list
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "  View logs:     pm2 logs marketing-automation"
echo "  Stop:          pm2 stop marketing-automation"
echo "  Restart:       pm2 restart marketing-automation"
echo "  Monitor:       pm2 monit"
echo "  Status:        pm2 list"
echo ""
echo -e "${BLUE}📁 Log Files:${NC}"
echo "  Output:  logs/marketing-out.log"
echo "  Errors:  logs/marketing-error.log"
echo "  Posts:   scripts/marketing-posts-log.json"
echo ""
echo -e "${YELLOW}💡 Tip:${NC} Use 'pm2 logs marketing-automation' to watch it in action!"
echo ""

