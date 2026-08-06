import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RBACService } from "@/application/services/RBACService";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { AnalyticsService } from "@/application/services/AnalyticsService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventId } = await params;
    const event = await eventRepository.findById(eventId);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const hasAccess = await RBACService.checkPermission(session.user.id, event.workspaceId, "viewer");
    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // For a real CSV export, we'd pull detailed logs or guest lists and parse it into CSV.
    // For this implementation, we will export a mock JSON of the KPIs.
    const data = await AnalyticsService.getEventKPIs(eventId);
    
    return NextResponse.json(data, {
      headers: {
        "Content-Disposition": `attachment; filename="analytics_export_${eventId}.json"`,
        "Content-Type": "application/json"
      }
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}
