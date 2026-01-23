// MongoDB Configuration
// Replaces mysql.js with MongoDB/Mongoose setup

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI environment variable!');
    console.error('🔵 Please set MONGODB_URI in your .env file or hosting environment');
    process.exit(1);
}

// MongoDB Connection Options
const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Connect to MongoDB
export async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, options);
        
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🔗 Host: ${mongoose.connection.host}`);
        
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        console.error('🔍 Check your MONGODB_URI environment variable');
        throw error;
    }
}

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔴 MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('👋 MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

export default mongoose;