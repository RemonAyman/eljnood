/**
 * API Client for .NET Web API Backend (Genoud)
 */

export const PRODUCTION_CLOUD_API_URL = 'https://genoud-scouts-api.onrender.com/api';
export const LOCAL_EMULATOR_API_URL = 'http://10.0.2.2:5000/api';

export const DEFAULT_API_BASE_URL = LOCAL_EMULATOR_API_URL;

let currentApiUrl = DEFAULT_API_BASE_URL;
let authToken: string | null = null;

export function setApiBaseUrl(url: string) {
  currentApiUrl = url.replace(/\/$/, '');
}

export function getApiBaseUrl(): string {
  return currentApiUrl;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  isOffline?: boolean;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${currentApiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data: any = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (response.ok) {
      return { success: true, data };
    } else {
      return {
        success: false,
        message: data?.message || data?.title || `HTTP Error ${response.status}`,
      };
    }
  } catch (error: any) {
    console.warn(`⚠️ .NET Backend API request failed (${endpoint}):`, error.message);
    return {
      success: false,
      isOffline: true,
      message: 'تعذر الاتصال بالسيرفر المحلي .NET Backend',
    };
  }
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export const apiClient = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
