import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

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

  // Determine active workspace (for now, pick the first one)
  const activeMembership = memberships[0];
  const activeWorkspace = await workspaceRepository.findById(activeMembership.workspaceId);

  if (!activeWorkspace) {
    // Edge case: membership exists but workspace deleted
    redirect("/onboarding");
  }

  return (
    <DashboardShell 
      user={session.user} 
      workspace={activeWorkspace}
      memberships={memberships}
    >
      {children}
    </DashboardShell>
  );
}
