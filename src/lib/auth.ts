import { cookies } from "next/headers";

export type Role = "ADMIN" | "USER" | "GUEST";

export async function getCurrentUserRole(): Promise<Role> {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user-role")?.value as Role;

  return userRole || "GUEST";
}

export async function setUserRole(role: Role) {
  const cookieStore = await cookies();
  cookieStore.set("user-role", role);
}
