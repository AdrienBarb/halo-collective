import { brevoFetch } from "@/lib/brevo/client";

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
