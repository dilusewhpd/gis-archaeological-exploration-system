"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { UserAccount } from "./mock-users";

/**
 * FRONTEND-ONLY: Enable updates local state directly — no fetch calls.
 * When the backend exists, swap the handler below to call your API
 * (PATCH .../status) and update local state from the response.
 */
export function UserManagementTable({ initialUsers }: { initialUsers: UserAccount[] }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState(initialUsers);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  function handleEnable(user: UserAccount) {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: "Active" } : u))
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-end justify-between gap-4">
        <Link
          href="/admin/dashboard/users/new"
          className="flex items-center gap-1.5 rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21]"
        >
          <span className="text-[15px] leading-none">+</span> Add user
        </Link>

        <label className="block w-64">
          <span className="mb-1.5 block text-[12px] text-[#5B6472]">Search users</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or email"
            className="w-full rounded-[6px] border border-[#DEDBD1] bg-white px-3 py-2 text-[13px] text-[#3A2A12] outline-none placeholder:text-[#8A8D86] focus:border-[#BB892C]/40"
          />
        </label>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
        {filteredUsers.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#8A8D86]">
            {users.length === 0
              ? "No user accounts yet. Add one to get started."
              : `No users match "${query}".`}
          </p>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#3A2A12] text-[12px] text-[#F4F2ED]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <tr key={user.id} className={i % 2 === 1 ? "bg-[#F8F7F4]" : undefined}>
                  <td className="px-5 py-3 text-[#3A2A12]">{user.fullName}</td>
                  <td className="px-5 py-3 text-[#3A4048]">{user.email}</td>
                  <td className="px-5 py-3 text-[#3A4048]">{user.role}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        user.status === "Active" ? "text-[#2F5C3B]" : "text-[#9A4B2E]"
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {user.status === "Active" ? (
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/dashboard/users/${user.id}/edit`}
                          className="font-medium text-[#BB892C] underline-offset-2 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => alert(`Reset credentials successfully generated and sent to ${user.fullName} (${user.email}).`)}
                          className="font-medium text-[#9A5A2E] underline-offset-2 hover:underline"
                        >
                          Reset Password
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEnable(user)}
                          className="font-medium text-[#2F5C3B] underline-offset-2 hover:underline"
                        >
                          Enable
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Reset credentials successfully generated and sent to ${user.fullName} (${user.email}).`)}
                          className="font-medium text-[#9A5A2E] underline-offset-2 hover:underline"
                        >
                          Reset Password
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}