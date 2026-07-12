export type UserRole = "Admin" | "Analyst" | "Field Officer";
export type UserStatus = "Active" | "Disabled";

export type UserAccount = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export const MOCK_USERS: UserAccount[] = [
  { id: "user1", fullName: "J. Perera", email: "j.perera@doa.lk", role: "Field Officer", status: "Active" },
  { id: "user2", fullName: "K. Silva", email: "k.silva@doa.lk", role: "Analyst", status: "Active" },
  { id: "user3", fullName: "N. Fernando", email: "n.fernando@doa.lk", role: "Admin", status: "Active" },
  { id: "user4", fullName: "R. Bandara", email: "r.bandara@doa.lk", role: "Field Officer", status: "Disabled" },
];