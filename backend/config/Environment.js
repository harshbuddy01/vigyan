/**
 * Environment Configuration Class
 * Created: Dec 29, 2025
 * Purpose: Centralized environment management for Railway → Hostinger migration
 * 
 * BENEFITS:
 * - Single source of truth for all configs
 * - Easy switching between Railway and Hostinger (just change .env)
 * - Validates required environment variables on startup
 * - No code changes needed during migration
 */

import dotenv from 'dotenv';
dotenv.config();

export class Environment {
    constructor() {
        this.loadEnvironment();
    }
    
    loadEnvironment() {
        // Core environment
        this.env = process.env.NODE_ENV || 'development';
        this.isProduction = this.env === 'production';
        this.isDevelopment = this.env === 'development';
        this.port = parseInt(process.env.PORT) || 3000;
        
        // Database Configuration
        // Works with both Railway and Hostinger MySQL
        this.database = {
            host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
            user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
            password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'railway',
            port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
        
        // API URLs - Automatically switches based on environment
        this.apiUrl = this.isProduction 
            ? (process.env.API_URL || 'https://api.iinedu.com')  // Hostinger
            : (process.env.API_URL || 'https://iin-production.up.railway.app'); // Railway
        
        // Frontend URLs
        this.frontendUrl = this.isProduction
            ? 'https://iinedu.vercel.app'
            : 'http://localhost:3000';
        
        // File Upload Configuration
        this.upload = {
            path: process.env.UPLOAD_PATH || './uploads',
            maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || (5 * 1024 * 1024), // 5MB default
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
        };
        
        // Payment Gateway (Razorpay)
        this.razorpay = {
            keyId: process.env.RAZORPAY_KEY_ID || '',
            keySecret: process.env.RAZORPAY_KEY_SECRET || '',
            enabled: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
        };
        
        // Email Configuration (SendGrid)
        this.email = {
            apiKey: process.env.SENDGRID_API_KEY || '',
            fromEmail: process.env.FROM_EMAIL || 'noreply@iinedu.com',
            fromName: process.env.FROM_NAME || 'IIN Education',
            enabled: !!process.env.SENDGRID_API_KEY
        };
        
        // Security
        this.security = {
            jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
            jwtExpiry: process.env.JWT_EXPIRY || '7d',
            bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
        };
        
        // Feature Flags - Easy enable/disable features
        this.features = {
            useOOPQuestions: process.env.USE_OOP_QUESTIONS === 'true',
            useOOPTests: process.env.USE_OOP_TESTS === 'true',
            useOOPStudents: process.env.USE_OOP_STUDENTS === 'true',
            enablePayments: process.env.ENABLE_PAYMENTS !== 'false',
            enableEmailNotifications: process.env.ENABLE_EMAIL !== 'false'
        };
        
        // Logging
        this.logging = {
            level: process.env.LOG_LEVEL || 'info',
            enableConsole: process.env.ENABLE_CONSOLE_LOGS !== 'false',
            enableFile: process.env.ENABLE_FILE_LOGS === 'true'
        };
    }
    
    /**
     * Validate that all required environment variables are present
     * Call this at server startup
     */
    validate() {
        const required = [
            'MYSQLHOST',
            'MYSQLUSER', 
            'MYSQLPASSWORD',
            'MYSQL_DATABASE'
        ];
        
        const missing = required.filter(key => 
            !process.env[key] && !process.env[key.replace('MYSQL', 'DB_')]
        );
        
        if (missing.length > 0) {
            throw new Error(
                `❌ Missing required environment variables: ${missing.join(', ')}\n` +
                `Please check your .env file.`
            );
        }
        
        // Warn about optional but recommended variables
        const recommended = [
            'RAZORPAY_KEY_ID',
            'SENDGRID_API_KEY',
            'JWT_SECRET'
        ];
        
        const missingRecommended = recommended.filter(key => !process.env[key]);
        if (missingRecommended.length > 0 && this.isProduction) {
            console.warn(
                `⚠️  Missing recommended environment variables: ${missingRecommended.join(', ')}\n` +
                `Some features may not work properly.`
            );
        }
        
        return true;
    }
    
    /**
     * Print current configuration (safe - no passwords shown)
     */
    printConfig() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 ENVIRONMENT CONFIGURATION');
        console.log('='.repeat(60));
        console.log(`Environment: ${this.env}`);
        console.log(`Port: ${this.port}`);
        console.log(`API URL: ${this.apiUrl}`);
        console.log(`Frontend URL: ${this.frontendUrl}`);
        console.log('\n📊 DATABASE:');
        console.log(`  Host: ${this.database.host}`);
        console.log(`  Database: ${this.database.database}`);
        console.log(`  User: ${this.database.user}`);
        console.log(`  Port: ${this.database.port}`);
        console.log('\n💳 PAYMENT:');
        console.log(`  Razorpay Enabled: ${this.razorpay.enabled ? '✅' : '❌'}`);
        console.log('\n📧 EMAIL:');
        console.log(`  SendGrid Enabled: ${this.email.enabled ? '✅' : '❌'}`);
        console.log('\n🎛️  FEATURE FLAGS:');
        console.log(`  OOP Questions: ${this.features.useOOPQuestions ? '✅' : '❌'}`);
        console.log(`  OOP Tests: ${this.features.useOOPTests ? '✅' : '❌'}`);
        console.log(`  OOP Students: ${this.features.useOOPStudents ? '✅' : '❌'}`);
        console.log('='.repeat(60) + '\n');
    }
    
    /**
     * Get database connection config
     */
    getDatabaseConfig() {
        return { ...this.database };
    }
    
    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(featureName) {
        return this.features[featureName] === true;
    }
}

// Singleton instance - import this in your code
export const env = new Environment();

// Validate on module load (catches errors early)
try {
    env.validate();
    if (env.logging.enableConsole) {
        env.printConfig();
    }
} catch (error) {
    console.error('❌ Environment configuration error:', error.message);
    process.exit(1);
}

export default env;
