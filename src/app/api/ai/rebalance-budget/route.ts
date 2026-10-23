import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/cache/rate-limiter";
import { AIRebalanceRequestSchema } from "@/types";
import { generateBudgetRebalance } from "@/lib/ai/structured-ai";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    // 1. Sliding window rate limit check (20 AI requests per user/hour)
    const rateLimit = await checkRateLimit(user.id, 20, 3600);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Maximum 20 AI requests per hour allowed.",
          resetInSeconds: rateLimit.resetInSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate input
    const body = await req.json();
    const parseResult = AIRebalanceRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid budget rebalance parameters", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // 3. Generate budget optimization analysis
    const analysis = await generateBudgetRebalance(parseResult.data);

    return NextResponse.json({
      success: true,
      data: analysis,
      rateLimitRemaining: rateLimit.remaining,
    });
  } catch (error: unknown) {
    console.error("AI Budget Rebalance Error:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze and rebalance budget";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
