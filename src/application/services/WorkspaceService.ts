import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceSettingsRepository, brandingSettingsRepository, scannerSettingsRepository, registrationSettingsRepository } from "@/infrastructure/repositories/SettingsRepositories";
import { inviteRepository } from "@/infrastructure/repositories/InviteRepository";
import { userRepository } from "@/infrastructure/repositories/UserRepository";
import { AuditService } from "./AuditService";
import { RealtimeService } from "./RealtimeService";
import { EmailService } from "./EmailService";
import crypto from "crypto";

export class WorkspaceService {
  static async createWorkspace(userId: string, name: string, slug: string, timezone: string, logo?: string) {
    // 1. Check if slug exists
    const existing = await workspaceRepository.findBySlug(slug);
    if (existing) {
      throw new Error("Workspace slug already exists.");
    }

    // 2. Create Workspace
    const workspace = await workspaceRepository.create({
      name,
      slug,
      timezone,
      logo,
    });

    const workspaceId = workspace._id as string;

    // 3. Create Owner Membership
    await membershipRepository.create({
      userId,
      workspaceId,
      role: "owner",
    });

    // 4. Provision Default Settings
    await workspaceSettingsRepository.create({
      workspaceId,
      theme: "system",
      accentColor: "#000000",
      features: ["events", "guests", "analytics"],
    });

    await brandingSettingsRepository.create({
      workspaceId,
      primaryColor: "#000000",
    });

    await scannerSettingsRepository.create({
      workspaceId,
      offlineEnabled: false,
      autoSync: true,
    });

    await registrationSettingsRepository.create({
      workspaceId,
      requireApproval: false,
      allowWaitlist: false,
    });

    // 5. Audit Log
    await AuditService.log(userId, "WORKSPACE_CREATED", { name, slug }, workspaceId);

    return workspace;
  }

  static async inviteMember(
    workspaceId: string,
    email: string,
    role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer',
    invitedBy: string
  ) {
    // 1. Check if user is already a member
    const user = await userRepository.findOne({ email });
    if (user) {
      const existingMemberships = await membershipRepository.findMany({ workspaceId, userId: user._id as string });
      if (existingMemberships.length > 0) {
        throw new Error("User is already a member of this workspace.");
      }
    }

    // 2. Invalidate existing pending invites for this email + workspace
    await inviteRepository.invalidateByEmailAndWorkspace(email, workspaceId);

    // 3. Generate token and create invite
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invite = await inviteRepository.create({
      workspaceId,
      email,
      role,
      token,
      invitedBy,
      status: "pending",
      expiresAt
    });

    // 4. Audit Log
    await AuditService.log(invitedBy, "INVITE_CREATED", { email, role }, workspaceId);

    // 5. Broadcast real-time event (for optimistic UI updates/polling to pick up)
    await RealtimeService.broadcast(`workspace_${workspaceId}`, "invite_created", { inviteId: invite._id });

    // 6. Send the actual email
    await EmailService.sendWorkspaceInvite(workspaceId, email, role, token);

    return invite;
  }

  static async acceptInvite(token: string, userId: string) {
    // 1. Find pending invite
    const invite = await inviteRepository.findByToken(token);
    if (!invite) throw new Error("Invalid or expired invite token.");

    if (new Date() > new Date(invite.expiresAt)) {
      await inviteRepository.update(invite._id as string, { status: "expired" });
      throw new Error("Invite has expired.");
    }

    // 2. Check for existing membership to prevent duplicates
    const existingMemberships = await membershipRepository.findMany({ 
      userId, 
      workspaceId: invite.workspaceId 
    });

    if (existingMemberships.length > 0) {
      // User is already a member! Do not consume the invite, tell them they need to log out.
      throw new Error("You are already a member of this workspace. If you are trying to accept an invite for a different account, please sign out first.");
    }

    // 3. Create membership
    await membershipRepository.create({
      userId,
      workspaceId: invite.workspaceId,
      role: invite.role,
    });

    // 4. Update invite status
    await inviteRepository.update(invite._id as string, { status: "accepted" });

    // 5. Audit Log
    await AuditService.log(userId, "INVITE_ACCEPTED", { inviteId: invite._id }, invite.workspaceId);

    // 6. Broadcast real-time event
    await RealtimeService.broadcast(`workspace_${invite.workspaceId}`, "invite_accepted", { inviteId: invite._id, userId });

    return { workspaceId: invite.workspaceId };
  }

  static async revokeInvite(workspaceId: string, inviteId: string, userId: string) {
    const invite = await inviteRepository.findById(inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.workspaceId !== workspaceId) throw new Error("Invite does not belong to this workspace");

    await inviteRepository.delete(inviteId);
    
    // Audit Log
    await AuditService.log(userId, "INVITE_REVOKED", { inviteId, email: invite.email }, workspaceId);

    // Broadcast real-time event
    await RealtimeService.broadcast(`workspace_${workspaceId}`, "invite_revoked", { inviteId });

    return true;
  }

  static async deleteWorkspace(userId: string, workspaceId: string) {
    // 1. Verify user is owner
    const memberships = await membershipRepository.findMany({ workspaceId, userId, role: "owner" });
    if (memberships.length === 0) {
      throw new Error("Only workspace owners can delete a workspace.");
    }

    // 2. Delete workspace and all its cascading dependencies
    // In a production app, you might want to do a soft delete or a background job.
    // For now, we'll do a hard delete of the core items.
    
    // Delete memberships
    const allMemberships = await membershipRepository.findMany({ workspaceId });
    for (const member of allMemberships) {
      await membershipRepository.delete(member._id as string);
    }

    // Delete invites
    const invites = await inviteRepository.findMany({ workspaceId });
    for (const invite of invites) {
      await inviteRepository.delete(invite._id as string);
    }

    // Delete workspace
    await workspaceRepository.delete(workspaceId);

    // Audit Log
    await AuditService.log(userId, "WORKSPACE_DELETED", { workspaceId }, workspaceId);

    return true;
  }
}

