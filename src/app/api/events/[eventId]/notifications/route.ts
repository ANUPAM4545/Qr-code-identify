import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notificationSettingsRepository } from "@/infrastructure/repositories/SettingsRepositories";
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

    const settings = await notificationSettingsRepository.findMany({ eventId });
    
    if (settings.length === 0) {
      // Create default if missing
      const defaultSettings = await notificationSettingsRepository.create({
        workspaceId: event.workspaceId,
        eventId,
        emailAlerts: true,
        dailyDigest: true,
        webhookUrl: null,
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings[0]);
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
    const { emailAlerts, dailyDigest, webhookUrl } = body;

    const settingsList = await notificationSettingsRepository.findMany({ eventId });
    let settings = settingsList[0];

    if (!settings) {
      settings = await notificationSettingsRepository.create({
        workspaceId: event.workspaceId,
        eventId,
        emailAlerts: true,
        dailyDigest: true,
        webhookUrl: null,
      });
    }

    const updates: Record<string, unknown> = {};
    if (emailAlerts !== undefined) updates.emailAlerts = emailAlerts;
    if (dailyDigest !== undefined) updates.dailyDigest = dailyDigest;
    if (webhookUrl !== undefined) updates.webhookUrl = webhookUrl;
    updates.updatedAt = new Date();

    await notificationSettingsRepository.update(settings._id as string, updates);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}
