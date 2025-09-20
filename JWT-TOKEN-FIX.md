# JWT Token Fix - Invalid Signature Error

## Problem Fixed
Error: `JsonWebTokenError: invalid signature` causing "failed to load" errors in admin pages.

## Root Cause
1. **Missing Backend Environment File**: The `backend/.env` file was missing, causing JWT_SECRET to be undefined
2. **Invalid JWT Tokens**: Old JWT tokens in localStorage were signed with different/undefined secret
3. **Environment Variables Not Loaded**: Backend couldn't load proper configuration

## Fix Applied

### 1. Created Backend Environment File
**File**: `backend/.env`
```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Created Environment Example File
**File**: `backend/.env.example`
- Template for environment variables
- Helps with setup documentation

### 3. Created Storage Clear Tool
**File**: `clear-storage.html`
- HTML page to clear localStorage and sessionStorage
- Removes invalid JWT tokens from browser

### 4. Server Restart
- Killed existing processes
- Restarted with proper environment variables
- JWT_SECRET now properly loaded

## Steps to Complete Fix

### 1. Clear Browser Storage
1. Open `http://localhost:3000/clear-storage.html` in your browser
2. Click "OK" when prompted
3. Close the tab and refresh your main app

### 2. Update Environment Variables (Required)
You need to update the `backend/.env` file with your actual Supabase credentials:

```env
# Replace these with your actual Supabase values:
SUPABASE_URL=https://your-actual-project.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# Change this to a secure random string:
JWT_SECRET=your-secure-random-jwt-secret-key
```

### 3. Setup Supabase Database
1. Run the SQL from `reset-database.sql` in Supabase SQL Editor
2. Create a `submission-files` bucket in Storage
3. Update environment variables with real credentials

## Verification

### 1. Check Backend Logs
```bash
# Should see no more "invalid signature" errors
# Should see "Server running on port 3001"
```

### 2. Test Login
1. Go to `http://localhost:3000/login`
2. Try logging in with admin credentials
3. Should work without JWT errors

### 3. Test Admin Pages
1. After successful login, visit admin pages:
   - `http://localhost:3000/admin/dashboard`
   - `http://localhost:3000/admin/marketers`
   - `http://localhost:3000/admin/submissions`
   - `http://localhost:3000/admin/override-logs`

## Current Status
✅ **Backend environment file created**
✅ **JWT_SECRET configured**
✅ **Server restarted with proper config**
✅ **Storage clear tool created**
⚠️ **Need to update with real Supabase credentials**
⚠️ **Need to clear browser storage**

## Next Steps
1. **Clear browser storage** using the clear-storage.html tool
2. **Update environment variables** with real Supabase credentials
3. **Setup Supabase database** using reset-database.sql
4. **Test login and admin functionality**

The JWT token error should now be resolved! 🎉







