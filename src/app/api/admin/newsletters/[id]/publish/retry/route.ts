import { NextRequest, NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NewsletterStatus } from "@prisma/client";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { prisma } from "@/lib/db/prisma";
import { executePublishFromSending } from "@/lib/services/newsletter";
import { captureServerEvent } from "@/lib/tracking/postHogClient";
import { ConflictError, NotFoundError } from "@/lib/errors/AppError";

export const maxDuration = 300;

const newsletterIdSchema = z
  .string()
  .regex(/^[a-z0-9]{20,32}$/, "Invalid newsletter id");

// Admin-driven recovery for a publish that didn't complete. The
// publish route schedules Brevo work via `after()`, which is killed
// when the function instance dies. There is no cron — when a row gets
// stuck in SENDING, the admin clicks Retry which lands here.
//
// We refuse to fire while a normal publish could plausibly still be
// in flight. The publish function's `after()` cannot outlive its
// maxDuration (300s); we use a slightly longer threshold so a slow
// but eventually-successful publish never collides with a retry.
const RETRY_MIN_AGE_MS = 6 * 60 * 1000;

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Context) {
  try {
    const { response, admin } = await adminGuard();
    if (response) return response;

    const rawId = (await ctx.params).id;
    const id = newsletterIdSchema.parse(rawId);

    const cutoff = new Date(Date.now() - RETRY_MIN_AGE_MS);
    const row = await prisma.newsletter.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        athlete: { select: { slug: true } },
        slug: true,
      },
    });
    if (!row) throw new NotFoundError("Newsletter not found");

    if (row.status !== NewsletterStatus.SENDING) {
      throw new ConflictError(
        `Retry only valid for stuck SENDING rows (current status: ${row.status})`,
      );
    }
    if (row.updatedAt > cutoff) {
      throw new ConflictError(
        "Publish is still in progress — try again in a minute",
      );
    }

    const distinctId = admin?.id ?? "system";
    const athleteSlug = row.athlete.slug;
    const newsletterSlug = row.slug;

    after(async () => {
      console.log(
        JSON.stringify({
          scope: "brevo.publish",
          event: "retry_started",
          newsletterId: id,
        }),
      );
      try {
        const published = await executePublishFromSending(id);
        console.log(
          JSON.stringify({
            scope: "brevo.publish",
            event: "retry_finished",
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
            event: "retry_failed",
            newsletterId: id,
            name,
            message,
          }),
        );
        await captureServerEvent(distinctId, "newsletter_publish_retry_failed", {
          newsletterId: id,
          athleteSlug,
          errorName: name,
          errorMessage: message,
        }).catch(() => {});
      }
    });

    return NextResponse.json({ status: "retrying" }, { status: 202 });
  } catch (error) {
    return errorHandler(error);
  }
}
