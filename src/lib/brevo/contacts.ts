import { brevoFetch } from "@/lib/brevo/client";

interface UpsertContactInput {
  email: string;
  listIds?: number[];
  attributes?: Record<string, string | number | boolean | null>;
}

interface BrevoContactResponse {
  id: number;
}

/**
 * Idempotent: creates a Brevo contact if missing, otherwise updates it
 * and ensures it belongs to the given lists. Returns the new contact id
 * on creation, or null on update (Brevo returns 204 with no body).
 */
export async function upsertContact({
  email,
  listIds,
  attributes,
}: UpsertContactInput): Promise<number | null> {
  const res = await brevoFetch<BrevoContactResponse | undefined>("/contacts", {
    method: "POST",
    body: {
      email,
      listIds,
      attributes,
      updateEnabled: true,
    },
  });
  return res?.id ?? null;
}

export async function getContactIdByEmail(email: string): Promise<number> {
  const contact = await brevoFetch<BrevoContactResponse>(
    `/contacts/${encodeURIComponent(email)}`,
  );
  return contact.id;
}
