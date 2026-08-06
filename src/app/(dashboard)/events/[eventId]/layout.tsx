import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { 
  eventSettingsRepository,
  brandingSettingsRepository,
  registrationSettingsRepository,
  scannerSettingsRepository,
  qrConfigurationRepository,
  guestConfigurationRepository,
  notificationSettingsRepository
} from "@/infrastructure/repositories/SettingsRepositories";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EventProvider, EventContextState } from "@/providers/event-provider";
import { 
  LayoutDashboard, 
  Settings, 
  QrCode, 
  Users, 
  ScanLine, 
  BarChart, 
  ClipboardList, 
  Palette,
  ShieldAlert
} from "lucide-react";

export default async function EventLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { eventId } = await params;

  // Load Event
  const event = await eventRepository.findById(eventId);
  if (!event) redirect("/events");

  // Load Memberships & Check Access
  const memberships = await membershipRepository.findByUserId(session.user.id);
  const membership = memberships.find(m => m.workspaceId === event.workspaceId);
  
  if (!membership) redirect("/events");

  const workspace = await workspaceRepository.findById(event.workspaceId);
  if (!workspace) redirect("/events");

  // Load all settings in parallel
  const [
    [settings],
    [branding],
    [registration],
    [scanner],
    [qr],
    [guest],
    [notification]
  ] = await Promise.all([
    eventSettingsRepository.findMany({ eventId }),
    brandingSettingsRepository.findMany({ eventId }),
    registrationSettingsRepository.findMany({ eventId }),
    scannerSettingsRepository.findMany({ eventId }),
    qrConfigurationRepository.findMany({ eventId }),
    guestConfigurationRepository.findMany({ eventId }),
    notificationSettingsRepository.findMany({ eventId })
  ]);

  if (!settings || !branding || !registration || !scanner || !qr || !guest || !notification) {
    throw new Error("Critical event settings are missing. Please contact support.");
  }

  const contextValue: EventContextState = {
    event,
    settings,
    branding,
    registration,
    scanner,
    qr,
    guest,
    notification,
    role: membership.role
  };

  const eventNavigation = [
    { name: "Dashboard", href: `/events/${eventId}`, icon: LayoutDashboard },
    { name: "QR Studio", href: `/events/${eventId}/qr`, icon: QrCode },
    { name: "Guests", href: `/events/${eventId}/guests`, icon: Users },
    { name: "Scanner", href: `/events/${eventId}/scanner`, icon: ScanLine },
    { name: "Analytics", href: `/events/${eventId}/analytics`, icon: BarChart },
    { name: "Registration", href: `/events/${eventId}/registration`, icon: ClipboardList },
    { name: "Branding", href: `/events/${eventId}/branding`, icon: Palette },
    { name: "Settings", href: `/events/${eventId}/settings`, icon: Settings },
    { name: "Audit Logs", href: `/events/${eventId}/audit`, icon: ShieldAlert },
  ];

  return (
    <EventProvider value={contextValue}>
      <DashboardShell 
        user={session.user} 
        workspace={workspace}
        memberships={memberships}
        navigation={eventNavigation}
      >
        {children}
      </DashboardShell>
    </EventProvider>
  );
}
