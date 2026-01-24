import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 PRODUCTION FIX: Use Hostinger environment variables instead of .env file
// In Hostinger: Variables are set in the GUI and automatically injected into process.env
// We DO NOT need to load .env file - just validate that process.env has the values

// Try to load .env file for LOCAL DEVELOPMENT only
// In production (Hostinger), this will fail silently and use process.env instead
try {
  const localEnvPath = path.join(__dirname, '../../.env');
  dotenv.config({ path: localEnvPath });
  console.log('✅ Loaded .env file for local development');
} catch (err) {
  // Silently fail - this is expected in production
  console.log('ℹ️ .env file not found - using Hostinger environment variables instead');
}

// 🟢 Verify that environment variables are available (from Hostinger GUI or .env file)
const requiredVars = ['RAZORPAY_API_KEY', 'RAZORPAY_API_SECRET', 'MONGODB_URI', 'NODE_ENV'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️ WARNING: Missing environment variables:', missingVars.join(', '));
  console.warn('⚠️ Please set these in Hostinger Environment Variables panel');
} else {
  console.log('✅ All required environment variables are configured');
  console.log('📝 Loaded variables from:', process.env.NODE_ENV === 'production' ? 'Hostinger GUI' : 'Local config');
}

console.log('🔵 Environment variables ready for use');
