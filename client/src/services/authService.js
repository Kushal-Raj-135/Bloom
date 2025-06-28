import axios from 'axios';

class AuthService {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api/auth'; // Adjust the base URL as needed
    this.tokenKey = 'auth-token';
    this.userKey = 'user-data';
    this.refreshTokenKey = 'refresh-token';
    this.rememberEmailKey = 'remembered-email';
    
    // Set up axios defaults
    this.setupAxiosInterceptors();
  }

  setupAxiosInterceptors() {
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            const newToken = this.getToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            this.removeTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token, refreshToken = null) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
      if (refreshToken) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
      }
    }
  }

  removeTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  setUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  async login(credentials) {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, credentials);
      const { token, refreshToken, user } = response.data;
      
      this.setToken(token, refreshToken);
      this.setUser(user);
      
      if (credentials.rememberMe && credentials.email) {
        localStorage.setItem(this.rememberEmailKey, credentials.email);
      } else {
        localStorage.removeItem(this.rememberEmailKey);
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(`${this.baseUrl}/register`, userData);
      const { token, refreshToken, user } = response.data;
      
      this.setToken(token, refreshToken);
      this.setUser(user);
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      if (refreshToken) {
        await axios.post(`${this.baseUrl}/logout`, { refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.removeTokens();
    }
  }

  async verifyToken() {
    try {
      const response = await axios.get(`${this.baseUrl}/verify`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

    //   const response = await axios.post(`${this.baseUrl}/refresh`, { refreshToken });
      const { token, refreshToken: newRefreshToken } = response.data;
      
      this.setToken(token, newRefreshToken);
      return response.data;
    } catch (error) {
      this.removeTokens();
      throw this.handleError(error);
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await axios.put(`${this.baseUrl}/profile`, profileData);
      const { user } = response.data;
      
      this.setUser(user);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(email) {
    try {
      const response = await axios.post(`${this.baseUrl}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(resetData) {
    try {
      const response = await axios.post(`${this.baseUrl}/reset-password`, resetData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async googleAuth() {
    window.location.href = `${this.baseUrl}/google`;
  }

  async githubAuth() {
    window.location.href = `${this.baseUrl}/github`;
  }

  getRememberedEmail() {
    return localStorage.getItem(this.rememberEmailKey);
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return Boolean(token && user);
  }

  handleError(error) {
    if (error.response?.data) {
      return new Error(error.response.data.message || 'An error occurred');
    }
    return new Error(error.message || 'Network error occurred');
  }
}

export const authService = new AuthService();
