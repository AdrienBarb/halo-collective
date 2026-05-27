export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Font stacks like `"SF Mono", Menlo, ...` contain literal double quotes
// that explode when embedded in an HTML `style="..."` attribute string.
// Switch to single quotes — both forms are valid CSS font-family syntax.
export function singleQuoteFontStack(stack: string): string {
  return stack.replace(/"/g, "'");
}
