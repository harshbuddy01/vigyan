// 🚀 Vigyan.prep Platform - Backend Server
// ✅ UPDATED: MongoDB Migration Complete!
// 🔥 HOTFIX: Removed broken OPTIONS handler - Jan 25, 2026 7:18 PM IST
// 🔥 PAYMENT FIX: Improved CORS for payment endpoint - Jan 26, 2026 1:55 AM IST
// 🔥 ADMIN AUTH: Added admin authentication routes - Jan 26, 2026 1:59 AM IST

import './config/env.js'; // 🔵 LOAD ENV VARS FIRST
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🛠️ STARTUP LOGGING (File-based for Hostinger debugging)
const LOG_FILE = path.join(__dirname, '../startup_log.txt');
function logStartup(message) {
  const timestamp = new Date().toISOString();
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
  } catch (err) {
    // Ignore logging errors
  }
}

logStartup('🚀 STARTING BACKEND SERVER.JS');
logStartup(`Running on Node ${process.version}`);
logStartup(`Env PORT: ${process.env.PORT}`);
// 🔍 DEBUG: Log ALL Environment Keys (but not values to avoid leaking secrets)
const envKeys = Object.keys(process.env).sort();
logStartup(`Available Env Keys: ${envKeys.join(', ')}`);
if (envKeys.length < 5) {
  logStartup('⚠️ WARNING: Environment seems empty! Hostinger vars not injected?');
}

// Load environment variables
console.log('🔵 Loading environment variables...');
// Environment variables are already loaded by config/env.js

const app = express();
console.log('🔵 Creating Express app...');

// 🔧 CRITICAL FIX #1: Enable trust proxy for Hostinger (fixes rate-limit warnings)
app.set('trust proxy', true);
console.log('✅ Trust proxy enabled for Hostinger');

const PORT = process.env.PORT || 3000;

// 🔴 VALIDATE ENVIRONMENT VARIABLES (non-fatal - logs warnings instead of exiting)
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
    console.error('\n⚠️ WARNING: Missing environment variables:');
    missingVars.forEach((v, i) => console.error(`   ${i + 1}. ${v}`));
    console.error('\n📝 Some features may not work correctly.');
    console.warn('⚠️  Hostinger Tip: Ensure variables are set in the Hosting Panel, NOT just in .env');
    console.error('📚 See .env.example for reference\n');
    // Continue running instead of exiting - let individual features fail gracefully
  } else {
    console.log('✅ All required environment variables are configured');
  }
};

// Validate env vars before starting
validateEnvironmentVariables();

// 🔧 CRITICAL FIX #2: ENHANCED CORS Configuration - MUST BE FIRST middleware!
console.log('🔵 Setting up CORS...');
const allowedOrigins = [
  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',

  // Production domains - ALL VARIATIONS
  'https://vigyanprep.com',
  'http://vigyanprep.com',
  'https://www.vigyanprep.com',
  'http://www.vigyanprep.com',

  // Backend domain (for API calls)
  'https://backend-vigyanpreap.vigyanprep.com',
  'http://backend-vigyanpreap.vigyanprep.com',

  // Environment variable
  process.env.FRONTEND_URL
].filter(Boolean);

// 🔧 ENHANCED: More permissive CORS for Hostinger deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin (same-origin/Postman)');
      return callback(null, true);
    }

    // Check if origin is in whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS: Allowed whitelisted origin: ${origin}`);
      return callback(null, true);
    }

    // 🔧 FIX: In production, allow all vigyanprep.com subdomains
    if (origin.includes('vigyanprep.com')) {
      console.log(`✅ CORS: Allowing vigyanprep.com subdomain: ${origin}`);
      return callback(null, true);
    }

    // 🔧 CRITICAL: Allow all origins in production for Hostinger (temporary fix)
    console.warn(`⚠️ CORS: Allowing non-whitelisted origin: ${origin}`);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // Cache preflight for 10 minutes
  preflightContinue: false,
  optionsSuccessStatus: 200  // 🔥 FIX: Changed from 204 to 200 for better compatibility
};

// Apply CORS middleware
app.use(cors(corsOptions));

// 🔥 PAYMENT FIX: Explicit preflight handling for payment endpoint
app.options('/api/payment/checkout', cors(corsOptions));
app.options('/api/payment/paymentverification', cors(corsOptions));
app.options('/api/payment/getkey', cors(corsOptions));
app.options('/api/admin/*', cors(corsOptions)); // 🔥 ADMIN FIX: Allow preflight for all admin routes

console.log('✅ CORS configured for:', allowedOrigins.filter(Boolean).join(', '));
console.log('✅ CORS: Allowing all vigyanprep.com subdomains');
console.log('✅ Payment endpoints have explicit preflight handling');

// 🔧 INJECT ENVIRONMENT VARIABLES INTO HTML FILES - MUST BE FIRST MIDDLEWARE
// This middleware injects environment variables into the browser at runtime
console.log('🔵 Setting up environment injection middleware...');
app.use((req, res, next) => {
  // Only intercept HTML file requests
  if (req.path.endsWith('.html') || req.path === '/' || !req.path.includes('.')) {
    const filePath = req.path === '/'
      ? path.join(__dirname, '../index.html')
      : path.join(__dirname, `..${req.path}`);

    try {
      if (fs.existsSync(filePath)) {
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
        return res.send(html);
      }
    } catch (err) {
      console.warn('⚠️ Error injecting environment:', err.message);
    }
  }
  next();
});
console.log('✅ Environment injection middleware ready');

// Body parsing middleware
console.log('🔵 Setting up body parsers...');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Razorpay is initialized in config/razorpay.js
// This prevents circular dependencies
console.log('✅ Server startup sequence continuing...');

// Import routes - Only import files that exist
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import examRoutes from './routes/examRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import migrationRoute from './routes/migrationRoute.js';
import newsRoutes from './routes/newsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';

// ✅ NEW ADMIN ROUTES - Added Jan 25, 2026
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import resultRoutes from './routes/resultRoutes.js';

// 🔧 CONFIG ENDPOINT - CRITICAL FOR PAYMENT GATEWAY
app.get('/api/config', (req, res) => {
  res.json({
    RAZORPAY_KEY_ID: process.env.RAZORPAY_API_KEY || '',
    NODE_ENV: process.env.NODE_ENV || 'production',
    API_URL: process.env.API_URL || 'https://backend-vigyanpreap.vigyanprep.com',
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://vigyanprep.com'
  });
});

// Admin API routes (OLD structure)
console.log('🔵 Setting up Admin API routes...');
app.use('/api/admin', questionRoutes);
console.log('✅ Question routes mounted (OLD + NEW OOP routes)');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin API routes mounted');
app.use('/api/admin/migration', migrationRoute);
console.log('✅ Migration endpoint mounted');

// ✅ NEW ADMIN ROUTES - Full Admin Panel Support (FIXED PATHS)
import pdfRoutes from './routes/pdf.js'; // Import PDF routes

app.use('/api/admin/dashboard', adminDashboardRoutes); // ✅ FIXED: Added /dashboard prefix
console.log('✅ Admin Dashboard routes mounted at /api/admin/dashboard/*');

app.use('/api/admin/students', studentRoutes); // ✅ FIXED: Added /students prefix
console.log('✅ Student routes mounted at /api/admin/students/*');

app.use('/api/admin/transactions', transactionRoutes); // ✅ FIXED: Added /transactions prefix
console.log('✅ Transaction routes mounted at /api/admin/transactions/*');

app.use('/api/admin/results', resultRoutes); // ✅ FIXED: Added /results prefix
console.log('✅ Result routes mounted at /api/admin/results/*');

// ✅ PDF Routes
app.use('/api/pdf', pdfRoutes);
console.log('✅ PDF routes mounted at /api/pdf/*');


// Mount other API routes
console.log('🔵 Mounting API routes...');
app.use('/api', authRoutes);
console.log('✅ Auth routes mounted - /api/verify-user-full');
app.use('/api/admin/auth', adminAuthRoutes);
console.log('✅ Admin auth routes mounted - /api/admin/auth/*');
app.use('/api/payment', paymentRoutes);
console.log('✅ Payment routes mounted - /api/payment/*');
app.use('/api/exam', examRoutes);
console.log('✅ Exam routes mounted - /api/exam/*');
app.use('/api/news', newsRoutes);
console.log('✅ News routes mounted - /api/news/*');

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
      auth: '/api/verify-user-full',
      adminAuth: '/api/admin/auth'
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
    // const dbConnected = false;

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
      const msg = `✅ Server running on port ${PORT}`;
      logStartup(msg);
      logStartup(`Database: ${isMongoDBConnected ? 'Connected' : 'Not Connected'}`);
      console.log(`\n${msg}`);
      console.log(`📊 Database: MongoDB ${isMongoDBConnected ? '(Connected)' : '(Not Connected)'}`);
      console.log(`📏 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: ${process.env.API_URL || 'http://localhost:' + PORT}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('\n🟢 Server is ready to accept requests\n');
    });
  } catch (error) {
    console.error('❌ Server startup issue:', error.message);
    console.error('📝 Full error:', error);
    console.warn('⚠️ Server will attempt to continue running...');

    // Try to start the server anyway on a basic port
    try {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n⚠️ Server running on port ${PORT} in degraded mode`);
        console.log('🔗 Some features may not work correctly\n');
      });
    } catch (listenErr) {
      console.error('❌ Could not start server:', listenErr.message);
    }
  }
})();

export default app;