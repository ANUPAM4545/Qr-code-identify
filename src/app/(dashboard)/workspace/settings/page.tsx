import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function WorkspaceSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const memberships = await membershipRepository.findByUserId(session.user.id);
  if (memberships.length === 0) return null;

  const activeMembership = memberships[0];
  const activeWorkspace = await workspaceRepository.findById(activeMembership.workspaceId);
  if (!activeWorkspace) return null;

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace configuration and branding.</p>
      </div>

      <div className="flex flex-col gap-6 rounded-xl border border-border/50 bg-background p-6">
        <h2 className="text-lg font-semibold tracking-tight">General Information</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Workspace Name</Label>
          <Input id="name" defaultValue={activeWorkspace.name} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Workspace Slug</Label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-border/50 bg-muted px-3 text-sm text-muted-foreground">
              identify.com/
            </span>
            <Input id="slug" defaultValue={activeWorkspace.slug} className="rounded-l-none" />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button>Save Changes</Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-xl border border-destructive/20 bg-background p-6">
        <h2 className="text-lg font-semibold tracking-tight text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">Irreversible and destructive actions for this workspace.</p>
        <div className="pt-4 border-t border-border/50">
          <Button variant="destructive">Delete Workspace</Button>
        </div>
      </div>
    </div>
  );
}
