import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "@/lib/db/prisma";
import { sendOtpEmail } from "@/lib/resend/sendOtpEmail";
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
  plugins: [
    emailOTP({
      disableSignUp: true,
      sendVerificationOTP: async ({ email, otp }) => {
        await sendOtpEmail({ email, otp });
      },
    }),
  ],
  baseURL,
  secret: getRequiredEnv("BETTER_AUTH_SECRET"),
  trustedOrigins: [baseURL],
});
