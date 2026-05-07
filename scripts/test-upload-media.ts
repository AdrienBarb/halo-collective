import "dotenv/config";
import { uploadMedia } from "@/lib/storage/uploadMedia";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

async function main() {
  const url = await uploadMedia({
    file: TINY_PNG,
    contentType: "image/png",
    pathPrefix: "test",
    filename: `phase0-${Date.now()}.png`,
  });
  console.log("✓ uploadMedia OK");
  console.log("public URL:", url);
}

main().catch((err) => {
  console.error("✗ uploadMedia failed");
  console.error(err);
  process.exit(1);
});
