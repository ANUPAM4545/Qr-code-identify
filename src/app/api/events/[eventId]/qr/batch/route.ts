import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { BulkGenerationService } from "@/application/services/BulkGenerationService";

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const event = await eventRepository.findById(eventId);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { name, design, options, destinationUrlBase } = body;

    if (!options?.quantity || options.quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const result = await BulkGenerationService.generateSequentialBatch(
      session.user.id,
      event.workspaceId,
      eventId,
      name || "Bulk QR",
      design || {},
      options,
      destinationUrlBase
    );

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = await params;
  const event = await eventRepository.findById(eventId);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const searchParams = req.nextUrl.searchParams;
  const batchId = searchParams.get("batchId");
  
  if (!batchId) return NextResponse.json({ error: "Missing batchId" }, { status: 400 });

  const client = await (await import("@/infrastructure/db")).default;
  const collection = client.db().collection("qr_codes");

  const qrs = await collection.find({ workspaceId: event.workspaceId, eventId, batchId }).sort({ sequence: 1 }).toArray();

  return NextResponse.json({
    batchId,
    quantity: qrs.length,
    qrs: qrs.map((q: any) => ({ ...q, _id: q._id.toString() }))
  });
}
