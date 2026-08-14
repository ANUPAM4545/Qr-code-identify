import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AutoRefresh } from "@/components/AutoRefresh";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const memberships = await membershipRepository.findByUserId(session.user.id);

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  // Determine active workspace
  const cookieStore = await cookies();
  const savedWorkspaceId = cookieStore.get('active-workspace-id')?.value;
  
  let activeMembership = memberships[0];
  if (savedWorkspaceId) {
    const found = memberships.find(m => m.workspaceId === savedWorkspaceId);
    if (found) {
      activeMembership = found;
    }
  }

  const activeWorkspace = await workspaceRepository.findById(activeMembership.workspaceId);

  if (!activeWorkspace) {
    // Edge case: membership exists but workspace deleted
    redirect("/onboarding");
  }

  const allWorkspaces = await Promise.all(
    memberships.map(m => workspaceRepository.findById(m.workspaceId))
  );
  
  // Filter out any nulls just in case
  const validWorkspaces = allWorkspaces.filter(w => w !== null) as NonNullable<typeof allWorkspaces[0]>[];

  return (
    <DashboardShell 
      user={session.user} 
      workspace={activeWorkspace}
      workspaces={validWorkspaces}
      memberships={memberships}
    >
      <AutoRefresh />
      {children}
    </DashboardShell>
  );
}
