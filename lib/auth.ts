import { cookies } from "next/headers";

export async function getCurrentUser(): Promise<number> {
  const cookieStore = await cookies();
  const user = cookieStore.get("user");
  if (!user?.value) {
    return 1;
  }
  // TODO: разобрать user.value и вернуть реальный id
  return 1;
}
