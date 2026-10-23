import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getEventById, updateEvent, deleteEvent, canUserAccessEvent } from "@/lib/db/repository";
import { CreateEventSchema } from "@/types";
import { sanitizeInput } from "@/lib/sanitize";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const canView = await canUserAccessEvent(id, user.id, "VIEWER");
    if (!canView) {
      return NextResponse.json({ error: "Access denied or event not found" }, { status: 403 });
    }

    const event = await getEventById(id, user.id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const canEdit = await canUserAccessEvent(id, user.id, "COLLABORATOR");
    if (!canEdit) {
      return NextResponse.json({ error: "Unauthorized: Collaborator or Owner role required" }, { status: 403 });
    }

    const body = await req.json();
    const sanitizedBody = {
      ...body,
      title: body.title ? sanitizeInput(body.title) : undefined,
      location: body.location ? sanitizeInput(body.location) : undefined,
      themeNotes: body.themeNotes ? sanitizeInput(body.themeNotes) : undefined,
    };

    const parseResult = CreateEventSchema.partial().safeParse(sanitizedBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateEvent(id, user.id, parseResult.data);
    return NextResponse.json({ success: true, event: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const canDelete = await canUserAccessEvent(id, user.id, "OWNER");
    if (!canDelete) {
      return NextResponse.json({ error: "Only the event Owner can delete an event" }, { status: 403 });
    }

    await deleteEvent(id, user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete event" }, { status: 500 });
  }
}
