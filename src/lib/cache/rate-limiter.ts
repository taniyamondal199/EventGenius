/**
 * Sliding Window Rate Limiter
 * Supports Upstash Redis REST API when configured,
 * with an in-memory sliding window fallback for local development and offline resilience.
 */

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

// In-memory sliding window store: Map<identifier, timestamp[]>
const inMemoryStore = new Map<string, number[]>();

export async function checkRateLimit(
  identifier: string,
  limit: number = 20,
  windowSeconds: number = 3600
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Try Upstash Redis if configured with a valid token
  if (upstashUrl && upstashToken && !upstashToken.includes("*")) {
    try {
      const now = Date.now();
      const clearBefore = now - windowSeconds * 1000;
      const key = `ratelimit:${identifier}`;

      // Redis sliding window using sorted sets via REST pipeline
      const pipelineRes = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["ZREMRANGEBYSCORE", key, 0, clearBefore],
          ["ZCARD", key],
          ["ZADD", key, now, `${now}-${Math.random()}`],
          ["EXPIRE", key, windowSeconds],
        ]),
      });

      if (pipelineRes.ok) {
        const data = await pipelineRes.json();
        const currentCount = (data[1]?.result as number) || 0;

        if (currentCount >= limit) {
          return {
            success: false,
            limit,
            remaining: 0,
            resetInSeconds: windowSeconds,
          };
        }

        return {
          success: true,
          limit,
          remaining: Math.max(0, limit - currentCount - 1),
          resetInSeconds: windowSeconds,
        };
      }
    } catch (err) {
      console.warn("Upstash Redis rate limiter error, falling back to in-memory:", err);
    }
  }

  // 2. Fallback: In-memory sliding window
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const timestamps = inMemoryStore.get(identifier) || [];
  // Keep only timestamps within the current sliding window
  const validTimestamps = timestamps.filter((ts) => ts > windowStart);

  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0];
    const resetInSeconds = Math.ceil((oldestTimestamp + windowSeconds * 1000 - now) / 1000);
    inMemoryStore.set(identifier, validTimestamps);
    return {
      success: false,
      limit,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  validTimestamps.push(now);
  inMemoryStore.set(identifier, validTimestamps);

  return {
    success: true,
    limit,
    remaining: limit - validTimestamps.length,
    resetInSeconds: windowSeconds,
  };
}
