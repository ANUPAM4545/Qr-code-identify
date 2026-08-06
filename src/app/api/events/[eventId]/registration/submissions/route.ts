import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { registrationSubmissionRepository } from "@/infrastructure/repositories/RegistrationSubmissionRepository";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { RBACService } from "@/application/services/RBACService";

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

    const submissions = await registrationSubmissionRepository.findByEventId(eventId);
    
    return NextResponse.json(submissions);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}
