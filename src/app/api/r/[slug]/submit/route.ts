import { NextRequest, NextResponse } from "next/server";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { RegistrationService } from "@/application/services/RegistrationService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
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
