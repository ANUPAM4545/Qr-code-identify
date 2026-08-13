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
    
    // Fetch associated guests to get qrCodeId
    const { guestRepository } = await import("@/infrastructure/repositories/GuestRepository");
    const { ObjectId } = await import("mongodb");
    const guestIds = submissions.map(s => s.guestId ? s.guestId.toString() : undefined).filter(Boolean) as string[];
    
    let guestMap: Record<string, string> = {}; // guestId -> qrCodeId
    if (guestIds.length > 0) {
      const guests = await guestRepository.findByIds(guestIds);
      
      guestMap = guests.reduce((acc: Record<string, string>, guest: import("@/domain/types").GuestDocument) => {
        if (guest.qrCodeId) {
          acc[guest._id!.toString()] = guest.qrCodeId;
        }
        return acc;
      }, {} as Record<string, string>);
    }

    const populatedSubmissions = submissions.map(sub => ({
      ...sub,
      guestId: sub.guestId ? sub.guestId.toString() : undefined,
      qrCodeId: sub.guestId ? guestMap[sub.guestId.toString()] : undefined
    }));
    
    return NextResponse.json(populatedSubmissions);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}
