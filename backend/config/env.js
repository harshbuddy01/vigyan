import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n' + '='.repeat(80));
console.log('🔵 ENVIRONMENT CONFIGURATION STARTUP');
console.log('='.repeat(80));

// 🔄 Try multiple possible .env locations
const possiblePaths = [
  path.join(__dirname, '../.env'),           // backend/.env
  path.join(__dirname, '../../.env'),        // root .env
  path.join(process.cwd(), '.env'),          // working directory .env
  path.join(process.cwd(), 'backend/.env'),  // working dir + backend/.env
];

console.log('\n🔍 Searching for .env file in multiple locations:');
let envPath = null;
for (const testPath of possiblePaths) {
  console.log(`   Trying: ${testPath}`);
  if (fs.existsSync(testPath)) {
    console.log(`   ✅ FOUND at: ${testPath}`);
    envPath = testPath;
    break;
  } else {
    console.log(`   ❌ Not found`);
  }
}

if (!envPath) {
  console.error('\n❌ .env file NOT FOUND in any location!');
  console.error('   Searched:');
  possiblePaths.forEach(p => console.error(`   - ${p}`));
  console.error('\n😨 App will run with limited functionality\n');
} else {
  console.log(`\n🔧 Loading .env from: ${envPath}`);
  try {
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.error('   ❌ Error parsing .env file:', result.error.message);
    } else {
      const varCount = Object.keys(result.parsed || {}).length;
      console.log(`   ✅ Successfully loaded ${varCount} variables from .env file`);
      
      if (result.parsed && result.parsed.MONGODB_URI) {
        console.log(`   ✅ MONGODB_URI: ${result.parsed.MONGODB_URI.substring(0, 40)}...`);
      }
    }
  } catch (err) {
    console.error('   ❌ Error reading .env file:', err.message);
  }
}

// 🔴 Verify environment variables
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
console.log('💫 ENVIRONMENT VARIABLE STATUS');
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
    console.log(`✅ ${varName.padEnd(25)} | ${displayValue}`);
  } else {
    missingVars.push(varName);
    console.log(`❌ ${varName.padEnd(25)} | NOT SET`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('📋 SUMMARY');
console.log('='.repeat(80));
console.log(`✅ Loaded: ${loadedVars.length}/${Object.keys(requiredVars).length} variables`);

if (missingVars.length > 0) {
  console.error(`\n⚠️  MISSING: ${missingVars.join(', ')}`);
  console.error('\n🔗 App will run with LIMITED FUNCTIONALITY\n');
} else {
  console.log('\n✅ ALL ENVIRONMENT VARIABLES LOADED SUCCESSFULLY!');
  console.log('🚀 Application ready to start\n');
}

console.log('='.repeat(80));
console.log('');

export default {};