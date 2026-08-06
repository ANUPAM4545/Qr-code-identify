import { NextRequest, NextResponse } from "next/server";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { registrationFormRepository } from "@/infrastructure/repositories/RegistrationFormRepository";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // We would ideally query by uniqueSlug, but EventRepository needs a method for it.
    // For now, let's fetch all events and filter, or just assume the repository supports it
    // Wait, let's implement findByUniqueSlug in EventRepository next.
    const event = await eventRepository.findByUniqueSlug(slug);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const form = await registrationFormRepository.findByEventId(event._id as string);
    if (!form) return NextResponse.json({ error: "Registration not configured" }, { status: 404 });

    // Hide sensitive settings before returning to public
    const publicForm = {
      _id: form._id,
      eventId: form.eventId,
      fields: form.fields,
      settings: {
        openDate: form.settings.openDate,
        closeDate: form.settings.closeDate,
        capacity: form.settings.capacity,
        allowWaitlist: form.settings.allowWaitlist
      },
      branding: form.branding
    };

    return NextResponse.json({ event, form: publicForm });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || String(error) }, { status: 500 });
  }
}
