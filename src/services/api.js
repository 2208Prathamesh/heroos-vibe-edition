const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

class ApiService {
    setToken(token) {
        localStorage.setItem('heroos_token', token);
    }

    getToken() {
        return localStorage.getItem('heroos_token');
    }

    clearToken() {
        localStorage.removeItem('heroos_token');
    }

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        if (options.body && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            return data;
        } catch (err) {
            console.error(`API Error (${endpoint}):`, err);
            throw err;
        }
    }

    // Auth
    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: { username, password }
        });
        if (data.token) this.setToken(data.token);
        return data.user;
    }

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
        if (data.token) this.setToken(data.token);
        return data.user;
    }

    logout() {
        this.clearToken();
    }

    // User Management (Admin)
    async getAllUsers() {
        return await this.request('/users');
    }

    async createUser(userData) {
        return await this.request('/users', {
            method: 'POST',
            body: userData
        });
    }

    async updateUser(id, updates) {
        return await this.request(`/users/${id}`, {
            method: 'PUT',
            body: updates
        });
    }

    async deleteUser(id) {
        return await this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    // Files
    async getFiles() {
        return await this.request('/files');
    }

    async getBinFiles() {
        return await this.request('/files/bin');
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await this.request('/upload', {
            method: 'POST',
            body: formData
        });
    }

    async deleteFile(id) {
        return await this.request(`/files/${id}`, { method: 'DELETE' });
    }

    async restoreFile(id) {
        return await this.request(`/files/restore/${id}`, { method: 'POST' });
    }

    async permanentDelete(id) {
        return await this.request(`/files/permanent/${id}`, { method: 'DELETE' });
    }

    async emptyBin() {
        return await this.request('/files/empty-bin', { method: 'POST' });
    }

    // SMTP Configuration (Admin)
    async getSMTPConfig() {
        return await this.request('/smtp/config');
    }

    async saveSMTPConfig(config) {
        return await this.request('/smtp/config', {
            method: 'POST',
            body: config
        });
    }

    async testSMTP(testEmail) {
        return await this.request('/smtp/test', {
            method: 'POST',
            body: { testEmail }
        });
    }

    // Broadcast & Newsletter (Admin)
    async sendBroadcast(subject, message) {
        return await this.request('/broadcast', {
            method: 'POST',
            body: { subject, message }
        });
    }

    async sendNewsletter(title, content, imageUrl = null) {
        return await this.request('/newsletter', {
            method: 'POST',
            body: { title, content, imageUrl }
        });
    }
    async sendSupport(data) {
        return await this.request('/support', {
            method: 'POST',
            body: data
        });
    }
}

export const apiService = new ApiService();
