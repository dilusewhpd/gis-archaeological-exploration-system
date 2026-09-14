import { apiRequest, type ApiResponse } from "@/lib/api";

/**
 * Central-backend user API (ADMIN only).
 * Mirrors central-backend/src/routes/user.routes.ts.
 */

export type UserRoleName = "ADMIN" | "ANALYST" | "FIELD_OFFICER" | "SENIOR_OFFICER";

export const USER_ROLE_OPTIONS: UserRoleName[] = [
  "ADMIN",
  "ANALYST",
  "FIELD_OFFICER",
  "SENIOR_OFFICER",
];

export const USER_ROLE_LABELS: Record<UserRoleName, string> = {
  ADMIN: "Admin",
  ANALYST: "Analyst",
  FIELD_OFFICER: "Field Officer",
  SENIOR_OFFICER: "Senior Officer",
};

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt?: string;
  role: { id: string; name: string };
}

interface UsersPage {
  users: UserRecord[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/** GET /api/users — one page plus pagination metadata. */
export async function listUsers(
  params: { page?: number; limit?: number; search?: string; isActive?: boolean } = {}
): Promise<UsersPage> {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
  });
  if (params.search?.trim()) qs.set("search", params.search.trim());
  if (params.isActive !== undefined) qs.set("isActive", String(params.isActive));
  const res = await apiRequest<ApiResponse<UsersPage>>(`/api/users?${qs.toString()}`);
  return res.data;
}

/** Total registered users, read from the pagination total. */
export async function getUserCount(): Promise<number> {
  const page = await listUsers({ page: 1, limit: 1 });
  return page.pagination.totalItems;
}

/** GET /api/users/:id */
export async function getUserById(id: string): Promise<UserRecord> {
  const res = await apiRequest<ApiResponse<UserRecord>>(`/api/users/${id}`);
  return res.data;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRoleName;
}

/**
 * POST /api/users — the backend generates the temporary password itself
 * (never accepts one from the client) and returns it exactly once here.
 * There is no way to retrieve it again after this call returns.
 */
export async function createUser(
  payload: CreateUserPayload
): Promise<{ user: UserRecord; temporaryPassword: string }> {
  const res = await apiRequest<ApiResponse<{ user: UserRecord; temporaryPassword: string }>>(
    "/api/users",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return res.data;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRoleName;
  isActive?: boolean;
}

/** PATCH /api/users/:id */
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserRecord> {
  const res = await apiRequest<ApiResponse<UserRecord>>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * DELETE /api/users/:id — despite the verb, this is a soft deactivate
 * (isActive -> false), not a permanent delete; there is no hard-delete
 * endpoint. The backend blocks deactivating your own account.
 */
export async function deactivateUser(id: string): Promise<void> {
  await apiRequest<ApiResponse<null>>(`/api/users/${id}`, { method: "DELETE" });
}

/** POST /api/users/:id/reset-password — returns a new real temporary password, shown once. */
export async function resetUserPassword(id: string): Promise<string> {
  const res = await apiRequest<ApiResponse<{ temporaryPassword: string }>>(
    `/api/users/${id}/reset-password`,
    { method: "POST" }
  );
  return res.data.temporaryPassword;
}
