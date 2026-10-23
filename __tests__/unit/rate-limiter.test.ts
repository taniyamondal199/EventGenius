import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit, resetRateLimitStore } from "@/lib/cache/rate-limiter";

describe("Rate Limiter - In-Memory Sliding Window & Boundary Tests", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow initial requests within threshold limit", async () => {
    const res1 = await checkRateLimit("user-test-1", 5, 60);
    expect(res1.success).toBe(true);
    expect(res1.limit).toBe(5);
    expect(res1.remaining).toBe(4);

    const res2 = await checkRateLimit("user-test-1", 5, 60);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(3);
  });

  it("should enforce limit when maximum allowable hits are reached", async () => {
    const id = "rate-limit-cap-user";
    const limit = 3;

    // Hits 1, 2, 3 should all succeed
    for (let i = 0; i < limit; i++) {
      const res = await checkRateLimit(id, limit, 60);
      expect(res.success).toBe(true);
    }

    // 4th hit must fail
    const blockedRes = await checkRateLimit(id, limit, 60);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetInSeconds).toBeGreaterThan(0);
  });

  it("should release tokens once sliding window expires", async () => {
    const id = "sliding-window-user";
    const limit = 2;
    const windowSeconds = 10;

    await checkRateLimit(id, limit, windowSeconds);
    await checkRateLimit(id, limit, windowSeconds);

    // Limit exceeded now
    const overLimitRes = await checkRateLimit(id, limit, windowSeconds);
    expect(overLimitRes.success).toBe(false);

    // Advance clock past the window
    vi.advanceTimersByTime(11 * 1000);

    // Request should now succeed as window expired
    const renewedRes = await checkRateLimit(id, limit, windowSeconds);
    expect(renewedRes.success).toBe(true);
    expect(renewedRes.remaining).toBe(1);
  });

  it("should isolate rate limits across different users/identifiers", async () => {
    const userA = "tenant-a";
    const userB = "tenant-b";

    // Exhaust user A
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(userA, 3, 60);
    }
    const blockedA = await checkRateLimit(userA, 3, 60);
    expect(blockedA.success).toBe(false);

    // User B should remain completely unaffected
    const freshB = await checkRateLimit(userB, 3, 60);
    expect(freshB.success).toBe(true);
    expect(freshB.remaining).toBe(2);
  });

  it("should correctly handle single-hit burst limit (limit = 1)", async () => {
    const id = "strict-limit-user";
    const first = await checkRateLimit(id, 1, 30);
    expect(first.success).toBe(true);
    expect(first.remaining).toBe(0);

    const second = await checkRateLimit(id, 1, 30);
    expect(second.success).toBe(false);
  });
});
