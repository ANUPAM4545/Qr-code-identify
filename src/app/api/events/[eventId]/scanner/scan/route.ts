import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { RBACService } from "@/application/services/RBACService";
import { ScannerService } from "@/application/services/ScannerService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventId } = await params;
    const event = await eventRepository.findById(eventId);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    // Ensure the operator has scanner permission
    const hasAccess = await RBACService.checkPermission(session.user.id, event.workspaceId, "member");
    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { qrData, guestId, direction, location } = body;

    if (!qrData && !guestId) {
      return NextResponse.json({ error: "Either qrData or guestId must be provided" }, { status: 400 });
    }

    const result = await ScannerService.processScan(
      event.workspaceId,
      eventId,
      session.user.id,
      { qrData, guestId },
      direction || "in",
      location
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}
