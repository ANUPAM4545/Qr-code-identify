import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { EventList } from "./components/EventList";

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const memberships = await membershipRepository.findByUserId(session.user.id);
  if (memberships.length === 0) return null;

  const activeWorkspace = await workspaceRepository.findById(memberships[0].workspaceId);
  if (!activeWorkspace) return null;

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">Manage and track your operational events.</p>
        </div>
      </div>
      
      <EventList workspaceId={activeWorkspace._id as string} />
    </div>
  );
}
