/**
 * Configure the `media` Supabase Storage bucket with fileSizeLimit and
 * allowedMimeTypes. Run once per environment.
 *
 * SECURITY — RLS REQUIREMENT
 * --------------------------
 * The browser holds NEXT_PUBLIC_SUPABASE_ANON_KEY and uses it (via
 * uploadToSignedUrl) to PUT bytes directly to the bucket. The signed token
 * issued by an admin-guarded route is the *intended* write authorization.
 *
 * Without RLS on storage.objects, the anon key could be used to upload to
 * ANY path in the bucket without going through any admin route. That would
 * defeat the entire adminGuard chain.
 *
 * In the Supabase SQL editor, ensure RLS is enabled and anon writes are
 * denied for the media bucket. Recommended policy:
 *
 *   alter table storage.objects enable row level security;
 *
 *   create policy "media: anon read"
 *     on storage.objects for select to anon
 *     using (bucket_id = 'media');
 *
 *   -- no INSERT/UPDATE/DELETE policy for anon → service_role still works
 *   -- and signed uploads still work (token bypasses RLS).
 *
 * Verify by running with the anon key:
 *   curl -X POST "$URL/storage/v1/object/media/test.png" \
 *     -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
 *     --data-binary @test.png
 * Should return 403 / "new row violates row-level security policy".
 */
import "dotenv/config";
import { supabaseStorage } from "@/lib/storage/client";
import {
  MEDIA_BUCKET,
  getMediaBucketConfig,
} from "@/lib/storage/bucketConfig";

async function main() {
  const before = await supabaseStorage.storage.getBucket(MEDIA_BUCKET);
  if (before.error) {
    console.error("Failed to read bucket:", before.error);
    process.exit(1);
  }
  console.log("Before:", JSON.stringify(before.data, null, 2));

  const config = getMediaBucketConfig();
  const update = await supabaseStorage.storage.updateBucket(
    MEDIA_BUCKET,
    config,
  );
  if (update.error) {
    console.error("Failed to update bucket:", update.error);
    process.exit(1);
  }

  const after = await supabaseStorage.storage.getBucket(MEDIA_BUCKET);
  console.log("After:", JSON.stringify(after.data, null, 2));
  console.log(
    `\n✓ ${MEDIA_BUCKET} bucket configured: fileSizeLimit=${config.fileSizeLimit}, allowedMimeTypes=${config.allowedMimeTypes.length} types`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
