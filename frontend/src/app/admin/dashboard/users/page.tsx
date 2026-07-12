import { UserManagementTable } from "./user-management-table";
import { MOCK_USERS } from "./mock-users";

/**
 * Admin user management — /admin/dashboard/users
 *
 * FRONTEND-ONLY: no API calls yet. Users come from MOCK_USERS
 * (./mock-users.ts), shared with the edit page. Once the backend
 * exists, replace MOCK_USERS with a fetch to your users endpoint
 * (server-side, same pattern as the dashboard page) and pass the
 * result into UserManagementTable the same way.
 *
 * Use-case mapping (Authentication and User Management module):
 *  - "Create new user account" --<<include>>--> "Assign user roles and
 *     permission" → "+ Add user" button, routes to /users/new
 *  - "Update user account information" → "Edit" row action, routes to
 *     /users/[id]/edit
 *  - "Deactivate or delete user account" → "Enable" row action for a
 *     disabled account; deactivating happens from the edit page
 */

export default function AdminUsersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-white px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#16283F]">User management</h1>
      </header>

      <main className="flex-1 px-8 py-7">
        <UserManagementTable initialUsers={MOCK_USERS} />
      </main>
    </div>
  );
}