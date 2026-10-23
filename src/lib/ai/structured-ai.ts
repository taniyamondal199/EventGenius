import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  AIPlanRequest,
  AIPlanOutput,
  AIPlanOutputSchema,
  AIRebalanceRequest,
  AIRebalanceOutput,
  AIRebalanceOutputSchema,
  AIVendorBriefRequest,
  AIVendorBriefOutput,
  AIVendorBriefOutputSchema,
} from "@/types";
import { SYSTEM_SECURITY_BOUNDARY, wrapUntrustedContext } from "./prompt-guardrails";
import {
  generateHeuristicEventPlan,
  generateHeuristicBudgetRebalance,
  generateHeuristicVendorBrief,
} from "./heuristics-generator";

/**
 * AI Service Integration Layer
 * Uses Vercel AI SDK generateObject with strict Zod parsing,
 * with automatic high-fidelity fallback when OPENAI_API_KEY is not configured.
 */

export async function generateEventBlueprint(input: AIPlanRequest): Promise<AIPlanOutput> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    // High-fidelity domain heuristic response
    return generateHeuristicEventPlan(input);
  }

  try {
    const prompt = `
${SYSTEM_SECURITY_BOUNDARY}

TASK: Act as the master AI Event Architect.
Analyze the following event parameters inside the XML tag and generate a comprehensive event blueprint:
- Suggested budget breakdown across all 7 categories (CATERING, VENUE, DECOR, ENTERTAINMENT, PHOTO_VIDEO, ATTIRE, MISC) with rationales.
- Day-of and preparation timeline milestone suggestions.
- Curated vendor checklist checklist items tailored to the scale.
- Exactly 5 personalized creative ideas (interactive guest activities, custom signature cocktails, community engagement formats).

${wrapUntrustedContext(input)}
`;

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: AIPlanOutputSchema,
      prompt,
      temperature: 0.7,
    });

    return result.object;
  } catch (error) {
    console.warn("OpenAI generation failed or rate limited, falling back to heuristic engine:", error);
    return generateHeuristicEventPlan(input);
  }
}

export async function generateBudgetRebalance(input: AIRebalanceRequest): Promise<AIRebalanceOutput> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return generateHeuristicBudgetRebalance(input);
  }

  try {
    const prompt = `
${SYSTEM_SECURITY_BOUNDARY}

TASK: Act as an expert Event Financial Controller and AI Budget Optimizer.
Analyze the budget items, estimated costs, and actual costs inside the XML tag:
- Provide health score (0-100) and health status.
- Highlight warning flags for categories running over 15% above target.
- Formulate practical rebalancing recommendations and cost-cutting trade-offs.

${wrapUntrustedContext(input)}
`;

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: AIRebalanceOutputSchema,
      prompt,
      temperature: 0.4,
    });

    return result.object;
  } catch (error) {
    console.warn("OpenAI budget rebalance failed, falling back to heuristic engine:", error);
    return generateHeuristicBudgetRebalance(input);
  }
}

export async function generateVendorScope(input: AIVendorBriefRequest): Promise<AIVendorBriefOutput> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return generateHeuristicVendorBrief(input);
  }

  try {
    const prompt = `
${SYSTEM_SECURITY_BOUNDARY}

TASK: Act as a master Event Procurement Specialist and Vendor Scope Generator.
For the specified category, aesthetic style, and budget limit inside the XML tag:
- Generate a ready-to-send professional Request for Proposal (RFP) message.
- Outline essential scope-of-work deliverables.
- Provide key questions to ask candidates during interviews.
- Highlight specific red flags to watch out for before signing.

${wrapUntrustedContext(input)}
`;

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: AIVendorBriefOutputSchema,
      prompt,
      temperature: 0.6,
    });

    return result.object;
  } catch (error) {
    console.warn("OpenAI vendor brief failed, falling back to heuristic engine:", error);
    return generateHeuristicVendorBrief(input);
  }
}
