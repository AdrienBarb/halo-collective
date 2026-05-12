import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { render } from "@react-email/render";
import { WaitlistConfirmationEmail } from "@/lib/emails/WaitlistConfirmationEmail";
import { resendClient } from "@/lib/resend/resendClient";
import { errorHandler } from "@/lib/errors/errorHandler";
import { waitlistSchema } from "@/lib/schemas/common";
import config from "@/lib/config";
import { DEFAULT_LOCALE } from "@/i18n/locales";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = waitlistSchema.parse(body);

    const existing = await prisma.waitlist.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already on waitlist" },
        { status: 400 }
      );
    }

    const totalCount = await prisma.waitlist.count();

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email,
        name,
        position: totalCount + 1,
      },
    });

    if (config.features.waitlist?.confirmationEmail !== false) {
      try {
        const t = await getTranslations({
          locale: DEFAULT_LOCALE,
          namespace: "Emails.Waitlist",
        });
        const emailHtml = await render(
          WaitlistConfirmationEmail({
            messages: {
              preview: t("preview"),
              heading: t("heading"),
              body: t("body", { projectName: config.project.name }),
              position: t("position", {
                position: waitlistEntry.position!.toString(),
              }),
              emailLine: t("emailLine", { email: waitlistEntry.email }),
              footer: t("footer"),
            },
          })
        );

        await resendClient.emails.send({
          from: config.contact.email,
          to: email,
          subject: `You're on the ${config.project.name} waitlist!`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error(
          "Failed to send waitlist confirmation email:",
          emailError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        position: waitlistEntry.position,
        message: "You've been added to the waitlist!",
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
