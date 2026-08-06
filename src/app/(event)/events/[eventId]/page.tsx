"use client";

import { useState, useEffect } from "react";
import { useEvent } from "@/providers/event-provider";
import { 
  Users, 
  QrCode, 
  ScanLine, 
  Activity, 
  CheckCircle2, 
  ShieldAlert,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EventDashboardPage() {
  const { event, settings, scanner } = useEvent();
  const router = useRouter();

  const [kpis, setKpis] = useState({
    totalRegistrations: 0,
    approvedRegistrations: 0,
    totalGuests: 0,
    checkedInGuests: 0,
    attendanceRate: 0,
    totalScans: 0
  });

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await fetch(`/api/events/${event._id}/analytics/kpi`);
        if (res.ok) {
          const data = await res.json();
          setKpis(data);
        }
      } catch (e) {
        console.error("Failed to load KPIs", e);
      }
    };

    fetchKpis();
    const interval = setInterval(fetchKpis, 10000);
    return () => clearInterval(interval);
  }, [event._id]);

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/events/${event._id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: event.workspaceId, action: "publish" })
      });
      if (res.ok) {
        toast.success("Event published successfully");
        router.refresh();
      } else {
        toast.error("Failed to publish event");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
            <div className="text-xs px-2 py-0.5 rounded-full border border-border/50 bg-muted/50 font-medium capitalize">
              {event.status}
            </div>
          </div>
          <p className="text-muted-foreground">{event.description || "Manage your event operations from this command center."}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {event.status === "draft" && (
            <Button onClick={handlePublish}>Publish Event</Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied");
              }}>Copy Event Link</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/events/${event._id}/settings`)}>
                Event Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-background p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Registrations</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{kpis.totalRegistrations}</div>
          <p className="text-xs text-muted-foreground mt-1">Pending: {kpis.totalRegistrations - kpis.approvedRegistrations}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">QR Scans</h3>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{kpis.totalScans}</div>
          <p className="text-xs text-muted-foreground mt-1">Check-ins: {kpis.checkedInGuests}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Scanner Health</h3>
            <ScanLine className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{scanner.offlineEnabled ? "Offline Ready" : "Online Only"}</div>
          <p className="text-xs text-muted-foreground mt-1">Active devices: 0</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Visibility</h3>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{settings.isPublic ? "Public" : "Private"}</div>
          <p className="text-xs text-muted-foreground mt-1">Capacity: {settings.maxCapacity || "Unlimited"}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Tasks */}
        <div className="rounded-xl border border-border/50 bg-background flex flex-col">
          <div className="p-6 pb-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Pending Tasks</h2>
            <Button variant="ghost" size="sm" className="h-8">View All</Button>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            {event.status === "draft" && (
              <div className="flex items-start gap-4">
                <div className="mt-0.5"><CheckCircle2 className="h-5 w-5 text-muted-foreground" /></div>
                <div>
                  <h4 className="text-sm font-medium">Publish Event</h4>
                  <p className="text-sm text-muted-foreground">Your event is currently a draft.</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className="mt-0.5"><CheckCircle2 className="h-5 w-5 text-muted-foreground" /></div>
              <div>
                <h4 className="text-sm font-medium">Design QR Code</h4>
                <p className="text-sm text-muted-foreground">Customize the QR design for your badges.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline Placeholder */}
        <div className="rounded-xl border border-border/50 bg-background flex flex-col">
          <div className="p-6 pb-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="h-8">View All</Button>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 rounded-full bg-muted p-1"><Activity className="h-4 w-4 text-foreground" /></div>
              <div>
                <p className="text-sm">Event <span className="font-medium">{event.name}</span> created.</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(event.createdAt).toISOString().split('T')[0]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
