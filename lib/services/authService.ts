import { API_ENDPOINTS } from '../config/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  fullName: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

interface UserInfo {
  email: string;
  fullName?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Authentication Service
 * Handles user registration, login, and token management
 */

class AuthService {
  private TOKEN_KEY = 'accessToken';
  private USER_KEY = 'user';

  /**
   * Register a new user
   * @param userData - { email, fullName, password }
   * @returns Registration response
   */
  async register(userData: RegisterData): Promise<unknown> {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user and save token
   * @param credentials - { email, password }
   * @returns Login response with accessToken
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();

      // Save token to localStorage
      if (data.accessToken) {
        this.setToken(data.accessToken);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get current user info
   * @returns User information
   */
  async getUserInfo(): Promise<UserInfo> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.USER_INFO, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await response.json();
      this.setUser(userInfo);
      return userInfo;
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * Save token to localStorage
   * @param token - JWT access token
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Get token from localStorage
   * @returns JWT access token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Save user data to localStorage
   * @param user - User information
   */
  setUser(user: UserInfo): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Get user data from localStorage
   * @returns User information
   */
  getUser(): UserInfo | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  /**
   * Check if user is authenticated
   * @returns Authentication status
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get authorization headers
   * @returns Headers with Bearer token
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
}

export default new AuthService();
