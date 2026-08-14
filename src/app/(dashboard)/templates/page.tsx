import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { TemplatesClient } from "./components/TemplatesClient";
import { redirect } from "next/navigation";

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const memberships = await membershipRepository.findByUserId(session.user.id);
  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const cookieStore = await cookies();
  const savedWorkspaceId = cookieStore.get('active-workspace-id')?.value;
  
  let activeMembership = memberships[0];
  if (savedWorkspaceId) {
    const found = memberships.find(m => m.workspaceId === savedWorkspaceId);
    if (found) {
      activeMembership = found;
    }
  }

  const workspaceId = activeMembership.workspaceId;

  return <TemplatesClient workspaceId={workspaceId} />;
}
