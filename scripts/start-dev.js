#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Data Marketing Freelance Platform...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Function to log with colors
function log(color, prefix, message) {
  console.log(`${color}${prefix}${colors.reset} ${message}`);
}

// Check if backend directory exists
const backendPath = path.join(__dirname, '..', 'backend');
if (!fs.existsSync(backendPath)) {
  log(colors.red, '[ERROR]', 'Backend directory not found!');
  process.exit(1);
}

// Check if backend package.json exists
const backendPackageJson = path.join(backendPath, 'package.json');
if (!fs.existsSync(backendPackageJson)) {
  log(colors.red, '[ERROR]', 'Backend package.json not found!');
  process.exit(1);
}

let backendProcess, frontendProcess;

// Function to cleanup processes
function cleanup() {
  log(colors.yellow, '[SYSTEM]', 'Shutting down servers...');
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendProcess) {
    frontendProcess.kill();
  }
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start backend server
log(colors.blue, '[BACKEND]', 'Starting backend server...');
backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: backendPath,
  stdio: 'pipe',
  shell: true
});

// Handle backend output
backendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Server running')) {
    log(colors.green, '[BACKEND]', output.trim());
  } else if (output.includes('error') || output.includes('Error')) {
    log(colors.red, '[BACKEND]', output.trim());
  } else if (output.includes('listening') || output.includes('started')) {
    log(colors.green, '[BACKEND]', output.trim());
  } else if (output.trim()) {
    log(colors.blue, '[BACKEND]', output.trim());
  }
});

backendProcess.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('EADDRINUSE')) {
    log(colors.red, '[BACKEND ERROR]', 'Port 3001 is already in use!');
  } else if (output.trim()) {
    log(colors.red, '[BACKEND ERROR]', output.trim());
  }
});

backendProcess.on('close', (code) => {
  if (code !== 0) {
    log(colors.red, '[BACKEND]', `Process exited with code ${code}`);
  }
});

// Start frontend server with delay
setTimeout(() => {
  log(colors.green, '[FRONTEND]', 'Starting frontend server...');
  frontendProcess = spawn('npm', ['run', 'dev:frontend'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
    shell: true
  });

  // Handle frontend output
  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:')) {
      log(colors.green, '[FRONTEND]', output.trim());
    } else if (output.includes('Ready in')) {
      log(colors.green, '[FRONTEND]', output.trim());
    } else if (output.includes('error') || output.includes('Error')) {
      log(colors.red, '[FRONTEND]', output.trim());
    } else if (output.includes('compiled') || output.includes('compiling')) {
      log(colors.cyan, '[FRONTEND]', output.trim());
    } else if (output.trim()) {
      log(colors.cyan, '[FRONTEND]', output.trim());
    }
  });

  frontendProcess.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('EADDRINUSE')) {
      log(colors.red, '[FRONTEND ERROR]', 'Port 3000 is already in use!');
    } else if (output.trim()) {
      log(colors.red, '[FRONTEND ERROR]', output.trim());
    }
  });

  frontendProcess.on('close', (code) => {
    if (code !== 0) {
      log(colors.red, '[FRONTEND]', `Process exited with code ${code}`);
    }
  });

}, 3000); // 3 second delay

// Display startup info
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  log(colors.bright, '[INFO]', 'Servers are starting up...');
  log(colors.cyan, '[INFO]', 'Frontend: http://localhost:3000');
  log(colors.cyan, '[INFO]', 'Backend API: http://localhost:3001');
  log(colors.yellow, '[INFO]', 'Press Ctrl+C to stop both servers');
  console.log('='.repeat(60) + '\n');
}, 1000);