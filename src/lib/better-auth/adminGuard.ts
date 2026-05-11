import { NextResponse } from "next/server";
import { errorMessages } from "@/lib/constants/errorMessage";
import {
  getAdminUser,
  getCurrentUser,
  type CurrentUser,
} from "@/lib/services/currentUser";

export type AdminGuardResult =
  | { admin: CurrentUser; response: null }
  | { admin: null; response: NextResponse };

export async function adminGuard(): Promise<AdminGuardResult> {
  const admin = await getAdminUser();
  if (admin) return { admin, response: null };

  const current = await getCurrentUser();
  if (!current) {
    return {
      admin: null,
      response: NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 },
      ),
    };
  }
  console.warn(`[admin-guard] forbidden for userId=${current.id}`);
  return {
    admin: null,
    response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
  };
}
