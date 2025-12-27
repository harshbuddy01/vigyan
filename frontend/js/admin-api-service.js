/**
 * IIN Admin Dashboard - API Service Layer
 * Handles all backend communication
 */

const API_BASE_URL = 'https://iin-production.up.railway.app/api';

class AdminAPIService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Generic API call handler with error management
     */
    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // DASHBOARD STATS
    // ============================================

    async getDashboardStats() {
        // Mock data for now - replace with actual API call
        return {
            success: true,
            data: {
                activeTests: 24,
                studentsEnrolled: 1250,
                todaysExams: 3,
                monthlyRevenue: 240000
            }
        };
    }

    // ============================================
    // TEST MANAGEMENT
    // ============================================

    async getAllTests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.apiCall(`/tests?${queryString}`);
    }

    async getTestById(testId) {
        return await this.apiCall(`/tests/${testId}`);
    }

    async createTest(testData) {
        return await this.apiCall('/tests', {
            method: 'POST',
            body: JSON.stringify(testData)
        });
    }

    async updateTest(testId, testData) {
        return await this.apiCall(`/tests/${testId}`, {
            method: 'PUT',
            body: JSON.stringify(testData)
        });
    }

    async deleteTest(testId) {
        return await this.apiCall(`/tests/${testId}`, {
            method: 'DELETE'
        });
    }

    async getUpcomingTests() {
        // Mock data
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: 'NEST Exam',
                    date: '2025-12-28',
                    startTime: '10:00 AM',
                    endTime: '1:00 PM',
                    registeredStudents: 120
                },
                {
                    id: 2,
                    name: 'IAT Exam',
                    date: '2026-01-01',
                    startTime: '2:00 PM',
                    endTime: '5:00 PM',
                    registeredStudents: 89
                },
                {
                    id: 3,
                    name: 'ISI Exam',
                    date: '2026-01-15',
                    startTime: '9:00 AM',
                    endTime: '12:00 PM',
                    registeredStudents: 45
                }
            ]
        };
    }

    // ============================================
    // QUESTION BANK
    // ============================================

    async getAllQuestions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.apiCall(`/questions?${queryString}`);
    }

    async getQuestionById(questionId) {
        return await this.apiCall(`/questions/${questionId}`);
    }

    async createQuestion(questionData) {
        return await this.apiCall('/questions', {
            method: 'POST',
            body: JSON.stringify(questionData)
        });
    }

    async updateQuestion(questionId, questionData) {
        return await this.apiCall(`/questions/${questionId}`, {
            method: 'PUT',
            body: JSON.stringify(questionData)
        });
    }

    async deleteQuestion(questionId) {
        return await this.apiCall(`/questions/${questionId}`, {
            method: 'DELETE'
        });
    }

    async uploadQuestionImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${this.baseURL}/upload/question-image`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // STUDENT MANAGEMENT
    // ============================================

    async getAllStudents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.apiCall(`/users?${queryString}`);
    }

    async getStudentById(studentId) {
        return await this.apiCall(`/users/${studentId}`);
    }

    async createStudent(studentData) {
        return await this.apiCall('/users', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
    }

    async updateStudent(studentId, studentData) {
        return await this.apiCall(`/users/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });
    }

    async deleteStudent(studentId) {
        return await this.apiCall(`/users/${studentId}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // RESULTS & ANALYTICS
    // ============================================

    async getTestResults(testId) {
        return await this.apiCall(`/results/test/${testId}`);
    }

    async getStudentResults(studentId) {
        return await this.apiCall(`/results/student/${studentId}`);
    }

    async getAnalytics(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.apiCall(`/analytics?${queryString}`);
    }

    async getPerformanceTrend() {
        // Mock data for chart
        return {
            success: true,
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
                datasets: [
                    {
                        label: 'Average Score',
                        data: [65, 72, 70, 78, 82, 85, 88],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Participation Rate',
                        data: [80, 85, 82, 88, 90, 92, 95],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }
                ]
            }
        };
    }

    // ============================================
    // FINANCIAL
    // ============================================

    async getAllTransactions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.apiCall(`/transactions?${queryString}`);
    }

    async getPendingPayments() {
        return await this.apiCall('/transactions/pending');
    }

    async getFinancialReports(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.apiCall(`/reports/financial?${queryString}`);
    }

    // ============================================
    // RECENT ACTIVITY
    // ============================================

    async getRecentActivity() {
        // Mock data
        return {
            success: true,
            data: [
                {
                    id: 1,
                    type: 'test_completion',
                    icon: 'check-circle',
                    color: 'blue',
                    message: '<strong>15 students</strong> completed NEST exam',
                    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    type: 'registration',
                    icon: 'user-plus',
                    color: 'green',
                    message: 'New student registered: <strong>John Doe</strong>',
                    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
                },
                {
                    id: 3,
                    type: 'payment',
                    icon: 'rupee-sign',
                    color: 'purple',
                    message: 'Payment received: <strong>₹2,999</strong>',
                    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
                },
                {
                    id: 4,
                    type: 'question_upload',
                    icon: 'file-upload',
                    color: 'orange',
                    message: '<strong>25 new questions</strong> added to Physics',
                    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
                },
                {
                    id: 5,
                    type: 'test_scheduled',
                    icon: 'calendar-plus',
                    color: 'blue',
                    message: 'New test scheduled: <strong>NEST Mock 5</strong>',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return this.formatDate(dateString);
    }
}

// Create global instance
window.adminAPI = new AdminAPIService();