# Troubleshooting Guide

## Common Issues and Solutions

### 1. Fast Refresh Error (Runtime Error)

**Problem**: `Fast Refresh had to perform a full reload due to a runtime error`

**Solutions**:
1. **Environment Variables**: Make sure all environment variables are properly set
2. **Browser Cache**: Clear browser cache and hard refresh (Ctrl+Shift+R)
3. **Node Modules**: Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 2. Supabase Connection Issues

**Problem**: Database connection errors or authentication failures

**Solutions**:
1. **Check Environment Variables**:
   ```bash
   # Check if .env.local exists and has correct values
   cat .env.local
   ```

2. **Verify Supabase Setup**:
   - Ensure Supabase project is created
   - Run the SQL schema from `supabase-schema.sql`
   - Check if API keys are correct

3. **Test Connection**:
   ```bash
   # Test if Supabase is accessible
   curl -H "apikey: YOUR_ANON_KEY" https://YOUR_PROJECT.supabase.co/rest/v1/
   ```

### 3. Backend Server Issues

**Problem**: Backend server not starting or API calls failing

**Solutions**:
1. **Check Backend Environment**:
   ```bash
   cd backend
   cat .env
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Start Backend Manually**:
   ```bash
   cd backend
   npm run dev
   ```

### 4. File Upload Issues

**Problem**: File uploads not working

**Solutions**:
1. **Check Supabase Storage**:
   - Create `submission-files` bucket in Supabase Storage
   - Set bucket to public
   - Configure RLS policies

2. **Check File Size**: Ensure files are under 10MB limit

### 5. Authentication Issues

**Problem**: Login/register not working

**Solutions**:
1. **Check JWT Secret**: Ensure JWT_SECRET is set in both frontend and backend
2. **Check API URL**: Verify NEXT_PUBLIC_API_URL points to correct backend
3. **Check CORS**: Ensure backend CORS is configured for frontend URL

### 6. Database Schema Issues

**Problem**: Database tables not created or RLS policies not working

**Solutions**:
1. **Run SQL Schema**: Execute `supabase-schema.sql` in Supabase SQL Editor
2. **Check RLS Policies**: Verify Row Level Security is enabled
3. **Test Queries**: Try running simple queries in Supabase dashboard

## Quick Fix Commands

```bash
# Clean install everything
rm -rf node_modules package-lock.json backend/node_modules backend/package-lock.json
npm run install:all

# Start both frontend and backend
npm run dev:full

# Check if ports are available
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
```

## Environment Variables Checklist

### Frontend (.env.local)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] JWT_SECRET
- [ ] NEXT_PUBLIC_API_URL

### Backend (backend/.env)
- [ ] PORT
- [ ] FRONTEND_URL
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] JWT_SECRET

## Debug Mode

To enable debug mode, add to your environment files:
```bash
DEBUG=true
NODE_ENV=development
```

## Still Having Issues?

1. Check the browser console for specific error messages
2. Check the terminal output for backend errors
3. Verify all environment variables are set correctly
4. Ensure Supabase project is properly configured
5. Try the setup script: `./setup.sh`

## Contact Support

If you're still experiencing issues:
1. Check the GitHub issues page
2. Create a new issue with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Browser/OS information


