#!/usr/bin/env node

/**
 * NannyRadar App Testing Startup Script
 * 
 * This script helps you start both backend and frontend for testing
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 NannyRadar App Testing Startup');
console.log('=================================\n');

// Check if directories exist
const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'babysitting-app');

if (!fs.existsSync(backendDir)) {
  console.log('❌ Backend directory not found!');
  process.exit(1);
}

if (!fs.existsSync(frontendDir)) {
  console.log('❌ Frontend directory not found!');
  process.exit(1);
}

console.log('📁 Directories found:');
console.log(`   ✅ Backend: ${backendDir}`);
console.log(`   ✅ Frontend: ${frontendDir}\n`);

// Function to run command
function runCommand(command, args, cwd, name) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Starting ${name}...`);
    console.log(`   Command: ${command} ${args.join(' ')}`);
    console.log(`   Directory: ${cwd}\n`);

    const process = spawn(command, args, {
      cwd: cwd,
      stdio: 'inherit',
      shell: true
    });

    process.on('error', (error) => {
      console.log(`❌ Error starting ${name}:`, error.message);
      reject(error);
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${name} started successfully`);
        resolve();
      } else {
        console.log(`❌ ${name} exited with code ${code}`);
        reject(new Error(`${name} failed`));
      }
    });
  });
}

// Main startup function
async function startTesting() {
  try {
    console.log('📦 Installing dependencies...\n');

    // Install backend dependencies
    console.log('🔧 Installing backend dependencies...');
    await runCommand('npm', ['install'], backendDir, 'Backend Dependencies');

    // Install frontend dependencies
    console.log('📱 Installing frontend dependencies...');
    await runCommand('npm', ['install'], frontendDir, 'Frontend Dependencies');

    console.log('\n🎉 Dependencies installed successfully!\n');

    console.log('🚀 Starting servers...\n');

    // Start backend server
    console.log('🔧 Starting backend server...');
    const backendProcess = spawn('npm', ['run', 'start:dev'], {
      cwd: backendDir,
      stdio: 'inherit',
      shell: true
    });

    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start frontend server
    console.log('📱 Starting frontend server...');
    const frontendProcess = spawn('npm', ['start'], {
      cwd: frontendDir,
      stdio: 'inherit',
      shell: true
    });

    console.log('\n🎯 Testing Information:');
    console.log('======================');
    console.log('🌐 Frontend URL: http://localhost:19006');
    console.log('🔧 Backend URL: http://localhost:3001');
    console.log('📚 API Docs: http://localhost:3001/api/docs');
    console.log('\n🧪 Test Credentials:');
    console.log('Parent: jennifer.parent@test.com / TestParent123!');
    console.log('Sitter: sarah.sitter@test.com / TestSitter123!');
    console.log('\n📱 Quick Test Access:');
    console.log('1. Open app → Tap "🧪 Quick Test" on splash screen');
    console.log('2. Or navigate to QuickTest screen in app');
    console.log('\n⚡ Ready for testing! Press Ctrl+C to stop servers.');

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping servers...');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });

  } catch (error) {
    console.log('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

// Start the testing environment
startTesting();
