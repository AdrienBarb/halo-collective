import { supabaseStorage } from "./client";
import { MEDIA_BUCKET } from "./bucketConfig";

const SAFE_PATH_SEGMENT = /^[A-Za-z0-9._-]+$/;

export type SignedUploadResult = {
  path: string;
  token: string;
  publicUrl: string;
};

export function assertSafeSegment(segment: string, label: string): void {
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

export async function createSignedMediaUpload(input: {
  pathPrefix: string;
  filename: string;
}): Promise<SignedUploadResult> {
  const path = buildObjectPath(input.pathPrefix, input.filename);

  const { data, error } = await supabaseStorage.storage
    .from(MEDIA_BUCKET)
    .createSignedUploadUrl(path, { upsert: false });

  if (error || !data) {
    throw error ?? new Error("Failed to create signed upload URL");
  }

  const { data: publicData } = supabaseStorage.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path);

  return {
    path: data.path,
    token: data.token,
    publicUrl: publicData.publicUrl,
  };
}
