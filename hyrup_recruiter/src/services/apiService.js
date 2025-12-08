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
        } catch {
            // Failed to get auth token; return null and let callers handle unauthenticated flows
            return null;
        }
    }

    // Helper method for making authenticated requests
    async makeRequest(endpoint, options = {}) {
        const token = await this.getAuthToken();

        // Don't force Content-Type on GET requests (avoids unnecessary preflight)
        const config = {
            headers: {
                ...options.headers,
            },
            ...options,
        };

        if (options.body && !(options.method && options.method.toUpperCase() === 'GET')) {
            config.headers['Content-Type'] = 'application/json';
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const url = `${this.baseURL}${endpoint}`;



        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // Helper method for public (non-authenticated) requests
    async makePublicRequest(endpoint, options = {}) {
        const config = {
            headers: {
                ...options.headers,
            },
            ...options,
        };

        if (options.body && !(options.method && options.method.toUpperCase() === 'GET')) {
            config.headers['Content-Type'] = 'application/json';
        }

        const url = `${this.baseURL}${endpoint}`;

        // Debug logs removed for production/security reasons

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
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

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
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

    // Post job (using public endpoint)
    async postJob(jobData) {
        return this.makePublicRequest('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
    }

    // Get all jobs (public endpoint)
    async getJobs() {
        return this.makePublicRequest('/jobs');
    }

    // Get jobs by recruiter ID (public endpoint)
    async getJobsByRecruiter(recruiterId) {
        return this.makePublicRequest(`/jobs/recruiter/${recruiterId}`);
    }

    // Get all applications (public endpoint)
    async getApplications() {
        return this.makePublicRequest('/applications');
    }

    // Get applications by recruiter ID (public endpoint)
    async getApplicationsByRecruiter(recruiterId) {
        return this.makePublicRequest(`/applications/recruiter/${recruiterId}`);
    }

    // Get applications by job ID (public endpoint)
    async getApplicationsByJob(jobId) {
        return this.makePublicRequest(`/applications/job/${jobId}`);
    }

    // Update application status (public endpoint)
    async updateApplicationStatus(applicationId, status) {
        return this.makePublicRequest(`/applications/${applicationId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    // Delete an application (public endpoint)
    async deleteApplication(applicationId) {
        return this.makePublicRequest(`/applications/${applicationId}`, {
            method: 'DELETE',
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
        try {
            return await this.makePublicRequest(`/company/by-uid/${uid}`);
        } catch (err) {
            // Primary request failed - trying fallback. Avoid logging sensitive details.
            // Fallback to localhost in development if the configured API is unreachable
            if (this.baseURL && !this.baseURL.includes('localhost')) {
                const originalBase = this.baseURL;
                try {
                    this.baseURL = 'http://localhost:3000';
                    const fallbackResp = await this.makePublicRequest(`/company/by-uid/${uid}`);
                    return fallbackResp;
                } catch (fallbackErr) {
                    // Fallback also failed; propagate error

                    // restore original baseURL
                    this.baseURL = originalBase;
                    throw fallbackErr;
                } finally {
                    this.baseURL = originalBase;
                }
            }
            throw err;
        }
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

    // Delete a job by ID (requires auth)
    async deleteJob(jobId) {
        return this.makeRequest(`/jobs/${jobId}`, {
            method: 'DELETE',
        });
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

    // Get specific student details by id (recruiter/admin fetching a candidate)
    async getStudentById(studentId) {
        return this.makeRequest('/student/getById', {
            method: 'POST',
            body: JSON.stringify({ studentId }),
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

    // Get locations (public endpoint)
    async getLocations() {
        return this.makePublicRequest('/locations');
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