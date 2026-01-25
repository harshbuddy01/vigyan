import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n' + '='.repeat(80));
console.log('🔵 ENVIRONMENT CONFIGURATION STARTUP');
console.log('='.repeat(80));

// 🔴 CRITICAL: Check Node environment FIRST
console.log(`\n♾️  NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`🔍 Total environment variables available: ${Object.keys(process.env).length}`);

// 🔧 HOSTINGER FIX: ALWAYS try to load .env file regardless of NODE_ENV
// Hostinger does NOT automatically inject environment variables into process.env
// So we must manually load the .env file from disk
console.log('\n🔧 HOSTINGER COMPATIBILITY MODE: Attempting to load .env file...');

const envPath = path.join(__dirname, '../../.env');
console.log(`   Looking for .env at: ${envPath}`);
console.log(`   File exists: ${fs.existsSync(envPath)}`);

try {
  if (fs.existsSync(envPath)) {
    console.log('   ✅ Found .env file - loading variables...');
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.error('   ❌ Error parsing .env file:', result.error.message);
    } else {
      console.log(`   ✅ Successfully loaded .env file (${Object.keys(result.parsed || {}).length} variables)`);
      if (result.parsed) {
        Object.entries(result.parsed).forEach(([key, value]) => {
          if (key === 'MONGODB_URI') {
            console.log(`      • ${key}: ${value.substring(0, 30)}... [set]`);
          }
        });
      }
    }
  } else {
    console.warn('   ⚠️  .env file NOT found at root backend directory');
    console.warn('   📝 FIX: Create .env file in backend/ with your credentials');
  }
} catch (err) {
  console.error('   ❌ Error reading .env file:', err.message);
}

// 🔴 CRITICAL: Verify what we have now
const requiredVars = {
  'MONGODB_URI': 'Database connection string',
  'RAZORPAY_API_KEY': 'Payment API key',
  'RAZORPAY_API_SECRET': 'Payment API secret',
  'NODE_ENV': 'Application environment',
  'EMAIL_USER': 'Email username',
  'EMAIL_PASSWORD': 'Email password',
  'EMAIL_HOST': 'Email host',
  'EMAIL_PORT': 'Email port',
  'API_URL': 'Backend API URL',
  'FRONTEND_URL': 'Frontend URL',
  'JWT_SECRET': 'JWT secret'
};

console.log('\n' + '='.repeat(80));
console.log('💫 DETAILED ENVIRONMENT VARIABLE CHECK');
console.log('='.repeat(80));

const missingVars = [];
const loadedVars = [];

Object.entries(requiredVars).forEach(([varName, description]) => {
  const value = process.env[varName];
  const exists = !!value;
  
  if (exists) {
    loadedVars.push(varName);
    const displayValue = value.length > 20 
      ? value.substring(0, 20) + '... [' + value.length + ' chars]'
      : value;
    console.log(`✅ ${varName.padEnd(25)} | ${description.padEnd(30)} | '${displayValue}'`);
  } else {
    missingVars.push(varName);
    console.log(`❌ ${varName.padEnd(25)} | ${description.padEnd(30)} | NOT SET`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('📋 SUMMARY');
console.log('='.repeat(80));
console.log(`✅ Loaded: ${loadedVars.length}/${Object.keys(requiredVars).length} variables`);

if (missingVars.length > 0) {
  console.error(`\n⚠️  MISSING CRITICAL VARIABLES: ${missingVars.join(', ')}`);
  console.error('\n😨 FIX INSTRUCTIONS:');
  console.error('  1. Create a file named ".env" in the backend/ directory');
  console.error('  2. Copy all variables from .env.example');
  console.error('  3. Replace values with your actual credentials');
  console.error('  4. Do NOT commit to GitHub (it\'s in .gitignore)');
  console.error('  5. Deploy to Hostinger with the .env file');
  console.error('  6. Wait 3-5 minutes for Hostinger to detect and deploy');
  console.error('\n📝 Required variables:');
  missingVars.forEach((v) => {
    console.error(`     - ${v}`);
  });
  console.error('\n🗑️  App will run with LIMITED FUNCTIONALITY without these variables.\n');
} else {
  console.log('\n✅ ALL REQUIRED ENVIRONMENT VARIABLES ARE SET!');
  console.log(`🌟 Source: .env file loaded successfully`);
  console.log(`🚀 Application ready to start\n`);
}

console.log('='.repeat(80));
console.log('');

export default {};