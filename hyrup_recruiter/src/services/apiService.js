import { auth } from '../config/firebase';

// Base API URL - replace with your actual backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
    constructor() {
        this.baseURL = BASE_URL;
    }

    // Helper method to get Firebase auth token
    async getAuthToken() {
        try {
            const user = auth.currentUser;
            if (user) {
                return await user.getIdToken();
            }
            return null;
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    // Helper method for making authenticated requests
    async makeRequest(endpoint, options = {}) {
        const token = await this.getAuthToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const url = `${this.baseURL}${endpoint}`;

        console.log(`Making API request to: ${url}`);
        console.log('Request config:', { ...config, headers: { ...config.headers } });

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Network error' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    // Helper method for public (non-authenticated) requests
    async makePublicRequest(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        const url = `${this.baseURL}${endpoint}`;

        console.log(`Making public API request to: ${url}`);
        console.log('Request config:', { ...config, headers: { ...config.headers } });

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Network error' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Public API request failed: ${endpoint}`, error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    // Helper method for file uploads
    async uploadFile(endpoint, formData) {
        const token = await this.getAuthToken();

        const config = {
            method: 'POST',
            headers: {},
            body: formData,
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Network error' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`File upload failed: ${endpoint}`, error);
            throw error;
        }
    }

    // ============ AUTHENTICATION ============

    // Check if user exists
    async checkUser() {
        return this.makeRequest('/student/check');
    }

    // ============ RECRUITER ROUTES ============

    // Recruiter signup
    async recruiterSignup(data) {
        return this.makeRequest('/recruiter/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Recruiter login
    async recruiterLogin() {
        return this.makeRequest('/recruiter/login', {
            method: 'POST',
        });
    }

    // Post job
    async postJob(jobData) {
        return this.makeRequest('/recruiter/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
    }

    // Get applications
    async getApplications() {
        return this.makeRequest('/recruiter/jobs');
    }

    // Update application status
    async updateApplicationStatus(applicationId, status) {
        return this.makeRequest(`/recruiter/applications/${applicationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    // ============ COMPANY ROUTES ============

    // Check if user is already registered by Firebase UID (public endpoint)
    async checkUserRegistration(uid) {
        return this.makePublicRequest(`/company/check-registration/${uid}`);
    }

    // Register company (public endpoint - no auth required)
    async registerCompany(companyData) {
        return this.makePublicRequest('/company/register', {
            method: 'POST',
            body: JSON.stringify(companyData),
        });
    }

    // Get company by UID (public endpoint - no auth required)
    async getCompanyByUID(uid) {
        return this.makePublicRequest(`/company/by-uid/${uid}`);
    }

    // Get all companies
    async getCompanies() {
        return this.makeRequest('/company/');
    }

    // Get company by ID
    async getCompany(companyId) {
        return this.makeRequest(`/company/${companyId}`);
    }

    // Update company
    async updateCompany(companyId, updateData) {
        return this.makeRequest(`/company/${companyId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    // Get company jobs
    async getCompanyJobs(companyId, params = {}) {
        const searchParams = new URLSearchParams(params);
        return this.makeRequest(`/company/${companyId}/jobs?${searchParams}`);
    }

    // Get company recruiters
    async getCompanyRecruiters(companyId) {
        return this.makeRequest(`/company/${companyId}/recruiters`);
    }

    // Delete company
    async deleteCompany(companyId) {
        return this.makeRequest(`/company/${companyId}`, {
            method: 'DELETE',
        });
    }

    // ============ JOB ROUTES ============

    // Create job(s)
    async createJobs(jobData) {
        return this.makeRequest('/jobs/', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
    }

    // Get all jobs
    async getAllJobs() {
        return this.makeRequest('/jobs/');
    }

    // ============ STUDENT ROUTES ============

    // Student signup
    async studentSignup(data) {
        return this.makeRequest('/student/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Student login
    async studentLogin() {
        return this.makeRequest('/student/login', {
            method: 'POST',
        });
    }

    // Add skills to student profile
    async addSkills(skillName) {
        return this.makeRequest('/student/addSkills', {
            method: 'POST',
            body: JSON.stringify({ skillName }),
        });
    }

    // Verify skills manually
    async verifySkills(skillName, level) {
        return this.makeRequest('/student/verifySkills', {
            method: 'POST',
            body: JSON.stringify({ skillName, level }),
        });
    }

    // Reset skill back to unverified
    async resetSkill(skillName) {
        return this.makeRequest('/student/resetSkill', {
            method: 'POST',
            body: JSON.stringify({ skillName }),
        });
    }

    // Get student details
    async getStudentDetails() {
        return this.makeRequest('/student/StudentDetails', {
            method: 'POST',
        });
    }

    // Get jobs for students
    async getStudentJobs() {
        return this.makeRequest('/student/jobs');
    }

    // Get hackathons
    async getHackathons() {
        return this.makeRequest('/student/hackathons');
    }

    // Apply to job
    async applyToJob(jobId, jobType, applicationData) {
        return this.makeRequest(`/student/jobs/${jobId}/${jobType}/apply`, {
            method: 'POST',
            body: JSON.stringify(applicationData),
        });
    }

    // Update student profile
    async updateStudentProfile(profileData) {
        return this.makeRequest('/student/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // Upload profile photo
    async uploadProfilePhoto(photoFile) {
        const formData = new FormData();
        formData.append('profilePhoto', photoFile);
        return this.uploadFile('/student/upload-profile-photo', formData);
    }

    // Get saved jobs
    async getSavedJobs() {
        return this.makeRequest('/student/saves');
    }

    // Get applied jobs
    async getAppliedJobs() {
        return this.makeRequest('/student/fetchappliedjobs');
    }

    // Get student applications
    async getStudentApplications(params = {}) {
        const searchParams = new URLSearchParams(params);
        return this.makeRequest(`/student/applications?${searchParams}`);
    }

    // Get application counts
    async getApplicationCounts() {
        return this.makeRequest('/student/applications/counts');
    }

    // Get application counts by status
    async getApplicationCountsByStatus(status) {
        return this.makeRequest(`/student/applications/counts/${status}`);
    }

    // Get student analytics
    async getStudentAnalytics() {
        return this.makeRequest('/student/analytics');
    }

    // ============ SKILLS ROUTES ============

    // Get skills
    async getSkills() {
        return this.makeRequest('/skills/getSkills');
    }

    // Get job preferences
    async getJobPreferences() {
        return this.makeRequest('/skills/JobPrefernce');
    }

    // Get assessment questions
    async getAssessmentQuestions(level, skill) {
        const params = new URLSearchParams({ lvl: level, skill });
        return this.makeRequest(`/skills/questions?${params}`);
    }

    // Submit quiz results
    async submitQuiz(quizData) {
        return this.makeRequest('/skills/submitQuiz', {
            method: 'POST',
            body: JSON.stringify(quizData),
        });
    }

    // ============ COLLEGE ROUTES ============

    // College signup
    async collegeSignup(data) {
        return this.makeRequest('/college/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // College login
    async collegeLogin() {
        return this.makeRequest('/college/login', {
            method: 'POST',
        });
    }

    // Get college students
    async getCollegeStudents(params = {}) {
        const searchParams = new URLSearchParams(params);
        return this.makeRequest(`/college/students?${searchParams}`);
    }

    // Get student details by ID
    async getCollegeStudentDetails(studentId) {
        return this.makeRequest(`/college/students/${studentId}`);
    }

    // Post on-campus opportunity
    async postOnCampusOpportunity(opportunityData) {
        return this.makeRequest('/college/opportunities', {
            method: 'POST',
            body: JSON.stringify(opportunityData),
        });
    }

    // Get college opportunities
    async getCollegeOpportunities() {
        return this.makeRequest('/college/opportunities');
    }

    // Update college profile
    async updateCollegeProfile(profileData) {
        return this.makeRequest('/college/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // Get college analytics
    async getCollegeAnalytics() {
        return this.makeRequest('/college/analytics');
    }

    // ============ ADMIN ROUTES ============

    // Create hackathon
    async createHackathon(hackathonData) {
        return this.makeRequest('/admin/createHackathon', {
            method: 'POST',
            body: JSON.stringify(hackathonData),
        });
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;