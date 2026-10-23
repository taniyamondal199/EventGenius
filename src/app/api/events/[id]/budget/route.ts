import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { addBudgetItem, updateBudgetItem, deleteBudgetItem } from "@/lib/db/repository";
import { BudgetItemSchema } from "@/types";
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
      name: sanitizeInput(body.name),
      notes: body.notes ? sanitizeInput(body.notes) : undefined,
    };

    const parseResult = BudgetItemSchema.safeParse(sanitizedBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const item = await addBudgetItem(eventId, user.id, parseResult.data);
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to add budget item" }, { status: 500 });
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
      name: updates.name ? sanitizeInput(updates.name) : undefined,
      notes: updates.notes ? sanitizeInput(updates.notes) : undefined,
    };

    const parseResult = BudgetItemSchema.partial().safeParse(sanitizedUpdates);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateBudgetItem(itemId, eventId, user.id, parseResult.data);
    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update budget item" }, { status: 500 });
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

    await deleteBudgetItem(itemId, eventId, user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete budget item" }, { status: 500 });
  }
}
