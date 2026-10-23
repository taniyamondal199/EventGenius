// DOMPurify client/server-safe wrapper
export function sanitizeInput(dirtyText: string | null | undefined): string {
  if (!dirtyText) return "";

  // Basic server-side tag stripping & character escaping for XSS prevention
  return dirtyText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/onload=/gi, "")
    .replace(/onerror=/gi, "")
    .replace(/onclick=/gi, "")
    .trim();
}

export function sanitizeHtml(htmlContent: string | null | undefined): string {
  if (!htmlContent) return "";
  if (typeof window !== "undefined") {
    // Client-side DOMPurify
    try {
      const DOMPurify = require("dompurify");
      return DOMPurify.sanitize(htmlContent);
    } catch {
      return sanitizeInput(htmlContent);
    }
  }
  return sanitizeInput(htmlContent);
}
