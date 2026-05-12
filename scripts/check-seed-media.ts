import "dotenv/config";
import { supabaseStorage } from "@/lib/storage/client";

const expected = [
  "athlete-arthur-rinderknech-avatar.jpg",
  "sponsor-arthur-psycho-bunny.png",
  "sponsor-arthur-tecnifibre.png",
  "sponsor-arthur-extia.png",
  "sponsor-arthur-fosvia.png",
  "arthur-indian-wells-hero.png",
  "arthur-indian-wells-logo.png",
  "arthur-indian-wells-kit.jpg",
  "arthur-miami-hero.png",
  "arthur-miami-logo.png",
  "arthur-miami-recovery.jpg",
];

async function main() {
  const bucket = supabaseStorage.storage.from("media");
  const { data, error } = await bucket.list("seed", { limit: 1000 });
  if (error) { console.error(error); process.exit(1); }

  const byName = new Map((data ?? []).map((e) => [e.name, e]));
  console.log(`Found ${byName.size} file(s) in media/seed/ — checking ${expected.length} expected:\n`);

  let missing = 0;
  for (const f of expected) {
    const entry = byName.get(f);
    const size = entry?.metadata?.size ?? 0;
    const ok = !!entry && size > 0;
    if (!ok) missing++;
    const url = bucket.getPublicUrl(`seed/${f}`).data.publicUrl;
    let httpStatus = "n/a";
    let ct = "n/a";
    if (entry) {
      try {
        const r = await fetch(url, { method: "HEAD" });
        httpStatus = String(r.status);
        ct = r.headers.get("content-type") ?? "n/a";
      } catch (e) {
        httpStatus = `err: ${(e as Error).message}`;
      }
    }
    console.log(`${ok ? "✓" : "✗"} ${f}  ${size}B  HEAD ${httpStatus}  ${ct}`);
  }
  console.log(`\n${missing === 0 ? "✅ all uploaded & served" : `❌ ${missing} missing/empty`}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
