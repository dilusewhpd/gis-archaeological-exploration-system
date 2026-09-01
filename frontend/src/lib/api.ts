const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

const TOKEN_KEY = "auth_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: Record<string, unknown> | null = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = (await response.json()) as Record<string, unknown>;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = "An unexpected error occurred.";
    if (typeof data?.message === "string") {
      errorMessage = data.message;
    } else if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const firstError = data.errors[0] as { message?: string };
      errorMessage = firstError?.message || errorMessage;
    } else if (response.statusText) {
      errorMessage = response.statusText;
    }

    throw new ApiError(errorMessage, response.status, data);
  }

  return data as unknown as T;
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
