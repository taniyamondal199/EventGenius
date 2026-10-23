import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserEvents, createEvent } from "@/lib/db/repository";
import { CreateEventSchema } from "@/types";
import { sanitizeInput } from "@/lib/sanitize";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const events = await getUserEvents(user.id);
    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const sanitizedBody = {
      ...body,
      title: sanitizeInput(body.title),
      location: sanitizeInput(body.location),
      themeNotes: body.themeNotes ? sanitizeInput(body.themeNotes) : undefined,
    };

    const parseResult = CreateEventSchema.safeParse(sanitizedBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const event = await createEvent(user.id, parseResult.data);
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create event" }, { status: 500 });
  }
}
