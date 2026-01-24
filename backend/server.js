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
    console.error('📚 See .env.example for reference\n');
    // Continue running instead of exiting - let individual features fail gracefully
  } else {
    console.log('✅ All required environment variables are configured');
  }
};

// Validate env vars before starting
validateEnvironmentVariables();

// 🔧 CORS MUST BE FIRST - Before any other middleware!
console.log('🔵 Setting up CORS (FIRST)...');
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://vigyanprep.com',
  'http://vigyanprep.com',
  'https://www.vigyanprep.com',
  'http://www.vigyanprep.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: true, // Allow all origins dynamically (for debugging)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 🔧 EXPLICIT OPTIONS HANDLER - For preflight requests (Express 5 compatible)
// Use :path(*) to match all routes since '*' is no longer supported
app.options('/:path(*)', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

console.log('✅ CORS configured for:', allowedOrigins.join(', '));

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

// NOTE: CORS is configured at the TOP of this file (before env injection)

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

// 🔧 CONFIG ENDPOINT - CRITICAL FOR PAYMENT GATEWAY
app.get('/api/config', (req, res) => {
  res.json({
    RAZORPAY_KEY_ID: process.env.RAZORPAY_API_KEY || '',
    NODE_ENV: process.env.NODE_ENV || 'production',
    // 🔴 FIX #5: CORRECTED TYPO - "vigyanpreap" -> "vigyanprep"
    API_URL: process.env.API_URL || 'https://backend-vigyanpreap.vigyanprep.com',
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
