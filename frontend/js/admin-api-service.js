/**
 * Admin API Service - Complete Backend Integration
 * UPDATED: Points to Railway backend in production
 */

const AdminAPI = {
    // 🔥 CRITICAL FIX: Use Railway backend URL
    get baseURL() {
        // If running locally, use local backend
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8080';
        }
        
        // 🚀 PRODUCTION: Point to Railway backend
        // Replace this with your actual Railway backend URL
        const RAILWAY_BACKEND_URL = 'https://iin-production.up.railway.app';
        
        // You can also use environment variable if configured
        return window.BACKEND_URL || RAILWAY_BACKEND_URL;
    },
    
    // Helper method for API calls
    async request(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        };
        
        try {
            const fullURL = `${this.baseURL}${endpoint}`;
            console.log(`🔵 API Request: ${fullURL}`);
            
            const response = await fetch(fullURL, {
                ...defaultOptions,
                ...options,
                headers: { ...defaultOptions.headers, ...options.headers }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ API Response:', data);
            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            console.error('Endpoint:', endpoint);
            console.error('Base URL:', this.baseURL);
            throw error;
        }
    },
    
    getAuthToken() {
        const auth = sessionStorage.getItem('adminAuth') || localStorage.getItem('adminAuth');
        return auth ? JSON.parse(auth).token || 'demo-token' : 'demo-token';
    },
    
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
    }
};

// Make it globally available
window.AdminAPI = AdminAPI;

// Log the backend URL being used
console.log('🚀 Admin API Service initialized');
console.log('🔗 Backend URL:', AdminAPI.baseURL);