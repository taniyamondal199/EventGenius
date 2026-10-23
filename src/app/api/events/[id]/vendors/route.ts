import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { addVendorItem, updateVendorItem, deleteVendorItem } from "@/lib/db/repository";
import { VendorChecklistSchema } from "@/types";
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
      category: sanitizeInput(body.category),
      vendorName: sanitizeInput(body.vendorName),
      notes: body.notes ? sanitizeInput(body.notes) : undefined,
    };

    const parseResult = VendorChecklistSchema.safeParse(sanitizedBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const vendor = await addVendorItem(eventId, user.id, parseResult.data);
    return NextResponse.json({ success: true, vendor }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to add vendor" }, { status: 500 });
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
    const { vendorId, ...updates } = body;

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    const sanitizedUpdates = {
      ...updates,
      category: updates.category ? sanitizeInput(updates.category) : undefined,
      vendorName: updates.vendorName ? sanitizeInput(updates.vendorName) : undefined,
      notes: updates.notes ? sanitizeInput(updates.notes) : undefined,
    };

    const parseResult = VendorChecklistSchema.partial().safeParse(sanitizedUpdates);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateVendorItem(vendorId, eventId, user.id, parseResult.data);
    return NextResponse.json({ success: true, vendor: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update vendor" }, { status: 500 });
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
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId query parameter is required" }, { status: 400 });
    }

    await deleteVendorItem(vendorId, eventId, user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete vendor" }, { status: 500 });
  }
}
