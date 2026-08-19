import { NextRequest, NextResponse } from "next/server";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { registrationFormRepository } from "@/infrastructure/repositories/RegistrationFormRepository";
import { RegistrationService } from "@/application/services/RegistrationService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] | string }> }
) {
  try {
    const resolvedParams = await params;
    const rawSlug = resolvedParams.slug;
    let slug = Array.isArray(rawSlug) ? rawSlug.join('/') : String(rawSlug || '');
    try {
      slug = decodeURIComponent(slug);
    } catch {}
    
    const event = await eventRepository.findByUniqueSlug(slug);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const form = await registrationFormRepository.getOrCreateForEvent(event.workspaceId, event._id as string);
    if (!form) return NextResponse.json({ error: "Registration not configured" }, { status: 404 });

    // Hide sensitive settings before returning to public
    const publicForm = {
      _id: form._id,
      eventId: form.eventId,
      fields: form.fields,
      settings: {
        openDate: form.settings?.openDate,
        closeDate: form.settings?.closeDate,
        capacity: form.settings?.capacity,
        allowWaitlist: form.settings?.allowWaitlist
      },
      branding: form.branding
    };

    return NextResponse.json({ event, form: publicForm });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] | string }> }
) {
  try {
    const resolvedParams = await params;
    const rawSlug = resolvedParams.slug;
    let slug = Array.isArray(rawSlug) ? rawSlug.join('/') : String(rawSlug || '');
    try {
      slug = decodeURIComponent(slug);
    } catch {}
    
    const event = await eventRepository.findByUniqueSlug(slug);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const body = await req.json();
    const { answers, deviceMetadata } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const submission = await RegistrationService.submitRegistration(
      event._id as string,
      answers,
      {
        ...deviceMetadata,
        ip: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || ""
      }
    );

    return NextResponse.json({ success: true, status: submission.status });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}
