/**
 * API client for vauntico.com backend
 * Handles authentication, trust scores, and API communication
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.vauntico.com';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle unauthorized responses
      if (response.status === 401) {
        this.setToken(null);
        // Could redirect to login here
      }

      return response;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  // Trust score methods
  async calculateTrustScore(payload) {
    const response = await this.request('/trustscore/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Trust score calculation failed');
    }

    return response.json();
  }

  async getTrustScoreHistory(userId) {
    const response = await this.request(`/trustscore/history/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch trust score history');
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    const response = await this.request('/health');
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    return response.json();
  }

  // Logout
  logout() {
    this.setToken(null);
  }
}

// Singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { apiClient, ApiClient };
