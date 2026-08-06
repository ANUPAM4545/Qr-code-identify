import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { RBACService } from "@/application/services/RBACService";
import { ScannerService, ScanResult } from "@/application/services/ScannerService";
import { QueuedScan } from "@/application/services/OfflineQueueService";

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

    const hasAccess = await RBACService.checkPermission(session.user.id, event.workspaceId, "member");
    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { queue } = body as { queue: QueuedScan[] };

    if (!queue || !Array.isArray(queue)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const results: Record<string, ScanResult> = {};

    for (const scan of queue) {
      try {
        const result = await ScannerService.processScan(
          event.workspaceId,
          eventId,
          scan.operatorId || session.user.id,
          { qrData: scan.qrPayload, guestId: scan.guestId },
          scan.direction,
          scan.location
        );
        results[scan.id] = result;
      } catch (e: unknown) {
        results[scan.id] = { success: false, status: "warning", reason: (e as Error).message || String(e) };
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}
