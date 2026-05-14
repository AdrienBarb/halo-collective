// Defense in depth — Zod schemas at the publish/admin boundary already
// reject non-https URLs at write time. This is the runtime backstop for
// stale rows that might carry `javascript:` / `data:` hrefs.
export function safeHttpUrl(url: string | null | undefined): string {
  if (!url) return "#";
  return /^https?:\/\//i.test(url) ? url : "#";
}

// Same guard, but allows the literal `{{ unsubscribe }}` Brevo placeholder
// — Brevo substitutes it at send time with a real https URL.
export function safeUnsubscribeUrl(url: string): string {
  if (url === "{{ unsubscribe }}") return url;
  return safeHttpUrl(url);
}
