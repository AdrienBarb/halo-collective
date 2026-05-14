import { renderMjmlEmail } from "@/lib/emails/mjml/render";
import { NewsletterEmail as MjmlNewsletterEmail } from "@/lib/emails/mjml/NewsletterEmail";
import {
  buildNewsletterEmailProps,
  type AthleteForEmail,
  type NewsletterEmailRenderInput,
} from "@/lib/services/newsletter";

// Server-only. Isolated from newsletter.ts so the publish-path bundle
// (test-send / publish / unpublish) never has to evaluate mjml-core.
export async function renderNewsletterPreviewEmailMjml(
  athlete: AthleteForEmail,
  input: NewsletterEmailRenderInput,
): Promise<string> {
  const props = await buildNewsletterEmailProps(athlete, input);
  return renderMjmlEmail(MjmlNewsletterEmail(props)).html;
}
