import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { supabaseStorage } from "@/lib/storage/client";

async function main() {
  console.log("\n=== BUCKET CONFIG ===");
  const { data: bucket, error: bucketError } =
    await supabaseStorage.storage.getBucket("media");
  if (bucketError) {
    console.error("ERROR:", bucketError);
    process.exit(1);
  }
  console.log(JSON.stringify(bucket, null, 2));

  console.log("\n=== RLS CHECK (anon write attempt) ===");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) {
    console.log("⚠️  NEXT_PUBLIC_SUPABASE_URL not set");
    return;
  }
  if (!anonKey) {
    console.log(
      "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not set — skipping RLS check",
    );
    return;
  }

  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Minimal 1x1 transparent PNG — passes allowedMimeTypes so we actually
  // test RLS, not the bucket MIME filter.
  const pngBytes = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  const probePath = `__rls_probe_${Date.now()}.png`;
  const probeFile = new Blob([pngBytes], { type: "image/png" });

  const { error: uploadError } = await anon.storage
    .from("media")
    .upload(probePath, probeFile, { contentType: "image/png" });

  if (uploadError) {
    console.log(
      `✅ RLS bloque les uploads anon (good): ${uploadError.message}`,
    );
  } else {
    console.log(
      `❌ DANGER: l'anon key a pu écrire ${probePath} dans le bucket media`,
    );
    console.log(
      `   → RLS n'est pas active sur storage.objects, n'importe qui peut uploader`,
    );

    // Cleanup with service-role
    await supabaseStorage.storage.from("media").remove([probePath]);
    console.log(`   (probe nettoyée: ${probePath})`);
  }
}

main();
