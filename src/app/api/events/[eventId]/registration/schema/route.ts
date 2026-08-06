import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { registrationFormRepository } from "@/infrastructure/repositories/RegistrationFormRepository";
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

    const form = await registrationFormRepository.getOrCreateForEvent(event.workspaceId, eventId);
    
    return NextResponse.json(form);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventId } = await params;
    const event = await eventRepository.findById(eventId);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const hasAccess = await RBACService.checkPermission(session.user.id, event.workspaceId, "manager");
    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { fields, settings, branding } = body;

    const form = await registrationFormRepository.getOrCreateForEvent(event.workspaceId, eventId);
    
    const updates: Record<string, unknown> = {};
    if (fields) updates.fields = fields;
    if (settings) updates.settings = settings;
    if (branding) updates.branding = branding;
    updates.updatedAt = new Date();

    await registrationFormRepository.update(form._id as string, updates);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}
