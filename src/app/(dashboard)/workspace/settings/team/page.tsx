import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { userRepository } from "@/infrastructure/repositories/UserRepository";
import { Button } from "@/components/ui/button";
import { Shield, MoreVertical, Mail } from "lucide-react";
import { InviteMemberModal } from "./components/InviteMemberModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MemberActions } from "./components/MemberActions";

export default async function TeamSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const memberships = await membershipRepository.findByUserId(session.user.id);
  if (memberships.length === 0) return null;

  const activeWorkspace = await workspaceRepository.findById(memberships[0].workspaceId);
  if (!activeWorkspace) return null;

  const allMemberships = await membershipRepository.findMany({ workspaceId: activeWorkspace._id as string });
  
  // Fetch user details for all members
  const memberDetails = await Promise.all(allMemberships.map(async (m) => {
    const user = await userRepository.findById(m.userId);
    return {
      membership: m,
      user
    };
  }));

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">Manage who has access to this workspace and their roles.</p>
        </div>
        <InviteMemberModal />
      </div>

      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-0 rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Active Members</h2>
              <p className="text-sm text-muted-foreground mt-1">Users currently in the workspace.</p>
            </div>
            <Badge variant="secondary" className="bg-zinc-200/50 text-zinc-700 font-medium px-2 py-0.5 border-none">
              {allMemberships.length} Members
            </Badge>
          </div>
          
          <div className="flex flex-col">
            {memberDetails.map(({ membership: m, user }, index) => {
              const isCurrentUser = m.userId === session.user?.id;
              
              return (
                <div key={m._id as string} className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 ${index !== memberDetails.length - 1 ? 'border-b border-zinc-100' : ''}`}>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border border-zinc-200">
                      <AvatarImage src={user?.image || ""} />
                      <AvatarFallback className="bg-zinc-100 text-zinc-600 font-medium">
                        {user?.name ? user.name.charAt(0) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {user?.name || "Unknown User"}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold text-zinc-500 border-zinc-200 px-1.5 py-0">You</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{user?.email || `ID: ${m.userId.substring(0,8)}`}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end w-full sm:w-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 capitalize border border-zinc-200/60">
                      {m.role === 'owner' && <Shield className="w-3.5 h-3.5 text-zinc-900" />}
                      {m.role}
                    </span>
                    <MemberActions 
                      membershipId={m._id as string} 
                      workspaceId={activeWorkspace._id as string}
                      currentRole={m.role}
                      isCurrentUser={isCurrentUser}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pending Invites Section - Mock for now as actual invites logic is out of scope for the quick fix */}
        <section className="flex flex-col gap-0 rounded-2xl border border-zinc-200 border-dashed bg-white shadow-sm overflow-hidden opacity-70">
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 border-dashed">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-muted-foreground">Pending Invitations</h2>
              <p className="text-sm text-muted-foreground mt-1">Invites that have not been accepted yet.</p>
            </div>
          </div>
          
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600 mb-1">No pending invitations</p>
            <p className="text-xs text-muted-foreground max-w-sm">When you invite team members, they will appear here until they accept the invitation.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
