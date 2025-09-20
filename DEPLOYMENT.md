# Deployment Guide - Freelance App

## 🚀 Deploy to Vercel

### Prerequisites
1. GitHub account with repository: https://github.com/edivianika/freelanceapp.git
2. Vercel account (free tier available)
3. Supabase project with database setup

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `edivianika/freelanceapp` repository

### Step 2: Configure Environment Variables
In Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_API_URL=/api
```

### Step 3: Deploy Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x or later

### Step 4: Database Setup
Make sure your Supabase database has these tables:
- `users` (with authentication)
- `submissions` (with duplicate tracking)
- `project_interest` (project management)

### Step 5: Deploy
Click "Deploy" and wait for build to complete.

## 🔧 Environment Variables Details

### Required Variables:
1. **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase anonymous key (public)
3. **SUPABASE_SERVICE_ROLE_KEY**: Supabase service role key (private)
4. **JWT_SECRET**: Secret for JWT token signing
5. **NEXT_PUBLIC_API_URL**: API base URL (use `/api` for Vercel)

### Getting Supabase Keys:
1. Go to your Supabase project
2. Navigate to Settings → API
3. Copy the required keys from the API settings

## 🌐 Post-Deployment

### Test the Application:
1. Visit your Vercel deployment URL
2. Test login functionality
3. Test submission forms
4. Verify admin features

### Common Issues:
1. **Environment Variables**: Double-check all env vars are set
2. **Database Connection**: Ensure Supabase is accessible
3. **API Routes**: Verify all API endpoints work
4. **Authentication**: Test JWT token generation

## 📱 Features Available:
- User authentication (login/register)
- Role-based access (admin/marketer)
- Data submission with duplicate detection
- Admin dashboard with statistics
- Marketer management
- Project interest management
- Clean duplicate display

## 🔗 URLs:
- **Repository**: https://github.com/edivianika/freelanceapp.git
- **Live Demo**: https://your-app.vercel.app (after deployment)

## 🆘 Support:
If you encounter issues during deployment, check:
1. Build logs in Vercel dashboard
2. Environment variables are correctly set
3. Database tables are properly created
4. All dependencies are installed