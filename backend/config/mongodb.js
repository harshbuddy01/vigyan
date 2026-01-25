// MongoDB Configuration
// Replaces mysql.js with MongoDB/Mongoose setup

import mongoose from 'mongoose';

// 🔵 READ DIRECTLY FROM process.env - MUST be uppercase
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 MongoDB Configuration Loading...');
console.log(`📝 MONGODB_URI exists: ${!!MONGODB_URI}`);
console.log(`📝 MONGODB_URI value: ${MONGODB_URI ? MONGODB_URI.substring(0, 50) + '...' : 'NOT SET'}`);

// MongoDB Connection Options
const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Track connection status
export let isMongoDBConnected = false;
export let lastConnectionError = null;

// Connect to MongoDB
export async function connectDB() {
    // If no URI is set, just log warning and continue
    if (!MONGODB_URI) {
        console.warn('⚠️  MONGODB_URI not configured - running in limited mode');
        console.warn('🔗 Set MONGODB_URI environment variable to enable MongoDB features');
        isMongoDBConnected = false;
        lastConnectionError = 'MONGODB_URI not configured';
        return false; // Indicate DB is not connected
    }

    try {
        console.log('🔗 Attempting MongoDB connection...');
        await mongoose.connect(MONGODB_URI, options);

        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🔗 Host: ${mongoose.connection.host}`);
        isMongoDBConnected = true;
        lastConnectionError = null;
        return true;

    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        console.error('🔍 Check your MONGODB_URI environment variable');
        console.warn('⚠️  App will run without MongoDB - some features may not work');
        isMongoDBConnected = false;
        lastConnectionError = error.message;
        return false; // Don't throw - allow app to continue
    }
}

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('🟢 MongoDB connection established');
    isMongoDBConnected = true;
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
    isMongoDBConnected = false;
});

mongoose.connection.on('disconnected', () => {
    console.log('🔴 MongoDB disconnected');
    isMongoDBConnected = false;
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('👋 MongoDB connection closed through app termination');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

export default mongoose;