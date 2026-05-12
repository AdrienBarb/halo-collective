import { randomUUID } from "node:crypto";
import { supabaseStorage } from "./client";

const MEDIA_BUCKET = "media";
const SAFE_PATH_SEGMENT = /^[A-Za-z0-9._-]+$/;

type UploadInput = {
  file: Buffer | Blob | File | ArrayBuffer | Uint8Array;
  contentType: string;
  pathPrefix?: string;
  filename?: string;
};

function assertSafeSegment(segment: string, label: string): void {
  if (segment === "." || segment === "..") {
    throw new Error(`Invalid ${label}: traversal segment`);
  }
  if (!SAFE_PATH_SEGMENT.test(segment)) {
    throw new Error(`Invalid ${label}: must match ${SAFE_PATH_SEGMENT}`);
  }
}

function buildObjectPath(pathPrefix: string | undefined, name: string): string {
  assertSafeSegment(name, "filename");
  if (!pathPrefix) return name;
  const segments = pathPrefix.split("/").filter(Boolean);
  for (const s of segments) assertSafeSegment(s, "pathPrefix segment");
  return [...segments, name].join("/");
}

function extensionFromContentType(contentType: string): string {
  const subtype = contentType.split("/")[1] ?? "bin";
  return subtype.split(";")[0].trim() || "bin";
}

export async function uploadMedia({
  file,
  contentType,
  pathPrefix,
  filename,
}: UploadInput): Promise<string> {
  const name = filename ?? `${randomUUID()}.${extensionFromContentType(contentType)}`;
  const objectPath = buildObjectPath(pathPrefix, name);

  const { error: uploadError } = await supabaseStorage.storage
    .from(MEDIA_BUCKET)
    .upload(objectPath, file, { contentType, upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabaseStorage.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(objectPath);

  return data.publicUrl;
}
