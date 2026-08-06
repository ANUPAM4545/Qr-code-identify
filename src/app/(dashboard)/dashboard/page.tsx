import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { membershipRepository } from "@/infrastructure/repositories/MembershipRepository";
import { workspaceRepository } from "@/infrastructure/repositories/WorkspaceRepository";
import { EventService } from "@/application/services/EventService";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Calendar as CalendarIcon, Users, QrCode, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const memberships = await membershipRepository.findByUserId(session.user.id);
  if (memberships.length === 0) return null;

  const activeMembership = memberships[0];
  const activeWorkspace = await workspaceRepository.findById(activeMembership.workspaceId);
  
  if (!activeWorkspace) return null;

  const eventsResult = await EventService.getEvents(session.user.id, activeWorkspace._id as string, { limit: 6 });
  const events = eventsResult.events;
  const totalEvents = eventsResult.total;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back to {activeWorkspace.name}</p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 border-dashed bg-background/50 p-12 text-center h-[400px]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
            <CalendarPlus className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight mb-2">No events found</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-8">
            You don&apos;t have any events yet. Create your first event to start managing registrations, check-ins, and analytics.
          </p>
          <Button render={<Link href={`/onboarding?step=event&workspaceId=${activeWorkspace._id}`} />} nativeButton={false}>
            Create Your First Event
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/50 bg-background p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Total Events</h3>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{totalEvents}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Total Guests</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">0</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">QR Scans</h3>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">0</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Active Sessions</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">1</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold tracking-tight">Recent Events</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground h-8" render={<Link href="/events" />} nativeButton={false}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map(event => (
                <div key={event._id as string} className="rounded-xl border border-border/50 bg-background p-5 hover:border-foreground/20 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-lg group-hover:underline underline-offset-4 truncate pr-2">{event.name}</h3>
                    <div className="text-xs px-2 py-0.5 rounded-full border border-border/50 bg-muted/50 capitalize font-medium">
                      {event.status}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    {event.venue && <span>• {event.venue}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
