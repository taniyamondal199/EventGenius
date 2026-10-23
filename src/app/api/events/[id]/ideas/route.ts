import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { addAIIdea, toggleFavoriteIdea } from "@/lib/db/repository";
import { sanitizeInput } from "@/lib/sanitize";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();
    const { category, content } = await req.json();

    if (!category || !content) {
      return NextResponse.json({ error: "category and content are required" }, { status: 400 });
    }

    const cleanContent = sanitizeInput(content);
    const idea = await addAIIdea(eventId, user.id, category, cleanContent);
    return NextResponse.json({ success: true, idea }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to add idea" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();
    const { ideaId } = await req.json();

    if (!ideaId) {
      return NextResponse.json({ error: "ideaId is required" }, { status: 400 });
    }

    const updated = await toggleFavoriteIdea(ideaId, eventId, user.id);
    return NextResponse.json({ success: true, idea: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to toggle idea favorite" }, { status: 500 });
  }
}
