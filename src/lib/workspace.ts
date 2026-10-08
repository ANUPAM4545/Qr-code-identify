import { cookies } from "next/headers";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import clientPromise from "@/infrastructure/db";
import { ObjectId } from "mongodb";
import { Workspace, Membership } from "@/domain/types";

export async function getActiveWorkspaceData(userId: string): Promise<{
  memberships: Membership[];
  activeMembership: Membership | null;
  activeWorkspace: Workspace | null;
  validWorkspaces: Workspace[];
}> {
  const memberships = await membershipRepository.findByUserId(userId);
  if (!memberships.length) {
    return { memberships: [], activeMembership: null, activeWorkspace: null, validWorkspaces: [] };
  }

  let savedWorkspaceId: string | undefined;
  try {
    const cookieStore = await cookies();
    savedWorkspaceId = cookieStore.get('active-workspace-id')?.value;
  } catch {
    // Outside Next.js request scope
  }

  let activeMembership = memberships[0];
  if (savedWorkspaceId) {
    const found = memberships.find(m => m.workspaceId === savedWorkspaceId);
    if (found) {
      activeMembership = found;
    }
  } else {
    // Check if user has a lastActiveWorkspaceId saved in the database
    try {
      const client = await clientPromise;
      let userQuery: Record<string, unknown> = { _id: userId };
      if (ObjectId.isValid(userId)) {
        userQuery = { $or: [{ _id: new ObjectId(userId) }, { _id: userId }] };
      }
      const dbUser = await client.db().collection("users").findOne(userQuery);
      if (dbUser?.lastActiveWorkspaceId) {
        const found = memberships.find(m => m.workspaceId === dbUser.lastActiveWorkspaceId);
        if (found) {
          activeMembership = found;
        }
      }
    } catch (e) {
      console.error("Error retrieving user lastActiveWorkspaceId:", e);
    }
  }

  const allWorkspaces = await Promise.all(
    memberships.map(m => workspaceRepository.findById(m.workspaceId))
  );
  const validWorkspaces = allWorkspaces.filter((w): w is Workspace => w !== null);
  const activeWorkspace = validWorkspaces.find(w => w._id === activeMembership.workspaceId) || validWorkspaces[0] || null;

  return {
    memberships,
    activeMembership,
    activeWorkspace,
    validWorkspaces,
  };
}
