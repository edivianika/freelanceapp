# Fix Database Error - Infinite Recursion

## Problem
Error: "infinite recursion detected in policy for relation 'users'"

This happens because the RLS (Row Level Security) policies are causing infinite recursion when trying to access the users table.

## Solution

### Step 1: Reset Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the `reset-database.sql` file to clean up the database:

```sql
-- Copy and paste the contents of reset-database.sql
```

### Step 2: Create Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `submission-files`
3. Set it to public
4. No RLS policies needed for now

### Step 3: Test the Application

1. Restart your development servers:
   ```bash
   # Stop current servers (Ctrl+C)
   npm run dev
   ```

2. Try logging in with:
   - **Admin**: admin@example.com / admin123
   - **Marketer**: marketer@example.com / marketer123

## What Was Fixed

1. **Removed RLS Policies**: The original schema had complex RLS policies that caused infinite recursion
2. **Simplified Database Access**: Backend now uses `supabaseAdmin` for all database operations
3. **Fixed Token Management**: API client now properly manages JWT tokens
4. **Added Test Users**: Default admin and marketer accounts for testing

## Alternative: Manual Database Reset

If you prefer to reset manually:

1. **Drop all tables**:
   ```sql
   DROP TABLE IF EXISTS override_logs CASCADE;
   DROP TABLE IF EXISTS status_logs CASCADE;
   DROP TABLE IF EXISTS submission_files CASCADE;
   DROP TABLE IF EXISTS submissions CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```

2. **Run the fixed schema**:
   ```sql
   -- Copy contents from supabase-schema-fixed.sql
   ```

## Testing

After fixing the database:

1. **Login Test**:
   - Go to http://localhost:3000/login
   - Use admin@example.com / admin123
   - Should redirect to admin dashboard

2. **Registration Test**:
   - Go to http://localhost:3000/register
   - Create a new marketer account
   - Should redirect to marketer dashboard

3. **API Test**:
   - Check browser console for errors
   - Backend should return 200 status codes
   - No more infinite recursion errors

## If Still Having Issues

1. **Check Environment Variables**:
   - Ensure `.env.local` has correct Supabase credentials
   - Ensure `backend/.env` has correct Supabase credentials

2. **Check Supabase Connection**:
   - Verify project URL and API keys are correct
   - Test connection in Supabase dashboard

3. **Clear Browser Cache**:
   - Hard refresh (Ctrl+Shift+R)
   - Clear localStorage

4. **Check Backend Logs**:
   - Look for any error messages in terminal
   - Verify backend is running on port 3001

## Success Indicators

✅ No "infinite recursion" errors in console
✅ Login/register works without errors
✅ Dashboard loads successfully
✅ API calls return 200 status codes
✅ No RLS policy errors in Supabase logs


