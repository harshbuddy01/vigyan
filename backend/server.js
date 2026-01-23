// 🚀 Vigyan.prep Platform - Backend Server

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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
// import authRoutes from './routes/authRoutes.js';  // TODO: File doesn't exist yet
import paymentRoutes from './routes/paymentRoutes.js';
import examRoutes from './routes/examRoutes.js';
// import testRoutes from './routes/testRoutes.js';  // TODO: File doesn't exist yet
import questionRoutes from './routes/questionRoutes.js'; // 🔥 NEW OOP Question Routes
import migrationRoute from './routes/migrationRoute.js'; // 🔧 One-time migration endpoint
import newsRoutes from './routes/newsRoutes.js'; // 📰 New News Route

// Admin API routes (NEW structure with /admin prefix)
console.log('🔵 Setting up Admin API routes...');
app.use('/api/admin', questionRoutes); // 🔥 Mount OOP question routes
console.log('✅ Question routes mounted (OLD + NEW OOP routes)');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin API routes mounted');
app.use('/api/admin', migrationRoute); // 🔧 Migration endpoint
console.log('✅ Migration endpoint mounted');

// Mount other API routes
console.log('🔵 Mounting API routes...');
// app.use('/api/auth', authRoutes);  // TODO: Commented out - file doesn't exist
app.use('/api/payment', paymentRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/news', newsRoutes); // 📰 News Endpoint
// app.use('/api/test', testRoutes);  // TODO: Commented out - file doesn't exist

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve Static Frontend Files
// This allows the Node.js app to serve the entire website
console.log('🔵 Configuring static file serving...');

// 1. Serve 'frontend' folder (CSS, JS, Images)
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// 2. Serve specific HTML files from root (e.g., aboutpage.html)
app.get('/:page.html', (req, res) => {
  const filePath = path.join(__dirname, `../${req.params.page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      // If file not found, pass to next handler (404)
      req.next();
    }
  });
});

// 3. Root endpoint - Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// 4. API Info endpoint (Moved to /api)
app.get('/api', (req, res) => {
  res.json({
    message: 'Vigyan.prep Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      admin: '/api/admin',
      payment: '/api/payment',
      exam: '/api/exam',
      news: '/api/news'
    }
  });
});

// Database connection and server start
import { connectDB } from './config/mysql.js';  // ✅ FIXED: Use connectDB not testConnection
import { runMigrations } from './config/runMigrations.js';

console.log('🔗 Connecting to database...');
await connectDB();  // ✅ FIXED

console.log('🛠️ Running database migrations...');
await runMigrations();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: ${process.env.API_URL || 'http://localhost:' + PORT}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;