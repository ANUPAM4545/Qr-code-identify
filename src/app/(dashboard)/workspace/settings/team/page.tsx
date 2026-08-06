import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield, MoreVertical } from "lucide-react";

export default async function TeamSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const memberships = await membershipRepository.findByUserId(session.user.id);
  if (memberships.length === 0) return null;

  const activeWorkspace = await workspaceRepository.findById(memberships[0].workspaceId);
  if (!activeWorkspace) return null;

  const allMemberships = await membershipRepository.findMany({ workspaceId: activeWorkspace._id as string });

  return (
    <div className="max-w-4xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">Manage who has access to this workspace and their roles.</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-background overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="p-4 font-medium text-sm text-muted-foreground">User</th>
              <th className="p-4 font-medium text-sm text-muted-foreground">Role</th>
              <th className="p-4 font-medium text-sm text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allMemberships.map((m) => (
              <tr key={m._id as string} className="border-b border-border/10 last:border-0 hover:bg-muted/10">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold">
                      {m.userId.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{m.userId === session.user?.id ? "You" : `User ${m.userId.substring(0,6)}`}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-medium capitalize">
                    {m.role === 'owner' && <Shield className="w-3 h-3 text-purple-400" />}
                    {m.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
