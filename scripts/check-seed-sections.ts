import "dotenv/config";
import { prisma } from "@/lib/db/prisma";
import { safeParseSectionBlocks } from "@/lib/schemas/newsletterSection";

const EXPECTED_ORDER = [
  "ATHLETE_REVIEW",
  "WEEK_RECAP",
  "COMING_UP",
  "MONETISATION",
  "FAN_ENGAGEMENT",
] as const;

async function main() {
  const newsletters = await prisma.newsletter.findMany({
    include: { sections: { orderBy: { order: "asc" } } },
    orderBy: { editionNumber: "asc" },
  });

  if (newsletters.length === 0) {
    console.error("✗ no newsletters found");
    process.exit(1);
  }

  let allOk = true;
  for (const n of newsletters) {
    console.log(`\n── #${n.editionNumber} ${n.slug} (${n.editionMode}) ──`);
    console.log(`   sections: ${n.sections.length}/5`);

    const actualTypes = n.sections.map((s) => s.type);
    const orderOk =
      actualTypes.length === 5 &&
      EXPECTED_ORDER.every((t, i) => actualTypes[i] === t);
    console.log(`   order: ${orderOk ? "✓" : "✗"} ${actualTypes.join(" → ")}`);
    if (!orderOk) allOk = false;

    for (const s of n.sections) {
      const parsed = safeParseSectionBlocks(
        s.type,
        n.editionMode,
        s.blocks,
      );
      const blocks = Array.isArray(s.blocks) ? s.blocks.length : 0;
      if (parsed.success) {
        console.log(`   ✓ ${String(s.order + 1).padStart(1)} ${s.type.padEnd(18)} ${blocks} block(s)`);
      } else {
        allOk = false;
        console.log(`   ✗ ${String(s.order + 1).padStart(1)} ${s.type.padEnd(18)} ${blocks} block(s) — INVALID`);
        for (const issue of parsed.error.issues) {
          console.log(`        - [${issue.path.join(".")}] ${issue.message}`);
        }
      }
    }
  }

  console.log(`\n${allOk ? "✅ all sections valid" : "❌ validation failures above"}`);
  process.exit(allOk ? 0 : 1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
