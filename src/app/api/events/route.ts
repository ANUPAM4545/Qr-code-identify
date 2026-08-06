import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventService } from "@/application/services/EventService";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const eventSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  timezone: z.string().min(1, "Timezone is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await req.json();
    const validated = eventSchema.parse(body);

    // Verify user is part of the workspace
    const memberships = await membershipRepository.findByUserId(session.user.id);
    const hasAccess = memberships.some(m => m.workspaceId === validated.workspaceId);
    
    if (!hasAccess) {
      return NextResponse.json(errorResponse("Forbidden: You don't have access to this workspace"), { status: 403 });
    }

    const event = await EventService.createEvent(
      session.user.id,
      validated.workspaceId,
      validated.name,
      validated.slug,
      validated.timezone,
      new Date(validated.date),
      validated.venue
    );

    return NextResponse.json(successResponse(event, "Event created successfully"), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse("Validation Error", error.errors), { status: 400 });
    }
    return NextResponse.json(errorResponse((error as Error).message || "Internal Server Error"), { status: 400 });
  }
}
