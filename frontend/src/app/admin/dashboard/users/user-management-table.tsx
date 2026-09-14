"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { apiErrorMessage } from "@/lib/sites";
import {
  deactivateUser,
  listUsers,
  resetUserPassword,
  updateUser,
  USER_ROLE_LABELS,
  type UserRecord,
} from "@/lib/users";

export function UserManagementTable() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    void reload();
  }, []);

  async function reload() {
    setIsLoading(true);
    try {
      // Backend caps `limit` at 100 — well above the current user count, so
      // this is a single fetch with client-side search (no pager needed yet).
      const page = await listUsers({ limit: 100 });
      setUsers(page.users);
      setLoadError(null);
    } catch (err) {
      setLoadError(apiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return fullName.includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, query]);

  async function handleDisable(user: UserRecord) {
    const confirmed = window.confirm(
      `Deactivate account for ${user.firstName} ${user.lastName}? They will lose dashboard access immediately.`
    );
    if (!confirmed) return;

    setRowError(null);
    setBusyId(user.id);
    try {
      await deactivateUser(user.id);
      await reload();
    } catch (err) {
      setRowError({ id: user.id, message: apiErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleEnable(user: UserRecord) {
    setRowError(null);
    setBusyId(user.id);
    try {
      await updateUser(user.id, { isActive: true });
      await reload();
    } catch (err) {
      setRowError({ id: user.id, message: apiErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleResetPassword(user: UserRecord) {
    setRowError(null);
    setBusyId(user.id);
    try {
      const temporaryPassword = await resetUserPassword(user.id);
      window.alert(
        `Temporary password for ${user.firstName} ${user.lastName}:\n\n${temporaryPassword}\n\nCopy and share securely — this won't be shown again.`
      );
    } catch (err) {
      setRowError({ id: user.id, message: apiErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
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
      <div className="mt-4 overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white shadow-xs">
        {isLoading ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#8A8D86]">Loading users…</p>
        ) : loadError ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#8A3A20]">{loadError}</p>
        ) : filteredUsers.length === 0 ? (
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
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDBD1]/60">
              {filteredUsers.map((user, i) => (
                <Fragment key={user.id}>
                  <tr className={i % 2 === 1 ? "bg-[#FAF9F6]" : undefined}>
                    <td className="px-5 py-3 text-[#3A2A12] font-semibold">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-5 py-3 text-[#3A4048]">{user.email}</td>
                    <td className="px-5 py-3 text-[#3A4048]">
                      {USER_ROLE_LABELS[user.role.name as keyof typeof USER_ROLE_LABELS] ??
                        user.role.name}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold " +
                          (user.isActive
                            ? "bg-[#EAF1EA] text-[#2F5C3B]"
                            : "bg-[#F6E8E3] text-[#9A4B2E]")
                        }
                      >
                        {user.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3.5">
                        <Link
                          href={`/admin/dashboard/users/${user.id}/edit`}
                          className="font-semibold text-[#BB892C] hover:underline"
                        >
                          Edit
                        </Link>

                        {user.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleDisable(user)}
                            disabled={busyId === user.id}
                            className="font-semibold text-[#9A5A2E] hover:underline disabled:opacity-50"
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEnable(user)}
                            disabled={busyId === user.id}
                            className="font-semibold text-[#2C6B33] hover:underline disabled:opacity-50"
                          >
                            Enable
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleResetPassword(user)}
                          disabled={busyId === user.id}
                          className="font-semibold text-[#BB892C] hover:underline disabled:opacity-50"
                        >
                          Reset Pass
                        </button>
                      </div>
                    </td>
                  </tr>
                  {rowError?.id === user.id && (
                    <tr>
                      <td colSpan={5} className="border-t border-[#E3B9A8] bg-[#FBF0EB] px-5 py-2.5 text-[12.5px] text-[#8A3A20]">
                        {rowError.message}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
