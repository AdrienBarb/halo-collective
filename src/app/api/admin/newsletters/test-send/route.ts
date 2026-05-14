import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import {
  buildDraftPreview,
  draftPayloadSchema,
} from "@/lib/services/newsletterDraftPreview";
import { sendTransactionalEmail } from "@/lib/brevo/transactional";

// Force the react-email engine for test sends — the MJML engine is a POC
// (preview-only) and hasn't been audited for parity with the publish path.
const testSendSchema = draftPayloadSchema.extend({
  testEmail: z.string().email(),
  engine: z.literal("react-email").optional().default("react-email"),
});

const TEST_SUBJECT_PREFIX = "[TEST] ";
const SUBJECT_MAX_LENGTH = 200;

function buildTestSubject(rawSubject: string): string {
  const substituted = rawSubject
    .replace(
      /\{\{\s*contact\.[A-Z_]+\s*\|\s*default:\s*"([^"]*)"\s*\}\}/g,
      "$1",
    )
    .replace(/\{\{\s*contact\.[A-Z_]+\s*\}\}/g, "Test")
    .replace(/[\r\n\t]+/g, " ")
    .trim();
  // Truncate the inner content, not the prefix — the [TEST] marker is the
  // most important part for the admin to see in their inbox.
  const innerMax = SUBJECT_MAX_LENGTH - TEST_SUBJECT_PREFIX.length;
  return `${TEST_SUBJECT_PREFIX}${substituted.slice(0, innerMax)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const body = await req.json();
    const parsed = testSendSchema.parse(body);

    const { athleteRow, emailHtml, title } = await buildDraftPreview(parsed);

    const rawSubjectInput = (parsed.header.emailSubject ?? "").trim();
    const subject = buildTestSubject(rawSubjectInput || title);
    const athleteFullName = `${athleteRow.firstName} ${athleteRow.lastName}`
      .replace(/[\r\n\t]+/g, " ")
      .trim();

    await sendTransactionalEmail({
      to: parsed.testEmail,
      senderName: athleteFullName,
      subject,
      htmlContent: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorHandler(error);
  }
}
