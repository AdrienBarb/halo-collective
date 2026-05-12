import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db/prisma";
import { sendPasswordResetEmail } from "@/lib/resend/sendPasswordResetEmail";
import { getRequiredEnv } from "@/lib/utils/env";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      // Fire-and-forget per Better Auth docs (avoids timing attacks).
      void sendPasswordResetEmail({
        email: user.email,
        resetUrl: url,
      }).catch((error: unknown) => {
        console.error(
          JSON.stringify({
            scope: "auth.send_reset_password_failed",
            error: String(error),
          }),
        );
      });
    },
  },
  socialProviders: {
    google: {
      clientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
      mapProfileToUser: (profile) => {
        const fallback = (profile.name ?? "").trim().split(/\s+/);
        return {
          firstName: profile.given_name ?? fallback[0] ?? "",
          lastName:
            profile.family_name ?? fallback.slice(1).join(" ") ?? "",
        };
      },
    },
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: false, input: true },
      lastName: { type: "string", required: false, input: true },
      countryCode: { type: "string", required: false, input: true },
      phone: { type: "string", required: false, input: true },
      role: { type: "string", required: false, input: false, defaultValue: "USER" },
    },
  },
  baseURL,
  secret: getRequiredEnv("BETTER_AUTH_SECRET"),
  trustedOrigins: [baseURL],
});
