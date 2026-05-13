import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  oneTapClient,
} from "better-auth/client/plugins";
import type { auth } from "@/lib/better-auth/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  plugins: [
    inferAdditionalFields<typeof auth>(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
    }),
  ],
});

export const { signIn, signOut, signUp, useSession, $Infer } = authClient;
