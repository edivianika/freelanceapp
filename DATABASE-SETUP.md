# Database Setup Required

## Problem Identified
The application is showing "Internal server error" because the Supabase database is not properly configured.

## Root Cause
1. **Missing Environment Variables**: Backend `.env` file was missing
2. **Database Not Setup**: Supabase database schema and test users not created
3. **Invalid Credentials**: Using default placeholder values

## Fix Applied

### 1. Created Backend Environment File
**File**: `backend/.env`
```env
# Backend Environment Variables
PORT=3001
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. Created Environment Template
**File**: `backend/.env.example`
- Copy of `.env` for reference

## Next Steps Required

### 1. Setup Supabase Database
1. **Create Supabase Project**:
   - Go to https://supabase.com
   - Create new project
   - Note down your project URL and API keys

2. **Run Database Schema**:
   - Open Supabase Dashboard → SQL Editor
   - Run the `reset-database.sql` script
   - This will create tables and test users

3. **Create Storage Bucket**:
   - Go to Storage → Buckets
   - Create bucket named `submission-files`
   - Set public access if needed

### 2. Update Environment Variables
**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://your-actual-project-id.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
JWT_SECRET=your-actual-secret-key
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Test Application
1. **Restart Backend**: `npm run dev`
2. **Test Login**: Try admin@example.com / admin123
3. **Verify Dashboard**: Should load without errors

## Current Status
✅ **Backend Environment**: Created
✅ **Database Schema**: Ready to deploy
⚠️ **Supabase Setup**: Required
⚠️ **Environment Variables**: Need real values

## Files Created
- `backend/.env` - Backend environment variables
- `backend/.env.example` - Environment template
- `DATABASE-SETUP.md` - This documentation

The application is ready for database setup! Once Supabase is configured, the "Internal server error" will be resolved.







