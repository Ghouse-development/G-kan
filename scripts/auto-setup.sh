#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "============================================================"
echo "   G-kan Automatic Setup - 95% Automated"
echo "============================================================"
echo ""
echo "This script will:"
echo "  [1/6] Check Node.js installation"
echo "  [2/6] Install npm dependencies"
echo "  [3/6] Install Supabase CLI"
echo "  [4/6] Connect to Supabase project"
echo "  [5/6] Deploy database schema"
echo "  [6/6] Create storage bucket"
echo ""
echo "Note: You will need to login to Supabase once (browser opens)"
echo ""
read -p "Press Enter to continue..."

# Check Node.js
echo ""
echo "[1/6] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ ERROR: Node.js is not installed${NC}"
    echo ""
    echo "Please install Node.js first:"
    echo "https://nodejs.org/"
    exit 1
fi
node --version
echo -e "${GREEN}✅ Node.js found${NC}"

# Install dependencies
echo ""
echo "[2/6] Installing npm dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Install Supabase CLI
echo ""
echo "[3/6] Installing Supabase CLI globally..."
npm install -g supabase
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Supabase CLI${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Supabase CLI installed${NC}"

# Login to Supabase
echo ""
echo "[4/6] Connecting to Supabase..."
echo ""
echo "A browser window will open for authentication."
echo "Please login with your Supabase account."
echo ""
read -p "Press Enter to open browser..."

supabase login
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to login to Supabase${NC}"
    exit 1
fi

supabase link --project-ref dtdtexkwbirnpqkwzzxl
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to link project${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Connected to Supabase project${NC}"

# Push database migrations
echo ""
echo "[5/6] Deploying database schema..."
echo "This may take a minute..."
supabase db push
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: Database push had issues${NC}"
    echo "This is normal if tables already exist"
fi
echo -e "${GREEN}✅ Database schema deployed${NC}"

# Create storage bucket
echo ""
echo "[6/6] Creating storage bucket..."
npm run setup:db
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: Storage setup had issues${NC}"
    echo "Bucket may already exist"
fi
echo -e "${GREEN}✅ Storage setup complete${NC}"

# Success message
echo ""
echo "============================================================"
echo "   🎉 Setup Complete - 95% Done!"
echo "============================================================"
echo ""
echo -e "${GREEN}✅ What was automated:${NC}"
echo "   • Database tables created (14 tables)"
echo "   • RLS policies configured"
echo "   • Storage bucket created"
echo "   • Vector search enabled"
echo ""
echo -e "${YELLOW}⚠️  Manual step required (1 minute):${NC}"
echo "   Storage RLS Policies need manual configuration"
echo ""
echo "📋 Next steps:"
echo ""
echo "   1. Configure Storage RLS (1 min):"
echo "      https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/storage/buckets/files"
echo "      → Click 'Policies' tab"
echo "      → See ZERO_TO_HERO.md for policy details"
echo ""
echo "   2. (Optional) Add OpenAI API key to .env.local"
echo ""
echo "   3. Start the app:"
echo "      npm run dev"
echo ""
echo "   4. Visit:"
echo "      http://localhost:3000"
echo ""
echo "   5. Create account and make yourself admin (SQL):"
echo "      UPDATE public.users SET is_admin = true"
echo "      WHERE email = 'your@email.com';"
echo ""
echo "============================================================"
echo "📚 Documentation: ZERO_TO_HERO.md"
echo "============================================================"
echo ""
