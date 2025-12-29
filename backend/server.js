// 🚀 IIN Education Platform - Backend Server

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

const PORT = process.env.PORT || 8080;

// CORS configuration
console.log('🔵 Setting up CORS...');
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
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
export const instance = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// Import routes - Only import files that exist
import adminRoutes from './routes/adminRoutes.js';
// import authRoutes from './routes/authRoutes.js';  // TODO: File doesn't exist yet
import paymentRoutes from './routes/paymentRoutes.js';
import examRoutes from './routes/examRoutes.js';
// import testRoutes from './routes/testRoutes.js';  // TODO: File doesn't exist yet
import questionRoutes from './routes/questionRoutes.js'; // 🔥 NEW OOP Question Routes

// Admin API routes (NEW structure with /admin prefix)
console.log('🔵 Setting up Admin API routes...');
app.use('/api/admin', questionRoutes); // 🔥 Mount OOP question routes
console.log('✅ Question routes mounted (OLD + NEW OOP routes)');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin API routes mounted');

// Mount other API routes
console.log('🔵 Mounting API routes...');
// app.use('/api/auth', authRoutes);  // TODO: Commented out - file doesn't exist
app.use('/api/payment', paymentRoutes);
app.use('/api/exam', examRoutes);
// app.use('/api/test', testRoutes);  // TODO: Commented out - file doesn't exist

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'IIN Education Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      admin: '/api/admin',
      payment: '/api/payment',
      exam: '/api/exam'
    }
  });
});

// Database connection and server start
import { testConnection } from './config/mysql.js';
import { runMigrations } from './config/runMigrations.js';

console.log('🔗 Connecting to database...');
await testConnection();

console.log('🛠️ Running database migrations...');
await runMigrations();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: ${process.env.API_URL || 'http://localhost:8080'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
