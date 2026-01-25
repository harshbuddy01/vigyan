// MongoDB Configuration
// Replaces mysql.js with MongoDB/Mongoose setup

import mongoose from 'mongoose';

// 🔴 CRITICAL FIX: Read environment variables at RUNTIME, not at module load
// This ensures Hostinger has had time to inject the variables

// Track connection status
export let isMongoDBConnected = false;
export let lastConnectionError = null;

// MongoDB Connection Options
const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
};

// 🔵 GET MONGODB_URI AT RUNTIME (when connectDB is called)
function getMongoDUri() {
    const uri = process.env.MONGODB_URI;
    
    console.log('🔍 MongoDB URI Check:');
    console.log(`   process.env.MONGODB_URI exists: ${!!uri}`);
    
    if (uri) {
        console.log(`   URI length: ${uri.length} characters`);
        console.log(`   URI prefix: ${uri.substring(0, 30)}...`);
        console.log(`   ✅ MONGODB_URI is SET`);
    } else {
        console.log(`   ❌ MONGODB_URI is NOT SET in process.env`);
        console.log(`   Available env keys: ${Object.keys(process.env).slice(0, 10).join(', ')}...`);
    }
    
    return uri;
}

// Connect to MongoDB
export async function connectDB() {
    // 🔵 READ AT RUNTIME - not at module load time
    const MONGODB_URI = getMongoDUri();
    
    // If no URI is set, just log warning and continue
    if (!MONGODB_URI) {
        console.warn('⚠️  MONGODB_URI not configured - running in limited mode');
        console.warn('🔗 Set MONGODB_URI environment variable to enable MongoDB features');
        isMongoDBConnected = false;
        lastConnectionError = 'MONGODB_URI not configured';
        return false; // Indicate DB is not connected
    }

    try {
        console.log('🔗 Attempting to connect to MongoDB...');
        console.log(`   Connection string starts with: ${MONGODB_URI.substring(0, 20)}...`);
        
        await mongoose.connect(MONGODB_URI, options);

        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🔗 Host: ${mongoose.connection.host}`);
        isMongoDBConnected = true;
        lastConnectionError = null;
        return true;

    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        
        // 🔴 DETAILED ERROR LOGGING FOR DEBUGGING
        if (error.message.includes('getaddrinfo ENOTFOUND')) {
            console.error('⚠️  Error: Cannot resolve MongoDB host - network/DNS issue');
            console.error('   Check if MONGODB_URI is correctly formatted');
            console.error('   Example: mongodb+srv://username:password@cluster.mongodb.net/dbname');
        } else if (error.message.includes('authentication failed')) {
            console.error('⚠️  Error: Authentication failed - username or password incorrect');
        } else if (error.message.includes('timeout')) {
            console.error('⚠️  Error: Connection timeout - MongoDB server may be down');
        }
        
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
    console.error('❌ MongoDB connection error:', err.message);
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