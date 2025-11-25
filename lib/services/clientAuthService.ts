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
  sub: string;
  email: string;
  fullName?: string;
  [key: string]: unknown;
}

class ClientAuthService {
  private TOKEN_KEY = 'clientAccessToken';
  private USER_KEY = 'clientUser';

  async register(userData: RegisterData): Promise<unknown> {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'რეგისტრაცია ვერ შესრულდა');
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'ავტორიზაცია ვერ შესრულდა');
    }

    const data = await response.json();
    if (data.accessToken) {
      this.setToken(data.accessToken);
    }

    return data;
  }

  async getUserInfo(): Promise<UserInfo> {
    const token = this.getToken();
    if (!token) {
      throw new Error('ავტორიზაცია საჭიროა');
    }

    const response = await fetch(API_ENDPOINTS.USER_INFO, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('მომხმარებლის მონაცემების მიღება ვერ მოხერხდა');
    }

    const userInfo = await response.json();
    this.setUser(userInfo);
    return userInfo;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  setUser(user: UserInfo): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  getUser(): UserInfo | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }
}

const clientAuthService = new ClientAuthService();
export default clientAuthService;

