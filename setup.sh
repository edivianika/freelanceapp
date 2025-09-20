#!/bin/bash

echo "🚀 Setting up Data Marketing Freelance Platform..."

# Install all dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Create environment files if they don't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local 2>/dev/null || echo "Please create .env.local with your Supabase credentials"
fi

if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env file..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "Please create backend/.env with your Supabase credentials"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Supabase project and run the SQL schema"
echo "2. Update .env.local and backend/.env with your Supabase credentials"
echo "3. Run 'npm run dev:full' to start both frontend and backend"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:3001"


