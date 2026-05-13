import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { oneTap } from "better-auth/plugins";
import { cookies } from "next/headers";
import { after } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendPasswordResetEmail } from "@/lib/resend/sendPasswordResetEmail";
import { getRequiredEnv } from "@/lib/utils/env";
import {
  trackingParamsSchema,
  type TrackingParams,
} from "@/lib/schemas/trackingParams";
import { createContact as createHubspotContact } from "@/lib/hubspot/contacts";
import { ATTRIBUTION_COOKIE } from "@/lib/constants/attribution";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

async function readAttributionCookie(): Promise<TrackingParams | null> {
  try {
    const store = await cookies();
    const raw = store.get(ATTRIBUTION_COOKIE)?.value;
    if (!raw) return null;
    const parsed = trackingParamsSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || Object.keys(parsed.data).length === 0) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

async function persistTrackingParams(
  userId: string,
  trackingParams: TrackingParams,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { trackingParams },
  });
}

interface SyncHubspotInput {
  email: string;
  firstName: string | null;
  lastName: string | null;
  trackingParams: TrackingParams | null;
}

async function syncToHubspot(input: SyncHubspotInput): Promise<void> {
  const { email, firstName, lastName, trackingParams } = input;
  try {
    await createHubspotContact({
      email,
      properties: {
        ...(firstName ? { firstname: firstName } : {}),
        ...(lastName ? { lastname: lastName } : {}),
        ...(trackingParams ?? {}),
      },
    });
  } catch (error: unknown) {
    const errInfo =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { message: String(error) };
    console.error(
      JSON.stringify({
        scope: "auth.hubspot_failed",
        email,
        ...errInfo,
      }),
    );
  }
}

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
      void (async () => {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { locale: true, firstName: true },
        });
        await sendPasswordResetEmail({
          email: user.email,
          resetUrl: url,
          firstName: dbUser?.firstName ?? undefined,
          locale: dbUser?.locale,
        });
      })().catch((error: unknown) => {
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
      locale: { type: "string", required: false, input: false, defaultValue: "en" },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const trackingParams = await readAttributionCookie();

            // Re-fetch to get the typed user with additionalFields populated
            // (matches the sendResetPassword pattern above and avoids unsafe
            // casts on Better Auth's hook payload).
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { email: true, firstName: true, lastName: true },
            });
            if (!dbUser) return;

            // Local persist is best-effort: a DB error must NOT prevent the
            // HubSpot push (the more important signal). Catch independently.
            if (trackingParams) {
              try {
                await persistTrackingParams(user.id, trackingParams);
              } catch (error: unknown) {
                console.error(
                  JSON.stringify({
                    scope: "auth.persist_tracking_failed",
                    userId: user.id,
                    error: String(error),
                  }),
                );
              }
            }

            // after() keeps the Vercel function alive until the HubSpot HTTP
            // call flushes — without this, fire-and-forget gets killed on
            // serverless teardown.
            after(() =>
              syncToHubspot({
                email: dbUser.email,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
                trackingParams,
              }),
            );
          } catch (error: unknown) {
            console.error(
              JSON.stringify({
                scope: "auth.create_after_failed",
                userId: user.id,
                error: String(error),
              }),
            );
          }
        },
      },
    },
  },
  baseURL,
  secret: getRequiredEnv("BETTER_AUTH_SECRET"),
  trustedOrigins: [baseURL],
  plugins: [oneTap()],
});
