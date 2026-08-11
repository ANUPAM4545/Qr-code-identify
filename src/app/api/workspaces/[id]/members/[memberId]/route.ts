import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string; memberId: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure current user is owner of the workspace
  const currentUserMemberships = await membershipRepository.findMany({ 
    userId: session.user.id, 
    workspaceId: params.id 
  });
  
  if (!currentUserMemberships.length || currentUserMemberships[0].role !== "owner") {
    return NextResponse.json({ error: "Forbidden - Requires owner role" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { role } = body;
    
    if (!["owner", "admin", "member", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updated = await membershipRepository.update(params.memberId, { role });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating membership:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string; memberId: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure current user is owner of the workspace
  const currentUserMemberships = await membershipRepository.findMany({ 
    userId: session.user.id, 
    workspaceId: params.id 
  });
  
  if (!currentUserMemberships.length || currentUserMemberships[0].role !== "owner") {
    return NextResponse.json({ error: "Forbidden - Requires owner role" }, { status: 403 });
  }

  try {
    await membershipRepository.delete(params.memberId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting membership:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
