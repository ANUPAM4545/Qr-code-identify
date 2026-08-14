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
  endDate: z.string().min(1, "End Date is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().optional(),
  description: z.string().optional(),
  templateId: z.string().optional(),
  maxCapacity: z.coerce.number().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    
    if (!workspaceId) {
      return NextResponse.json(errorResponse("Workspace ID is required"), { status: 400 });
    }

    const options = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: searchParams.get("status") as any || undefined,
      search: searchParams.get("search") || undefined,
      isFavorite: searchParams.get("isFavorite") === "true",
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "20", 10),
      sortBy: searchParams.get("sortBy") || "date",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      venue: searchParams.get("venue") || undefined,
      owner: searchParams.get("owner") || undefined,
      date: searchParams.get("date") || undefined,
    };

    const result = await EventService.getEvents(session.user.id, workspaceId, options);
    return NextResponse.json(successResponse(result), { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(errorResponse((error as Error).message || "Internal Server Error"), { status: 400 });
  }
}

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
      new Date(validated.endDate),
      new Date(validated.date),
      validated.venue,
      validated.description,
      validated.templateId,
      validated.maxCapacity
    );

    return NextResponse.json(successResponse(event, "Event created successfully"), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse("Validation Error", error.errors), { status: 400 });
    }
    return NextResponse.json(errorResponse((error as Error).message || "Internal Server Error"), { status: 400 });
  }
}
