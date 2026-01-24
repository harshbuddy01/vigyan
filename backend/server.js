// 🚀 Vigyan.prep Platform - Backend Server
// ✅ UPDATED: MongoDB Migration Complete!

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
console.log('🔵 Loading environment variables...');
dotenv.config();

const app = express();
console.log('🔵 Creating Express app...');

const PORT = process.env.PORT || 3000;

// 🔴 FIX #4: VALIDATE CRITICAL ENVIRONMENT VARIABLES AT STARTUP
const validateEnvironmentVariables = () => {
  const requiredVars = {
    'RAZORPAY_API_KEY': 'Payment gateway (Razorpay) API Key',
    'RAZORPAY_API_SECRET': 'Payment gateway (Razorpay) API Secret',
    'MONGODB_URI': 'MongoDB database connection URI',
    'NODE_ENV': 'Application environment (development/production)',
  };

  const missingVars = [];
  for (const [varName, description] of Object.entries(requiredVars)) {
    if (!process.env[varName]) {
      missingVars.push(`${varName} (${description})`);
    }
  }

  // Email vars are optional but warn if missing
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email credentials not configured - email notifications will be disabled');
  }

  if (missingVars.length > 0) {
    console.error('\n❌ FATAL: Missing required environment variables:');
    missingVars.forEach((v, i) => console.error(`   ${i + 1}. ${v}`));
    console.error('\n📝 Please set these variables in your .env file or hosting environment');
    console.error('📚 See .env.example for reference\n');
    process.exit(1); // Stop the server
  }

  console.log('✅ All required environment variables are configured');
};

// Validate env vars before starting
validateEnvironmentVariables();

// CORS configuration - Updated for Hostinger deployment
console.log('🔵 Setting up CORS...');
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://vigyanprep.com',
    'http://vigyanprep.com',
    'https://www.vigyanprep.com',
    'http://www.vigyanprep.com',
    'https://31.97.101.169',
    'http://31.97.101.169',
    'https://iinedu.vercel.app',
    'https://api.iinedu.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
console.log('🔵 Setting up body parsers...');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Razorpay and export for controllers
console.log('🔵 Initializing Razorpay...');
export const instance = process.env.RAZORPAY_API_KEY && process.env.RAZORPAY_API_SECRET
  ? new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
  })
  : null;

if (instance) {
  console.log('✅ Razorpay initialized successfully');
} else {
  console.warn('⚠️ Razorpay not initialized - Missing API credentials');
}

// Import routes - Only import files that exist
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import examRoutes from './routes/examRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import migrationRoute from './routes/migrationRoute.js';
import newsRoutes from './routes/newsRoutes.js';
import authRoutes from './routes/authRoutes.js';

// 🔧 INJECT ENVIRONMENT VARIABLES INTO HTML FILES
// This middleware injects environment variables into the browser at runtime
app.get('/*.html', (req, res, next) => {
  const filePath = path.join(__dirname, `../${req.path}`);
  
  try {
    let html = fs.readFileSync(filePath, 'utf8');
    
    const envScript = `
    <script>
      window.__ENV__ = {
        API_URL: "${process.env.API_URL || 'https://vigyanprep.com:3000'}",
        ENVIRONMENT: "${process.env.NODE_ENV || 'production'}",
        DEBUG: ${process.env.DEBUG_MODE === 'true' ? 'true' : 'false'}
      };
      console.log('🔧 Environment loaded:', window.__ENV__);
    </script>`;
    
    html = html.replace('</head>', envScript + '\n</head>');
    res.send(html);
  } catch (err) {
    next(); // Continue to next handler if file not found
  }
});

// 🔧 CONFIG ENDPOINT - CRITICAL FOR PAYMENT GATEWAY
app.get('/api/config', (req, res) => {
  res.json({
    RAZORPAY_KEY_ID: process.env.RAZORPAY_API_KEY || '',
    NODE_ENV: process.env.NODE_ENV || 'production',
    // 🔴 FIX #5: CORRECTED TYPO - "vigyanpreap" -> "vigyanprep"
    API_URL: process.env.API_URL || 'https://backend-vigyanprep.vigyanprep.com',
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://vigyanprep.com'
  });
});

// Admin API routes (NEW structure with /admin prefix)
console.log('🔵 Setting up Admin API routes...');
app.use('/api/admin', questionRoutes);
console.log('✅ Question routes mounted (OLD + NEW OOP routes)');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin API routes mounted');
app.use('/api/admin', migrationRoute);
console.log('✅ Migration endpoint mounted');

// Mount other API routes
console.log('🔵 Mounting API routes...');
app.use('/api', authRoutes);
console.log('✅ Auth routes mounted - /api/verify-user-full');
app.use('/api/payment', paymentRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/news', newsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'MongoDB',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve Static Frontend Files
console.log('🔵 Configuring static file serving...');

// 1. Serve 'frontend' folder (CSS, JS, Images)
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// 2. Serve specific HTML files from root
app.get('/:page.html', (req, res) => {
  const filePath = path.join(__dirname, `../${req.params.page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      req.next();
    }
  });
});

// 3. Root endpoint - Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// 4. API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Vigyan.prep Platform API',
    version: '2.0.0',
    database: 'MongoDB',
    endpoints: {
      health: '/health',
      config: '/api/config',
      admin: '/api/admin',
      payment: '/api/payment',
      exam: '/api/exam',
      news: '/api/news',
      auth: '/api/verify-user-full'
    }
  });
});

// ✅ MONGODB CONNECTION (Replaced MySQL)
import { connectDB, isMongoDBConnected } from './config/mongodb.js';

// ✅ Wrap async operations in IIFE to avoid top-level await
(async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
      console.warn('⚠️  MongoDB not connected - running in limited mode');
      console.warn('🔗 Some features will not work without MongoDB');
    } else {
      console.log('✅ MongoDB ready - No migrations needed!');
    }

    // 🔴 FIX #7: VALIDATE ROUTES ARE LOADED
    if (!app._router || app._router.stack.length < 10) {
      console.warn('⚠️  Warning: Some routes may not be properly mounted');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`📊 Database: MongoDB ${isMongoDBConnected ? '(Connected)' : '(Not Connected)'}`);
      console.log(`📏 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: ${process.env.API_URL || 'http://localhost:' + PORT}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('\n🟢 Server is ready to accept requests\n');
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    console.error('📝 Full error:', error);
    process.exit(1);
  }
})();

export default app;
