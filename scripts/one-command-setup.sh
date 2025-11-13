#!/bin/bash

echo "========================================"
echo "G-kan One-Command Setup"
echo "========================================"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found"
echo ""

echo "[1/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "[2/5] Installing Supabase CLI..."
npm install -g supabase
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Supabase CLI"
    exit 1
fi

echo ""
echo "[3/5] Linking to Supabase project..."
echo "Please follow the prompts to login to Supabase..."
supabase login

supabase link --project-ref dtdtexkwbirnpqkwzzxl
if [ $? -ne 0 ]; then
    echo "❌ Failed to link project"
    exit 1
fi

echo ""
echo "[4/5] Pushing database migrations..."
supabase db push
if [ $? -ne 0 ]; then
    echo "❌ Failed to push migrations"
    exit 1
fi

echo ""
echo "[5/5] Creating storage bucket..."
npm run setup:db
if [ $? -ne 0 ]; then
    echo "⚠️  Storage bucket may already exist"
fi

echo ""
echo "========================================"
echo "✨ Setup Complete!"
echo "========================================"
echo ""
echo "📋 Next steps:"
echo "1. (Optional) Set OPENAI_API_KEY in .env.local for AI features"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
echo "4. Sign up and make yourself admin:"
echo "   UPDATE public.users SET is_admin = true WHERE email = 'your@email.com';"
echo ""
