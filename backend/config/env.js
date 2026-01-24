import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔵 Loading environment variables...');
console.log(`🔍 NODE_ENV from process.env: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`🔍 Total env vars in process.env: ${Object.keys(process.env).length}`);

// 🔧 HOSTINGER FIX: In production, environment variables should already be in process.env
// Only try to load .env file if in development (local machine)
if (process.env.NODE_ENV !== 'production') {
  console.log('📁 Development mode - attempting to load .env file...');
  try {
    const result = dotenv.config({ path: path.join(__dirname, '../../.env') });
    if (result.error) {
      console.log('⚠️  No .env file found (this is OK in production)');
    } else {
      console.log('✅ Loaded .env file for local development');
    }
  } catch (err) {
    console.log('ℹ️  .env file not accessible:', err.message);
  }
} else {
  console.log('🏭 Production mode - using Hostinger environment variables from process.env');
  console.log('🔍 Checking if Hostinger variables are injected...');
}

// 🟢 DEBUG: Log which variables are available (without showing values)
const criticalVars = ['RAZORPAY_API_KEY', 'RAZORPAY_API_SECRET', 'MONGODB_URI', 'NODE_ENV', 'EMAIL_USER', 'EMAIL_PASSWORD'];
console.log('\n📋 Environment Variable Status:');
criticalVars.forEach(varName => {
  const exists = !!process.env[varName];
  const value = process.env[varName];
  if (exists) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 10)}... (length: ${value.length})`);
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
  }
});

// Verify that environment variables are available
const missingCritical = criticalVars.filter(varName => !process.env[varName]);

if (missingCritical.length > 0) {
  console.error('\n⚠️ WARNING: Missing environment variables:', missingCritical.join(', '));
  console.error('⚠️ Please set these in Hostinger > Websites > Your Site > Deployments > Settings');
  console.error('⚠️ After setting them, you MUST click "Redeploy" or "Restart"');
  console.error('\n📚 The app will continue running but some features will not work.\n');
} else {
  console.log('\n✅ All critical environment variables are loaded successfully');
  console.log(`📝 Source: ${process.env.NODE_ENV === 'production' ? 'Hostinger Environment Variables' : 'Local .env file'}\n`);
}

export default {};
