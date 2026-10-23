import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { addTimelineItem, updateTimelineItem, deleteTimelineItem } from "@/lib/db/repository";
import { TimelineItemSchema } from "@/types";
import { sanitizeInput } from "@/lib/sanitize";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();
    const body = await req.json();

    const sanitizedBody = {
      ...body,
      title: sanitizeInput(body.title),
      description: body.description ? sanitizeInput(body.description) : undefined,
    };

    const parseResult = TimelineItemSchema.safeParse(sanitizedBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const item = await addTimelineItem(eventId, user.id, parseResult.data);
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add timeline item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();
    const body = await req.json();
    const { itemId, ...updates } = body;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const sanitizedUpdates = {
      ...updates,
      title: updates.title ? sanitizeInput(updates.title) : undefined,
      description: updates.description ? sanitizeInput(updates.description) : undefined,
    };

    const parseResult = TimelineItemSchema.partial().safeParse(sanitizedUpdates);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateTimelineItem(itemId, eventId, user.id, parseResult.data);
    return NextResponse.json({ success: true, item: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update timeline item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId query parameter is required" }, { status: 400 });
    }

    await deleteTimelineItem(itemId, eventId, user.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete timeline item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
