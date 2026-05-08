import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { prisma } from "@/lib/db/prisma";
import { resendClient } from "@/lib/resend/resendClient";
import { MagicLinkEmail } from "@/lib/emails/MagicLinkEmail";
import { getRequiredEnv } from "@/lib/utils/env";
import config from "@/lib/config";

const fromEmail = () => getRequiredEnv("RESEND_FROM_EMAIL");

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const result = await resendClient.emails.send({
          from: fromEmail(),
          to: email,
          subject: `Sign in to ${config.project.name}`,
          react: MagicLinkEmail({ magicLink: url }),
        });

        if (result.error) {
          console.error("Resend API error:", result.error);
          throw new Error("Could not send magic link");
        }
      },
    }),
  ],
  baseURL,
  secret: getRequiredEnv("BETTER_AUTH_SECRET"),
  trustedOrigins: [baseURL],
});
