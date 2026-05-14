import { brevoFetch, BrevoError } from "@/lib/brevo/client";

interface CreateCampaignInput {
  name: string;
  subject: string;
  htmlContent: string;
  sender: { name: string; email: string };
  listIds: number[];
  replyTo?: string;
  previewText?: string;
}

interface BrevoCampaignResponse {
  id: number;
}

export async function createCampaign(
  input: CreateCampaignInput,
): Promise<number> {
  const { name, subject, htmlContent, sender, listIds, replyTo, previewText } =
    input;

  const res = await brevoFetch<BrevoCampaignResponse>("/emailCampaigns", {
    method: "POST",
    body: {
      name,
      subject,
      sender,
      htmlContent,
      recipients: { listIds },
      replyTo,
      previewText,
    },
  });

  return res.id;
}

export async function sendCampaignNow(campaignId: number): Promise<void> {
  await brevoFetch(`/emailCampaigns/${campaignId}/sendNow`, { method: "POST" });
}

// Statuses that mean "Brevo has already accepted the send" — calling
// sendNow again on a campaign in any of these states is either a no-op
// or a 400. `suspended` and `archive` are deliberately excluded: both
// usually indicate human/operator intervention (paused by user, moved
// to archive folder) rather than a successful send, and treating them
// as success risks marking PUBLISHED a newsletter that never went out.
const SEND_ALREADY_INITIATED_STATUSES = new Set([
  "queued",
  "in_process",
  "sent",
]);

/**
 * Detect Brevo's "campaign already initiated" error family. We rely on
 * Brevo's documented `code` prefix (`campaign_already_*`) — the
 * message-string heuristics that used to live here matched too many
 * unrelated 400s (e.g. `"not allowed"` matched auth-scope errors and
 * sender-not-validated). Callers should still re-verify the campaign's
 * status via `getCampaignStatus` after swallowing this error.
 */
export function isCampaignAlreadyInitiatedError(error: unknown): boolean {
  if (!(error instanceof BrevoError)) return false;
  if (error.status !== 400) return false;
  const body = error.body as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.toLowerCase() : "";
  return code.startsWith("campaign_already_");
}

export interface CampaignSummary {
  id: number;
  name: string;
  status: string;
  sender?: { email?: string };
  recipients?: { listIds?: number[] };
  htmlContent?: string;
}

interface CampaignListResponse {
  campaigns?: Array<{
    id: number;
    name: string;
    status: string;
    sender?: { email?: string };
    recipients?: { listIds?: number[] };
  }>;
  count?: number;
}

export async function getCampaignStatus(
  campaignId: number,
): Promise<string | null> {
  try {
    const res = await brevoFetch<{ status: string }>(
      `/emailCampaigns/${campaignId}`,
    );
    return res.status;
  } catch (error) {
    if (error instanceof BrevoError && error.status === 404) return null;
    throw error;
  }
}

export async function getCampaign(
  campaignId: number,
): Promise<CampaignSummary | null> {
  try {
    return await brevoFetch<CampaignSummary>(`/emailCampaigns/${campaignId}`);
  } catch (error) {
    if (error instanceof BrevoError && error.status === 404) return null;
    throw error;
  }
}

export function campaignStatusMeansSent(status: string | null): boolean {
  if (!status) return false;
  return SEND_ALREADY_INITIATED_STATUSES.has(status.toLowerCase());
}

// Tunables for orphan-campaign lookup. Newsletters are low-volume so a
// shallow scan over recent campaigns is enough; `startDate` is the real
// safety net against pagination assumptions drifting under us.
const BREVO_CAMPAIGN_PAGE_SIZE = 100;
const MAX_CAMPAIGN_LOOKUP_PAGES = 5;
// How far back to scan for an orphan. A stuck publish can only happen
// inside the publish route's maxDuration (300s), so any orphan must
// have been created very recently. 24h gives a generous margin while
// preventing a full-history scan when the marker isn't there.
const ORPHAN_LOOKUP_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Recovery helper. We embed a `[nl:<id>]` marker at the START of the
 * Brevo campaign name (where it survives Brevo's name truncation) so
 * an orphan campaign (one Brevo accepted but whose id we never
 * persisted to DB) can be discovered and adopted. We constrain the
 * search by `startDate` so we never paginate further back than the
 * window in which an orphan is plausible.
 */
export async function findCampaignByNewsletterId(
  newsletterId: string,
): Promise<CampaignSummary | null> {
  const marker = `[nl:${newsletterId}]`;
  const startDate = new Date(Date.now() - ORPHAN_LOOKUP_WINDOW_MS)
    .toISOString();
  let offset = 0;
  let pagesScanned = 0;
  let totalMatched = 0;
  for (let page = 0; page < MAX_CAMPAIGN_LOOKUP_PAGES; page++) {
    pagesScanned = page + 1;
    const qs = new URLSearchParams({
      type: "classic",
      limit: String(BREVO_CAMPAIGN_PAGE_SIZE),
      offset: String(offset),
      startDate,
    });
    const res = await brevoFetch<CampaignListResponse>(
      `/emailCampaigns?${qs.toString()}`,
    );
    const campaigns = res.campaigns ?? [];
    for (const c of campaigns) {
      if (!c.name.includes(marker)) continue;
      totalMatched++;
      // Fetch the full campaign so the caller can verify sender,
      // recipients, and htmlContent before adopting.
      const full = await getCampaign(c.id);
      if (full) return full;
    }
    if (campaigns.length < BREVO_CAMPAIGN_PAGE_SIZE) break;
    offset += BREVO_CAMPAIGN_PAGE_SIZE;
  }
  if (pagesScanned === MAX_CAMPAIGN_LOOKUP_PAGES) {
    // We hit the page cap without exhausting results. Surfacing this
    // is important: a "no orphan" return could be a false negative,
    // which would lead to a double-create on the next executor pass.
    console.log(
      JSON.stringify({
        scope: "brevo.publish",
        event: "orphan_lookup_page_cap_hit",
        newsletterId,
        pagesScanned,
        totalMatched,
      }),
    );
  }
  return null;
}
