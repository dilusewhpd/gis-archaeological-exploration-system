"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUsers, type UserAccount } from "../../mock-users";
import { EditUserForm } from "./edit-user-form";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<UserAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const users = getUsers();
    const found = users.find((u) => u.id === userId);
    if (found) {
      setUser(found);
    } else {
      setError("User account not found.");
    }
  }, [userId]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col p-8 text-center bg-[#F0E6C8]/30">
        <p className="text-[#B03A2E] font-medium">{error}</p>
        <Link href="/admin/dashboard/users" className="mt-4 text-[#BB892C] underline">
          Back to users list
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center text-[#8A8D86]">
        Loading user account details…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard/users" className="text-[13px] text-[#BB892C] hover:underline">
            &larr; Back to users
          </Link>
          <span className="text-[#8A8D86] font-light">/</span>
          <span className="text-[13.5px] text-[#3A2A12] font-semibold">Edit user</span>
        </div>
      </header>

      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
        <div className="max-w-5xl mx-auto">
          <EditUserForm user={user} />
        </div>
      </main>
    </div>
  );
}