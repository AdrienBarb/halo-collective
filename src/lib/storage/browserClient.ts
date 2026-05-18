// Browser-side Supabase client. Used ONLY by useDirectUpload to call
// uploadToSignedUrl with a signed token issued by an admin-guarded route.
//
// Security depends on RLS being enabled on storage.objects with no
// anon INSERT/UPDATE/DELETE policy for the media bucket. See
// scripts/configure-media-bucket.ts for the required SQL.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — required for browser uploads",
  );
}

export const supabaseBrowser = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
