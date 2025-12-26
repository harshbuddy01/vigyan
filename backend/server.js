import express from "express";
import { config } from "dotenv";
import Razorpay from "razorpay";
import cors from "cors";
import path from "path";               
import { fileURLToPath } from "url";   

// 👇 DATABASE CONNECTION
import { connectDB, pool } from "./config/mysql.js"; 
import { runMigrations } from "./config/runMigrations.js";
import { sendFeedbackEmail, sendUserConfirmation } from "./config/email.js";

// Route Imports
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

console.log('🔵 Loading environment variables...');
config();

console.log('🔵 Creating Express app...');
const app = express();

console.log('🔵 Setting up CORS...');
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 204
}));

console.log('🔵 Setting up body parsers...');
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 🔥 CRITICAL: Super simple health check that MUST work
app.get('/health', (req, res) => {
  console.log('✅ Health check hit!');
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  console.log('✅ Root endpoint hit!');
  res.status(200).json({ 
    status: 'running',
    message: 'IIN Backend API is alive',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  console.log('✅ API health check hit!');
  res.status(200).json({ 
    status: 'ok',
    database: 'MySQL',
    timestamp: new Date().toISOString()
  });
});

console.log('🔵 Initializing Razorpay...');
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY || "dummy_id",
  key_secret: process.env.RAZORPAY_API_SECRET || "dummy_secret",
});

console.log('🔵 Setting up verify-user-full route...');
app.post("/api/verify-user-full", async (req, res) => {
  try {
    const { email, rollNumber } = req.body;
    console.log('🔍 Verify request:', { email, rollNumber });
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        status: 'ERROR',
        message: 'Valid email is required' 
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await pool.query(
      "SELECT * FROM students_payments WHERE email = ?", 
      [normalizedEmail]
    );
    
    if (rows.length === 0) {
      return res.json({ status: "NEW_USER" }); 
    }

    const student = rows[0];
    
    if (!rollNumber) {
      return res.json({ status: "EXISTING_USER_NEED_ROLL" }); 
    }
    
    if (student.roll_number === rollNumber) {
      return res.json({ status: "VERIFIED" });
    } else {
      return res.json({ status: "WRONG_ROLL" });
    }
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ 
      success: false, 
      status: 'ERROR',
      message: 'Server error' 
    });
  }
});

console.log('🔵 Setting up feedback route...');
app.post("/api/feedback", async (req, res) => {
  try {
    const { email, rollNumber, testId, ratings, comment } = req.body;
    const feedbackData = { email, rollNumber, testId, ratings, comment };
    
    try {
        await sendFeedbackEmail(feedbackData);
        await sendUserConfirmation(email.toLowerCase());
    } catch (emailError) {
        console.error("❌ Email failed:", emailError);
    }

    res.json({ success: true, message: "Feedback submitted" });
  } catch (error) {
    console.error("Feedback Error:", error);
    res.status(500).json({ success: false });
  }
});

console.log('🔵 Mounting API routes...');
app.use("/api", paymentRoutes);
console.log('✅ Payment routes mounted');

app.use("/api", adminRoutes);
console.log('✅ Admin routes mounted');

app.use("/api", examRoutes);
console.log('✅ Exam routes mounted at /api/exam/*');

console.log('🔵 Setting up static files...');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../")));

console.log('🔵 Setting up error handler...');
app.use(errorHandler);

// 🔥 CRITICAL: Catch any unhandled errors
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
});

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

console.log('🔵 Starting server initialization...');
console.log(`🔵 Will listen on ${HOST}:${PORT}`);

// 🔥 Try to start server EVEN if database fails
(async () => {
  try {
    console.log('🔗 Attempting database connection...');
    await connectDB();
    console.log('✅ Database connected!');
    
    console.log('🛠️ Running migrations...');
    await runMigrations();
    console.log('✅ Migrations complete!');
  } catch (dbError) {
    console.error('⚠️ Database error (continuing anyway):', dbError.message);
  }
  
  try {
    const server = app.listen(PORT, HOST, () => {
      console.log('\n🎉🎉🎉 SERVER STARTED SUCCESSFULLY! 🎉🎉🎉');
      console.log(`✅ Listening on ${HOST}:${PORT}`);
      console.log(`✅ Health endpoint: http://${HOST}:${PORT}/health`);
      console.log(`✅ Root endpoint: http://${HOST}:${PORT}/`);
      console.log(`✅ API health: http://${HOST}:${PORT}/api/health`);
      console.log(`✅ Exam routes available at: /api/exam/*`);
      console.log('\n🚀 Ready to accept connections!\n');
    });
    
    server.on('error', (error) => {
      console.error('❌ SERVER ERROR:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    });
    
    // Test if server is actually listening
    server.on('listening', () => {
      const addr = server.address();
      console.log(`✅ Server confirmed listening on ${addr.address}:${addr.port}`);
    });
    
  } catch (serverError) {
    console.error('❌ FAILED TO START SERVER:', serverError);
    console.error('Stack:', serverError.stack);
    process.exit(1);
  }
})();