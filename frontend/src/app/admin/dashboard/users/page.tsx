"use client";

import { UserManagementTable } from "./user-management-table";

/**
 * Admin user management — /admin/dashboard/users
 */

export default function AdminUsersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">User management</h1>
      </header>

      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
        <UserManagementTable />
      </main>
    </div>
  );
}