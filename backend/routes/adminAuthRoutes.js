/**
 * Admin Authentication Routes
 * Created: 2026-01-26
 * Purpose: Handle admin login and session management
 * Routes: /api/admin/auth/*
 */

import express from 'express';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Admin credentials from environment or defaults
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    // Default password: 'admin123' (hashed with bcrypt)
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2a$10$X8h1jBqPqEQxV.6lY7bQz.Yz7e8TwKWVxJvqDkR5YJ0gLZXg1K1LS'
};

console.log('🔐 Admin Auth routes loaded');
console.log('👤 Admin username:', ADMIN_CREDENTIALS.username);
console.log('⚠️  Using default password: admin123 (Change in production!)');

/**
 * POST /api/admin/auth/login
 * Admin login endpoint
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('🔐 Admin login attempt:', { username, timestamp: new Date().toISOString() });

        // Validation
        if (!username || !password) {
            console.warn('❌ Login failed: Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Check username
        if (username !== ADMIN_CREDENTIALS.username) {
            console.warn('❌ Login failed: Invalid username:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);

        if (!isPasswordValid) {
            console.warn('❌ Login failed: Invalid password for user:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Successful login
        console.log('✅ Admin login successful:', username);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                username: username,
                role: 'admin',
                loginTime: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Admin login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

/**
 * POST /api/admin/auth/validate-session
 * Validate if admin session is still active
 */
router.post('/validate-session', (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username required'
            });
        }

        console.log('🔍 Session validation for:', username);

        // In a real app, check session in database/Redis
        // For now, just validate username exists
        if (username === ADMIN_CREDENTIALS.username) {
            return res.status(200).json({
                success: true,
                message: 'Session valid',
                data: {
                    username: username,
                    sessionActive: true
                }
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid session'
        });

    } catch (error) {
        console.error('❌ Session validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * POST /api/admin/auth/logout
 * Handle admin logout
 */
router.post('/logout', (req, res) => {
    try {
        const { username } = req.body;

        console.log('🚪 Admin logout:', username || 'unknown');

        // In a real app, clear session from database/Redis

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('❌ Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * POST /api/admin/auth/generate-hash
 * Utility endpoint to generate password hash
 * 
 * Usage: 
 * curl -X POST http://localhost:3000/api/admin/auth/generate-hash \
 *   -H "Content-Type: application/json" \
 *   -d '{"password": "your-new-password"}'
 */
router.post('/generate-hash', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password required'
            });
        }

        console.log('🔑 Generating password hash...');
        const hash = await bcrypt.hash(password, 10);

        console.log('✅ Hash generated successfully');

        return res.status(200).json({
            success: true,
            hash: hash,
            message: 'Add this hash to your .env file as ADMIN_PASSWORD_HASH',
            instructions: {
                step1: 'Copy the hash above',
                step2: 'Add to backend/.env: ADMIN_PASSWORD_HASH=<hash>',
                step3: 'Restart your backend server',
                step4: 'Test login with new password'
            }
        });

    } catch (error) {
        console.error('❌ Hash generation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * GET /api/admin/auth/test
 * Test endpoint to verify auth routes are working
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Admin auth routes are working!',
        timestamp: new Date().toISOString(),
        defaultCredentials: {
            username: 'admin',
            password: 'admin123',
            warning: 'Change these in production!'
        }
    });
});

export default router;