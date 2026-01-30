/**
 * Admin API Service - Complete Backend Integration
 * Backend: Railway (https://vigyan-production.up.railway.app)
 * Updated: 2026-01-26 - VERSION 700 (CACHE BUSTER)
 */
console.log('🚀 AdminAPI Service v700 Loading...');

const AdminAPI = {
    // 🚀 PRODUCTION Hostinger Backend URL
    get baseURL() {
        // Use global configuration or fallback to local
        if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
            return window.APP_CONFIG.API_BASE_URL;
        }
        if (window.API_BASE_URL) {
            return window.API_BASE_URL;
        }

        // Fallback (should not happen if config.js is loaded)
        return 'https://vigyan-production.up.railway.app';
    },

    // Helper method for API calls
    async request(endpoint, options = {}) {
        const defaultOptions = {
            credentials: 'include',  // ✅ Send cookies for authentication
            headers: {
                'Content-Type': 'application/json'
                // ✅ REMOVED: Authorization header - backend uses cookies
            }
        };

        try {
            const fullURL = `${this.baseURL}${endpoint}`;
            console.log(`🔗 API Request: ${fullURL}`);

            const response = await fetch(fullURL, {
                ...defaultOptions,
                ...options,
                headers: { ...defaultOptions.headers, ...options.headers }
            });

            console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response Error:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ API Response:', data);
            return data;
        } catch (error) {
            console.error('❌ API Error:', error.message);
            console.error('   Endpoint:', endpoint);
            console.error('   Base URL:', this.baseURL);
            console.error('   Full Error:', error);
            throw error;
        }
    },

    // ✅ REMOVED: getAuthToken() - No longer needed with cookie-based auth

    // ==================== DASHBOARD ====================
    async getDashboardStats() {
        return await this.request('/api/admin/dashboard/stats');
    },

    async getPerformanceData(period = '7d') {
        return await this.request(`/api/admin/dashboard/performance?period=${period}`);
    },

    async getUpcomingTests() {
        return await this.request('/api/admin/dashboard/upcoming-tests');
    },

    async getRecentActivity() {
        return await this.request('/api/admin/dashboard/recent-activity');
    },

    // ==================== ADMIN PROFILE ====================
    async getAdminProfile() {
        return await this.request('/api/admin/profile');
    },

    async updateAdminProfile(profileData) {
        return await this.request('/api/admin/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    async changePassword(passwordData) {
        return await this.request('/api/admin/profile/password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    },

    // ==================== NOTIFICATIONS ====================
    async getNotifications() {
        return await this.request('/api/admin/dashboard/notifications');
    },

    async getNotificationsCount() {
        return await this.request('/api/admin/dashboard/notifications/count');
    },

    async markNotificationRead(notificationId) {
        return await this.request(`/api/admin/dashboard/notifications/${notificationId}/read`, {
            method: 'POST'
        });
    },

    async markAllNotificationsRead() {
        return await this.request('/api/admin/dashboard/notifications/mark-all-read', {
            method: 'POST'
        });
    },

    // ==================== TESTS ====================
    async createTest(testData) {
        return await this.request('/api/admin/tests', {
            method: 'POST',
            body: JSON.stringify(testData)
        });
    },

    async getTests(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/api/admin/tests?${params}`);
    },

    async getTest(testId) {
        return await this.request(`/api/admin/tests/${testId}`);
    },

    async updateTest(testId, testData) {
        return await this.request(`/api/admin/tests/${testId}`, {
            method: 'PUT',
            body: JSON.stringify(testData)
        });
    },

    async deleteTest(testId) {
        return await this.request(`/api/admin/tests/${testId}`, {
            method: 'DELETE'
        });
    },

    // ==================== SCHEDULED TESTS ====================
    async getScheduledTests() {
        return await this.request('/api/admin/scheduled-tests');
    },

    async scheduleTest(scheduleData) {
        return await this.request('/api/admin/scheduled-tests', {
            method: 'POST',
            body: JSON.stringify(scheduleData)
        });
    },

    async updateScheduledTest(scheduleId, scheduleData) {
        return await this.request(`/api/admin/scheduled-tests/${scheduleId}`, {
            method: 'PUT',
            body: JSON.stringify(scheduleData)
        });
    },

    async deleteScheduledTest(scheduleId) {
        return await this.request(`/api/admin/scheduled-tests/${scheduleId}`, {
            method: 'DELETE'
        });
    },

    // ==================== PAST TESTS ====================
    async getPastTests() {
        return await this.request('/api/admin/past-tests');
    },

    async archivePastTest(testId) {
        return await this.request(`/api/admin/past-tests/${testId}/archive`, {
            method: 'POST'
        });
    },

    // ==================== QUESTIONS ====================
    async addQuestion(questionData) {
        return await this.request('/api/admin/questions', {
            method: 'POST',
            body: JSON.stringify(questionData)
        });
    },

    async getQuestions(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/api/admin/questions?${params}`);
    },

    async getQuestion(questionId) {
        return await this.request(`/api/admin/questions/${questionId}`);
    },

    async updateQuestion(questionId, questionData) {
        return await this.request(`/api/admin/questions/${questionId}`, {
            method: 'PUT',
            body: JSON.stringify(questionData)
        });
    },

    async deleteQuestion(questionId) {
        return await this.request(`/api/admin/questions/${questionId}`, {
            method: 'DELETE'
        });
    },

    // ==================== STUDENTS ====================
    async addStudent(studentData) {
        return await this.request('/api/admin/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
    },

    async getStudents(search = '') {
        return await this.request(`/api/admin/students?search=${encodeURIComponent(search)}`);
    },

    async getStudent(studentId) {
        return await this.request(`/api/admin/students/${studentId}`);
    },

    async updateStudent(studentId, studentData) {
        return await this.request(`/api/admin/students/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });
    },

    async deleteStudent(studentId) {
        return await this.request(`/api/admin/students/${studentId}`, {
            method: 'DELETE'
        });
    },

    // ==================== TRANSACTIONS ====================
    async getTransactions(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/api/admin/transactions?${params}`);
    },

    async getTransaction(transactionId) {
        return await this.request(`/api/admin/transactions/${transactionId}`);
    },

    // ==================== RESULTS ====================
    async getResults(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/api/admin/results?${params}`);
    },

    async getResult(resultId) {
        return await this.request(`/api/admin/results/${resultId}`);
    },

    async getStudentResults(studentId) {
        return await this.request(`/api/admin/students/${studentId}/results`);
    },

    // ==================== FILE UPLOADS ====================
    async uploadPDF(file, metadata) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify(metadata));

        return await this.request('/api/admin/upload/pdf', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    },

    async uploadImage(file, metadata) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify(metadata));

        return await this.request('/api/admin/upload/image', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    },

    // ==================== SPECIFIC PDF MODULE ENDPOINTS ====================
    // Matches upload-pdf.js requirements
    async uploadPdf(formData) {
        return await this.request('/api/pdf/upload', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type
        });
    },

    async getPdfHistory() {
        return await this.request('/api/pdf/history');
    },

    async deletePdf(uploadId) {
        return await this.request(`/api/pdf/delete/${uploadId}`, {
            method: 'DELETE'
        });
    },

    // ==================== QUESTION IMAGE LINKING ====================
    // Matches upload-image.js requirements
    async uploadQuestionImage(questionId, linkData) {
        return await this.request(`/api/admin/questions/${questionId}/image`, {
            method: 'POST',
            body: JSON.stringify(linkData)
        });
    },

    // ==================== HEALTH CHECK ====================
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            console.error('❌ Backend health check failed:', error);
            return false;
        }
    }
};

// Make it globally available
window.AdminAPI = AdminAPI;

// Log the backend URL being used
console.log('🚀 Admin API Service initialized');
console.log('🔗 Backend URL:', AdminAPI.baseURL);
console.log('🌍 Environment:', window.location.hostname === 'localhost' ? 'Local' : 'Production');

// Check backend health on load
AdminAPI.checkHealth().then(healthy => {
    if (healthy) {
        console.log('✅ Backend is healthy and reachable');
    } else {
        console.warn('⚠️ Backend health check failed - server may be starting up');
    }
});