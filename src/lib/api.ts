import { 
  Submission, 
  CreateSubmissionData, 
  UpdateSubmissionData, 
  OverrideSubmissionData,
  FilterOptions,
  DashboardStats,
  User,
  OverrideLog
} from '@/types';

// Force use of Next.js API routes instead of external backend
const API_URL = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
      }
      return token;
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle token expired error
      if (response.status === 403 && error.error && error.error.includes('TokenExpiredError')) {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        // Clear token from apiClient
        this.token = null;
        throw new Error('TokenExpiredError: JWT token has expired');
      }
      
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Submission endpoints
  async getSubmissions(filters?: FilterOptions): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = queryString ? `/submissions?${queryString}` : '/submissions';
    
    return this.request(endpoint);
  }

  async createSubmission(data: CreateSubmissionData): Promise<Submission> {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubmission(id: string, data: UpdateSubmissionData): Promise<Submission> {
    return this.request(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadSubmissionFiles(id: string, files: File[]): Promise<{ files: unknown[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const token = this.getToken();
    const response = await fetch(`${API_URL}/submissions/${id}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async getHotLeads(): Promise<Submission[]> {
    return this.request('/submissions/hot-leads');
  }

  // Admin endpoints
  async getAllSubmissions(filters?: FilterOptions): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.marketer_id) params.append('marketer_id', filters.marketer_id);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/submissions?${queryString}` : '/admin/submissions';
    
    return this.request(endpoint);
  }

  async getMarketers(): Promise<User[]> {
    return this.request('/admin/marketers');
  }

  async createMarketer(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<User> {
    return this.request('/admin/marketers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMarketer(id: string, data: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<User> {
    return this.request(`/admin/marketers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMarketer(id: string): Promise<{ message: string }> {
    return this.request(`/admin/marketers/${id}`, {
      method: 'DELETE',
    });
  }

  async overrideOwnership(data: OverrideSubmissionData): Promise<Submission> {
    return this.request('/admin/override-ownership', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOverrideLogs(): Promise<OverrideLog[]> {
    return this.request('/admin/override-logs');
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('/admin/stats');
  }

  async getMarketerStats(): Promise<DashboardStats> {
    return this.request('/submissions/stats');
  }

  // Generic GET method
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }
}

export const apiClient = new ApiClient();
