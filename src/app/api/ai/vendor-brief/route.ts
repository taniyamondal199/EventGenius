import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/cache/rate-limiter";
import { AIVendorBriefRequestSchema } from "@/types";
import { generateVendorScope } from "@/lib/ai/structured-ai";
import { sanitizeInput } from "@/lib/sanitize";
import { detectPromptInjection } from "@/lib/ai/prompt-guardrails";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    // 1. Sliding window rate limit check
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

    // 2. Parse and sanitize input
    const body = await req.json();
    const sanitizedBody = {
      ...body,
      category: sanitizeInput(body.category),
      style: sanitizeInput(body.style),
      location: body.location ? sanitizeInput(body.location) : undefined,
    };

    const parseResult = AIVendorBriefRequestSchema.safeParse(sanitizedBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid vendor brief request", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // 3. Prompt injection check
    if (detectPromptInjection(parseResult.data.style)) {
      return NextResponse.json(
        { error: "Prompt security violation detected in style parameters." },
        { status: 400 }
      );
    }

    // 4. Generate Vendor Scope and RFP
    const brief = await generateVendorScope(parseResult.data);

    return NextResponse.json({
      success: true,
      data: brief,
      rateLimitRemaining: rateLimit.remaining,
    });
  } catch (error: any) {
    console.error("AI Vendor Brief Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate vendor brief and RFP" },
      { status: 500 }
    );
  }
}
