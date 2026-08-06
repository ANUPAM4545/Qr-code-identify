import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WorkspaceService } from "@/application/services/WorkspaceService";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const workspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  timezone: z.string().min(1, "Timezone is required"),
  logo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await req.json();
    const validated = workspaceSchema.parse(body);

    const workspace = await WorkspaceService.createWorkspace(
      session.user.id,
      validated.name,
      validated.slug,
      validated.timezone,
      validated.logo
    );

    return NextResponse.json(successResponse(workspace, "Workspace created successfully"), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse("Validation Error", error.errors), { status: 400 });
    }
    return NextResponse.json(errorResponse((error as Error).message || "Internal Server Error"), { status: 400 });
  }
}
