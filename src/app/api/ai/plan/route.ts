import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/cache/rate-limiter";
import { AIPlanRequestSchema } from "@/types";
import { detectPromptInjection } from "@/lib/ai/prompt-guardrails";
import { generateEventBlueprint } from "@/lib/ai/structured-ai";
import { sanitizeInput } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    // 1. Sliding window rate limit check (20 AI requests per user/hour)
    const rateLimit = await checkRateLimit(user.id, 20, 3600);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Maximum 20 AI planning requests per hour allowed.",
          resetInSeconds: rateLimit.resetInSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate payload
    const body = await req.json();
    const sanitizedBody = {
      ...body,
      location: sanitizeInput(body.location),
      styleKeywords: sanitizeInput(body.styleKeywords),
    };

    const parseResult = AIPlanRequestSchema.safeParse(sanitizedBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid event plan request parameters", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // 3. Prompt injection detection
    if (detectPromptInjection(parseResult.data.styleKeywords)) {
      return NextResponse.json(
        { error: "Prompt security violation detected: forbidden instructions in style keywords." },
        { status: 400 }
      );
    }

    // 4. Generate structured blueprint
    const blueprint = await generateEventBlueprint(parseResult.data);

    return NextResponse.json({
      success: true,
      data: blueprint,
      rateLimitRemaining: rateLimit.remaining,
    });
  } catch (error: unknown) {
    console.error("AI Plan Route Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate AI event plan";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
