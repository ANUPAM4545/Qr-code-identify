import { getServerSession } from "next-auth";
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

  const workspaceId = memberships[0].workspaceId;

  return <TemplatesClient workspaceId={workspaceId} />;
}
