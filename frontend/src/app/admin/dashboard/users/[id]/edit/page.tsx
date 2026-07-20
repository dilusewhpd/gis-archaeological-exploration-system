import { notFound } from "next/navigation";
import { MOCK_USERS } from "../../mock-users";
import { EditUserForm } from "./edit-user-form";

/**
 * Admin edit user — /admin/dashboard/users/[id]/edit
 *
 * FRONTEND-ONLY: looks the user up in the shared MOCK_USERS array.
 * Once the backend exists, replace this with a server-side fetch by id
 * (e.g. GET /api/admin/users/[id]) and 404 if it comes back empty,
 * same as the notFound() call below.
 *
 * Use-case mapping (Authentication and User Management module):
 *  - "Update user account information" — the editable fields
 *  - "Reset user password" — action inside EditUserForm
 *  - "Deactivate or delete user account" — status toggle inside
 *     EditUserForm
 */

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = MOCK_USERS.find((u) => u.id === id);

  if (!user) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Edit user</h1>
      </header>

      <main className="flex-1 px-8 py-7">
        <div className="max-w-xl">
          <EditUserForm user={user} />
        </div>
      </main>
    </div>
  );
}