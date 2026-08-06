import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import Link from "next/link";
import { 
  Building, 
  Users, 
  Key, 
  Webhook, 
  Settings2,
  CreditCard,
  History
} from "lucide-react";

export default async function WorkspaceSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const memberships = await membershipRepository.findByUserId(session.user.id);
  if (memberships.length === 0) return null;

  const activeWorkspace = await workspaceRepository.findById(memberships[0].workspaceId);
  if (!activeWorkspace) return null;

  const tabs = [
    { name: "General", href: "/workspace/settings", icon: Building },
    { name: "Team", href: "/workspace/settings/team", icon: Users },
    { name: "API Keys", href: "/workspace/settings/apikeys", icon: Key },
    { name: "Webhooks", href: "/workspace/settings/webhooks", icon: Webhook },
    { name: "Integrations", href: "/workspace/settings/integrations", icon: Settings2 },
    { name: "Billing", href: "/workspace/settings/billing", icon: CreditCard },
    { name: "Audit Logs", href: "/workspace/settings/audit", icon: History },
  ];

  return (
    <div className="flex h-full max-w-7xl mx-auto w-full">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-gray-800 p-6 space-y-2 shrink-0">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Workspace Settings</h2>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
