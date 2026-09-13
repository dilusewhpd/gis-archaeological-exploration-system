import { apiRequest, type ApiResponse } from "@/lib/api";

/**
 * Central-backend user API (ADMIN only).
 * Mirrors central-backend/src/routes/user.routes.ts.
 */

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
