import { describe, it, expect } from "vitest";
import { sanitizeInput, sanitizeHtml } from "@/lib/sanitize";

describe("Sanitize Utilities - Input & HTML Security", () => {
  describe("sanitizeInput", () => {
    it("should return empty string for null, undefined, or empty inputs", () => {
      expect(sanitizeInput("")).toBe("");
      expect(sanitizeInput(null)).toBe("");
      expect(sanitizeInput(undefined)).toBe("");
    });

    it("should strip <script> tags completely to prevent XSS", () => {
      const malicious = 'Hello <script>alert("XSS")</script> World';
      expect(sanitizeInput(malicious)).toBe("Hello  World");
    });

    it("should strip nested and multiline <script> tags", () => {
      const malicious = `<script type="text/javascript">
        window.location = "http://attacker.com";
      </script>Safe Content`;
      expect(sanitizeInput(malicious)).toBe("Safe Content");
    });

    it("should strip malicious iframe injections", () => {
      const malicious = '<iframe src="http://attacker.com/cookie-stealer"></iframe>Event Venue';
      expect(sanitizeInput(malicious)).toBe("Event Venue");
    });

    it("should strip javascript: pseudo-protocol URIs", () => {
      const malicious = 'javascript:alert(document.cookie)';
      expect(sanitizeInput(malicious)).toBe("alert(document.cookie)");
    });

    it("should strip inline event handlers like onload, onerror, onclick", () => {
      const malicious1 = '<img src="x" onerror="alert(1)">';
      expect(sanitizeInput(malicious1)).not.toContain("onerror=");

      const malicious2 = '<body onload="maliciousFunction()">';
      expect(sanitizeInput(malicious2)).not.toContain("onload=");

      const malicious3 = '<button onclick="exploit()">Click</button>';
      expect(sanitizeInput(malicious3)).not.toContain("onclick=");
    });

    it("should preserve legitimate strings, accents, and punctuation", () => {
      const safe = "Liam & Chloe's 25th Silver Anniversary: Napa Valley Winery, $45,000 budget.";
      expect(sanitizeInput(safe)).toBe(safe);
    });
  });

  describe("sanitizeHtml", () => {
    it("should handle empty or null html content safely", () => {
      expect(sanitizeHtml("")).toBe("");
      expect(sanitizeHtml(null)).toBe("");
      expect(sanitizeHtml(undefined)).toBe("");
    });

    it("should sanitize dangerous script payloads in rich html", () => {
      const dirtyHtml = '<p>Welcome!</p><script>eval(attackerCode)</script>';
      const cleaned = sanitizeHtml(dirtyHtml);
      expect(cleaned).not.toContain("<script>");
      expect(cleaned).not.toContain("eval(attackerCode)");
    });
  });
});
