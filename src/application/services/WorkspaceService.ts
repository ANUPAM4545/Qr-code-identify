import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceSettingsRepository, brandingSettingsRepository, scannerSettingsRepository, registrationSettingsRepository } from "@/infrastructure/repositories/SettingsRepositories";
import { AuditService } from "./AuditService";

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
}
