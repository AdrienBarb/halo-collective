import { hubspotFetch, HubSpotError } from "@/lib/hubspot/client";

interface CreateContactInput {
  email: string;
  properties?: Record<string, string>;
}

interface UpdateContactInput {
  email: string;
  properties: Record<string, string>;
}

interface HubSpotContactResponse {
  id: string;
}

// HubSpot signals "contact already exists" via 409 most of the time, but legacy
// validation paths surface it as 400/422 with body.category === "CONFLICT".
// Catch both — we never want to overwrite first-touch attribution.
function isDuplicateError(error: unknown): boolean {
  if (!(error instanceof HubSpotError)) return false;
  if (error.status === 409) return true;
  const body = error.body;
  return (
    typeof body === "object" &&
    body !== null &&
    "category" in body &&
    (body as { category: unknown }).category === "CONFLICT"
  );
}

/**
 * Create-only semantics: preserves first-touch attribution.
 * If the contact already exists, we return silently — we never overwrite
 * a returning fan's UTM properties.
 */
export async function createContact({
  email,
  properties,
}: CreateContactInput): Promise<HubSpotContactResponse | null> {
  try {
    const res = await hubspotFetch<HubSpotContactResponse | undefined>(
      "/crm/v3/objects/contacts",
      {
        method: "POST",
        body: {
          properties: {
            email,
            ...properties,
          },
        },
      }
    );
    return res ?? null;
  } catch (error) {
    if (isDuplicateError(error)) {
      return null;
    }
    throw error;
  }
}

/**
 * Upsert by email: PATCH existing contact, create when missing.
 * Use this for properties that overwrite each time (consent flags, timestamps,
 * country) — never for first-touch attribution like UTMs.
 *
 * The fallback create matters: if the better-auth signup hook's HubSpot push
 * ever fails silently, we'd otherwise drop the consent record on the floor
 * — and that's exactly the audit trail GDPR needs us to keep.
 */
export async function updateContactByEmail({
  email,
  properties,
}: UpdateContactInput): Promise<HubSpotContactResponse | null> {
  const encodedEmail = encodeURIComponent(email);
  try {
    const res = await hubspotFetch<HubSpotContactResponse | undefined>(
      `/crm/v3/objects/contacts/${encodedEmail}?idProperty=email`,
      {
        method: "PATCH",
        body: { properties },
      },
    );
    return res ?? null;
  } catch (error) {
    if (error instanceof HubSpotError && error.status === 404) {
      return createContact({ email, properties });
    }
    throw error;
  }
}
