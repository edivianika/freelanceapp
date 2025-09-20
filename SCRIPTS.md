# Scripts Documentation

## Available Scripts

### Development Scripts

#### `npm run dev` (Recommended)
- **Description**: Starts both frontend and backend servers with colored output and error handling
- **Features**: 
  - Colored console output for easy debugging
  - Automatic error detection
  - Graceful shutdown with Ctrl+C
  - 3-second delay between backend and frontend startup
- **Usage**: `npm run dev`

#### `npm run dev:test`
- **Description**: Simple test mode for starting both servers
- **Features**: 
  - Clean output
  - Inherited stdio for better debugging
  - 3-second delay between servers
- **Usage**: `npm run dev:test`

#### `npm run dev:simple`
- **Description**: Simple mode with minimal output
- **Features**: 
  - Less verbose output
  - 2-second delay between servers
- **Usage**: `npm run dev:simple`

#### `npm run dev:concurrent`
- **Description**: Uses concurrently package to run both servers
- **Features**: 
  - Parallel execution
  - Colored output per service
  - No delay between servers
- **Usage**: `npm run dev:concurrent`

### Individual Server Scripts

#### `npm run dev:frontend`
- **Description**: Starts only the Next.js frontend server
- **Port**: 3000
- **Usage**: `npm run dev:frontend`

#### `npm run dev:backend`
- **Description**: Starts only the Express.js backend server
- **Port**: 3001
- **Usage**: `npm run dev:backend`

### Build Scripts

#### `npm run build`
- **Description**: Builds the Next.js application for production
- **Usage**: `npm run build`

#### `npm run start`
- **Description**: Starts the production Next.js server
- **Usage**: `npm run start`

### Utility Scripts

#### `npm run install:all`
- **Description**: Installs dependencies for both frontend and backend
- **Usage**: `npm run install:all`

#### `npm run lint`
- **Description**: Runs ESLint to check for code issues
- **Usage**: `npm run lint`

## Quick Start Guide

### First Time Setup
```bash
# Install all dependencies
npm run install:all

# Start both servers
npm run dev
```

### Daily Development
```bash
# Just start both servers
npm run dev
```

### Debugging
```bash
# Use test mode for better debugging
npm run dev:test

# Or start servers individually
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
```

## Troubleshooting

### Port Already in Use
If you get "EADDRINUSE" errors:
```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Then try again
npm run dev
```

### Script Not Working
If scripts don't work:
```bash
# Make sure scripts are executable
chmod +x scripts/*.js

# Try simple mode
npm run dev:simple
```

### Backend Not Starting
If backend fails to start:
```bash
# Check backend dependencies
cd backend
npm install

# Start backend manually
npm run dev
```

## Environment Variables

Make sure you have the following files configured:
- `.env.local` (frontend)
- `backend/.env` (backend)

See the main README.md for detailed setup instructions.

## Output Examples

### `npm run dev` Output
```
🚀 Starting Data Marketing Freelance Platform...

[BACKEND] Starting backend server...
[BACKEND] Server running on port 3001
[FRONTEND] Starting frontend server...
[FRONTEND] Ready in 2.3s
[FRONTEND] Local: http://localhost:3000

============================================================
[INFO] Servers are starting up...
[INFO] Frontend: http://localhost:3000
[INFO] Backend API: http://localhost:3001
[INFO] Press Ctrl+C to stop both servers
============================================================
```

### `npm run dev:test` Output
```
🚀 Testing Data Marketing Freelance Platform...

1. Starting backend server...
Server running on port 3001

2. Starting frontend server...
Ready in 2.3s
Local: http://localhost:3000
```


