# Data Marketing Freelance Platform

A comprehensive web application for managing data marketing freelancers, lead submissions, and ownership tracking with advanced features like hot lead detection and admin controls.

## 🚀 Features

### For Marketers
- **User Registration/Login** - Secure JWT-based authentication
- **Data Submission** - Submit lead data with multiple file attachments
- **Dashboard** - View personal statistics and recent submissions
- **Submission Management** - Track ownership status and follow-up progress
- **Hot Leads** - View high-value leads submitted by multiple marketers
- **File Upload** - Upload supporting documents and screenshots

### For Admins
- **Marketer Management** - Create, update, and manage marketer accounts
- **Data Overview** - View all submissions with advanced filtering
- **Statistics Dashboard** - Comprehensive analytics and reporting
- **Ownership Override** - Resolve conflicts and reassign data ownership
- **Override Logs** - Track all admin actions and changes
- **Export Capabilities** - Export data to CSV/Excel formats

### Core Features
- **Smart Ownership Rules** - Automatic ownership validation and conflict resolution
- **Hot Lead Detection** - Identify high-value leads from multiple submissions
- **Time-based Locks** - 30-day ownership expiration for inactive leads
- **Duplicate Detection** - Prevent and manage duplicate submissions
- **File Storage** - Secure cloud storage for submission attachments
- **Responsive Design** - Mobile and desktop optimized interface

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### Database & Storage
- **Supabase** - PostgreSQL database and authentication
- **Supabase Storage** - File storage solution
- **Row Level Security (RLS)** - Database security policies

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd data-marketing-freelance

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Navigate to Settings > API to get your project URL and keys
4. Go to SQL Editor and run the schema from `supabase-schema.sql`

### 3. Configure Environment Variables

Create `.env.local` in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Create `backend/.env`:

```env
# Backend Environment Variables
PORT=3001
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
```

### 4. Set up Supabase Storage

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `submission-files`
3. Set the bucket to public
4. Configure RLS policies for the bucket

### 5. Run the Application

**Recommended (starts both servers automatically):**
```bash
npm run dev
```

**Alternative run commands:**
```bash
npm run dev:simple     # Simple mode (less verbose output)
npm run dev:concurrent # Using concurrently package
npm run dev:frontend   # Frontend only
npm run dev:backend    # Backend only
```

**Manual start (if needed):**
```bash
# Start the backend server (in one terminal)
cd backend
npm run dev

# Start the frontend development server (in another terminal)
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📊 Database Schema

The application uses the following main tables:

- **users** - User accounts (admin/marketer)
- **submissions** - Lead data submissions
- **submission_files** - File attachments
- **status_logs** - Status change history
- **override_logs** - Admin override actions

## 🔐 Authentication & Authorization

- **JWT-based authentication** with 7-day token expiration
- **Role-based access control** (admin vs marketer)
- **Protected routes** with automatic redirects
- **Password hashing** with bcryptjs

## 📱 User Roles

### Admin
- Full access to all features
- Manage marketer accounts
- View all submissions and statistics
- Override ownership conflicts
- Export data and generate reports

### Marketer
- Submit and manage own data
- View personal dashboard and statistics
- Track submission status and follow-ups
- View hot leads for reference

## 🔄 Ownership Rules

1. **New phone number** → Owned by submitting marketer
2. **Duplicate number (< 2 months)** → Stays with original marketer
3. **Duplicate number (> 2 months)** → Ownership transfers to new marketer
4. **3+ submissions of same number** → Marked as Hot Lead
5. **30-day inactivity** → Ownership expires and becomes available

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with automatic builds

### Database
- Supabase handles database hosting and scaling automatically

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Submissions
- `GET /api/submissions` - Get user's submissions
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/:id` - Update submission
- `POST /api/submissions/:id/files` - Upload files

### Admin
- `GET /api/admin/submissions` - Get all submissions
- `GET /api/admin/marketers` - Get all marketers
- `POST /api/admin/marketers` - Create marketer
- `GET /api/admin/stats` - Get dashboard statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- Real-time notifications
- Advanced analytics and reporting
- Mobile app development
- Integration with CRM systems
- Automated follow-up scheduling
- Lead scoring algorithms