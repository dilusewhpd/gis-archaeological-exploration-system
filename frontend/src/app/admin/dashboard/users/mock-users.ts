export type UserRole = "Admin" | "Analyst" | "Field Officer" | "Senior Officer";
export type UserStatus = "Active" | "Disabled";

export type UserAccount = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export const DEFAULT_USERS: UserAccount[] = [
  { id: "user1", fullName: "J. Perera", email: "j.perera@doa.lk", role: "Field Officer", status: "Active" },
  { id: "user2", fullName: "K. Silva", email: "k.silva@doa.lk", role: "Analyst", status: "Active" },
  { id: "user3", fullName: "N. Fernando", email: "n.fernando@doa.lk", role: "Admin", status: "Active" },
  { id: "user4", fullName: "R. Bandara", email: "r.bandara@doa.lk", role: "Field Officer", status: "Disabled" },
  { id: "user5", fullName: "D. Jayawardena", email: "d.jayawardena@doa.lk", role: "Senior Officer", status: "Active" },
];

export function getUsers(): UserAccount[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  const saved = localStorage.getItem("archeology_users");
  if (!saved) {
    localStorage.setItem("archeology_users", JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(saved);
}

export function saveUsers(users: UserAccount[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("archeology_users", JSON.stringify(users));
  }
}