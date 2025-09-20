#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js Frontend Only (API Routes Integrated)...\n');

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

let frontendProcess;

// Function to cleanup processes
function cleanup() {
  log(colors.yellow, '[SYSTEM]', 'Shutting down Next.js server...');
  if (frontendProcess) {
    frontendProcess.kill();
  }
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start Next.js server without Turbopack
log(colors.green, '[NEXT.JS]', 'Starting Next.js development server...');
frontendProcess = spawn('next', ['dev', '--port', '3000'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'pipe',
  shell: true
});

// Handle frontend output
frontendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Local:')) {
    log(colors.green, '[NEXT.JS]', output.trim());
  } else if (output.includes('Ready in')) {
    log(colors.green, '[NEXT.JS]', output.trim());
  } else if (output.includes('error') || output.includes('Error')) {
    log(colors.red, '[NEXT.JS]', output.trim());
  } else if (output.includes('compiled') || output.includes('compiling')) {
    log(colors.cyan, '[NEXT.JS]', output.trim());
  } else if (output.trim()) {
    log(colors.cyan, '[NEXT.JS]', output.trim());
  }
});

frontendProcess.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('EADDRINUSE')) {
    log(colors.red, '[NEXT.JS ERROR]', 'Port 3000 is already in use!');
  } else if (output.trim()) {
    log(colors.red, '[NEXT.JS ERROR]', output.trim());
  }
});

frontendProcess.on('close', (code) => {
  if (code !== 0) {
    log(colors.red, '[NEXT.JS]', `Process exited with code ${code}`);
  }
});

// Display startup info
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  log(colors.bright, '[INFO]', 'Next.js Full-Stack Application Starting...');
  log(colors.cyan, '[INFO]', 'Application: http://localhost:3000');
  log(colors.cyan, '[INFO]', 'API Routes: http://localhost:3000/api');
  log(colors.green, '[INFO]', 'All backend functionality integrated into Next.js API routes');
  log(colors.yellow, '[INFO]', 'Press Ctrl+C to stop the server');
  console.log('='.repeat(60) + '\n');
}, 1000);