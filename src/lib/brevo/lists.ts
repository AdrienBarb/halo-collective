import { brevoFetch } from "@/lib/brevo/client";
import { prisma } from "@/lib/db/prisma";
import { getRequiredEnvInt } from "@/lib/utils/env";

interface CreateListResponse {
  id: number;
}

export async function createBrevoList(name: string): Promise<number> {
  const folderId = getRequiredEnvInt("BREVO_DEFAULT_FOLDER_ID");
  const res = await brevoFetch<CreateListResponse>("/contacts/lists", {
    method: "POST",
    body: { name, folderId },
  });
  return res.id;
}

interface AthleteListInput {
  id: string;
  firstName: string;
  lastName: string;
  brevoListId: number | null;
}

// Idempotent fallback for athletes created before brevoListId was eager-set.
export async function ensureAthleteList(
  athlete: AthleteListInput,
): Promise<number> {
  if (athlete.brevoListId !== null) {
    return athlete.brevoListId;
  }

  const listId = await createBrevoList(
    `Halo · ${athlete.firstName} ${athlete.lastName}`,
  );

  // Race-safe persist: only the first concurrent caller wins. The loser's
  // list is orphaned in Brevo (cheap cleanup) but our DB stays consistent.
  const { count } = await prisma.athlete.updateMany({
    where: { id: athlete.id, brevoListId: null },
    data: { brevoListId: listId },
  });

  if (count === 1) {
    return listId;
  }

  const winner = await prisma.athlete.findUniqueOrThrow({
    where: { id: athlete.id },
    select: { brevoListId: true },
  });
  return winner.brevoListId ?? listId;
}
