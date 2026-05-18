import { NextRequest, NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import {
  enqueuePublish,
  executePublishFromSending,
} from "@/lib/services/newsletter";
import { captureServerEvent } from "@/lib/tracking/postHogClient";

// `maxDuration = 300` requires a Pro/Enterprise Vercel plan. On Hobby
// the platform caps at 60s and silently lowers this value, which would
// reintroduce the original stuck-row failure mode for slow Brevo calls.
// If you ever switch off Pro, also revisit the recovery story (there
// is no cron — recovery is admin-driven via /publish/retry).
export const maxDuration = 300;

// CUID2 is the id shape Prisma generates for Newsletter. Reject
// anything else loudly before it propagates into Brevo campaign names
// and log lines.
const newsletterIdSchema = z
  .string()
  .regex(/^[a-z0-9]{20,32}$/, "Invalid newsletter id");

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const { response, admin } = await adminGuard();
    if (response) return response;

    const rawId = (await ctx.params).id;
    const id = newsletterIdSchema.parse(rawId);

    // Sync phase: validate, render HTML, flip DRAFT → SENDING.
    // The admin's "Publish" click blocks on this (~1-2s). Errors here
    // are user-facing and never reach Brevo.
    const queued = await enqueuePublish(id);

    // Republish (previously-sent edition being put back on the public
    // site): no Brevo work, return synchronously.
    if (queued.mode === "republished") {
      revalidatePath(`/${queued.newsletter.athlete.slug}`, "layout");
      revalidatePath(
        `/${queued.newsletter.athlete.slug}/${queued.newsletter.slug}`,
      );
      return NextResponse.json(queued.newsletter);
    }

    // Background phase: kick the Brevo work off via `after()` so the
    // HTTP response lands immediately. `after()` callbacks run after
    // the response is sent but inside the function's maxDuration, so
    // hung Brevo calls cannot block the user but they CAN exceed the
    // function's lifetime — recovery is admin-driven via the retry
    // endpoint below.
    const athleteSlug = queued.newsletter.athlete.slug;
    const newsletterSlug = queued.newsletter.slug;
    const distinctId = admin?.id ?? "system";
    after(async () => {
      console.log(
        JSON.stringify({
          scope: "brevo.publish",
          event: "after_started",
          newsletterId: id,
        }),
      );
      try {
        const published = await executePublishFromSending(id);
        console.log(
          JSON.stringify({
            scope: "brevo.publish",
            event: "after_finished",
            newsletterId: id,
            published,
          }),
        );
        revalidatePath(`/${athleteSlug}`, "layout");
        revalidatePath(`/${athleteSlug}/${newsletterSlug}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown";
        const name = error instanceof Error ? error.name : null;
        console.log(
          JSON.stringify({
            scope: "brevo.publish",
            event: "after_failed",
            newsletterId: id,
            name,
            message,
          }),
        );
        // Surface to PostHog so an alert can fire. With no cron, this
        // is the only signal an operator gets that a row is stuck.
        await captureServerEvent(distinctId, "newsletter_publish_failed", {
          newsletterId: id,
          athleteSlug,
          errorName: name,
          errorMessage: message,
        }).catch(() => {});
      }
    });

    return NextResponse.json(queued.newsletter, { status: 202 });
  } catch (error) {
    return errorHandler(error);
  }
}
