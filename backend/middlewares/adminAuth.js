// backend/middlewares/adminAuth.js
// 🔒 ADMIN AUTHENTICATION MIDDLEWARE
// Protects admin routes from unauthorized access

import jwt from 'jsonwebtoken';

// JWT Configuration
const JWT_SECRET = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'vigyan-prep-admin-secret-change-in-production-min-32-chars';
const JWT_EXPIRES_IN = '24h'; // Admin sessions last 24 hours

/**
 * Verify Admin JWT Token
 * Protects admin routes - must be authenticated as admin
 */
export async function verifyAdminAuth(req, res, next) {
    try {
        // Extract token from multiple sources
        let token = null;

        // 1. Check Authorization header (Bearer token)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.replace('Bearer ', '');
        }

        // 2. Check cookies (HTTP-only cookie - most secure)
        if (!token && req.cookies?.admin_token) {
            token = req.cookies.admin_token;
        }

        // 3. Check body (for backward compatibility)
        if (!token && req.body?.adminToken) {
            token = req.body.adminToken;
        }

        if (!token) {
            console.warn('⚠️ Admin auth failed: No token provided');
            return res.status(401).json({
                success: false,
                message: 'Admin authentication required. Please log in.',
                code: 'NO_ADMIN_TOKEN',
                redirect: '/admin-login.html'
            });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                console.warn('⚠️ Admin token expired');
                return res.status(401).json({
                    success: false,
                    message: 'Admin session expired. Please log in again.',
                    code: 'ADMIN_TOKEN_EXPIRED',
                    redirect: '/admin-login.html'
                });
            }

            console.warn('⚠️ Invalid admin token:', jwtError.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid admin authentication.',
                code: 'INVALID_ADMIN_TOKEN',
                redirect: '/admin-login.html'
            });
        }

        // Verify this is an admin token (not student token)
        if (decoded.role !== 'admin' && decoded.type !== 'admin_access') {
            console.warn('⚠️ Non-admin token used for admin route');
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.',
                code: 'NOT_ADMIN'
            });
        }

        // Verify admin username matches environment
        const expectedAdminUsername = process.env.ADMIN_USERNAME || 'admin';
        if (decoded.username !== expectedAdminUsername) {
            console.warn('⚠️ Invalid admin username in token');
            return res.status(403).json({
                success: false,
                message: 'Invalid admin credentials.',
                code: 'INVALID_ADMIN'
            });
        }

        // Attach admin data to request
        req.admin = {
            username: decoded.username,
            role: 'admin',
            loginTime: decoded.loginTime,
            tokenIssued: decoded.iat
        };

        console.log(`✅ Admin authenticated: ${decoded.username}`);
        next();

    } catch (error) {
        console.error('❌ Admin authentication error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Authentication error. Please try again.',
            code: 'ADMIN_AUTH_ERROR'
        });
    }
}

/**
 * Generate Admin JWT Token
 * Called after successful admin login
 */
export function generateAdminToken(username) {
    try {
        const payload = {
            username: username,
            role: 'admin',
            type: 'admin_access',
            loginTime: Date.now()
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'vigyan-prep-admin'
        });

        console.log(`✅ Generated admin JWT for ${username}`);
        return token;

    } catch (error) {
        console.error('❌ Error generating admin JWT:', error.message);
        throw new Error('Failed to generate admin token');
    }
}

/**
 * Optional: Middleware for super admin only (future use)
 */
export function verifySuperAdmin(req, res, next) {
    if (!req.admin) {
        return res.status(401).json({
            success: false,
            message: 'Admin authentication required.'
        });
    }

    // Future: Check if admin has super admin privileges
    // For now, all admins are super admins
    next();
}

export default {
    verifyAdminAuth,
    generateAdminToken,
    verifySuperAdmin
};
