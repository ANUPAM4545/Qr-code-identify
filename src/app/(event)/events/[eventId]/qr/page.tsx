"use client";

import { useEvent } from "@/providers/event-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ScanLine, Activity, Download, ArrowRight, Library, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function QROverviewPage() {
  const { event } = useEvent();
  
  const { data: kpis, isLoading: kpiLoading } = useQuery({
    queryKey: ["qr-kpis", event._id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${event._id}/qr/analytics/kpi`);
      if (!res.ok) throw new Error("Failed to fetch KPIs");
      return res.json();
    }
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ["qr-recent", event._id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${event._id}/qr?limit=5`);
      if (!res.ok) throw new Error("Failed to fetch recent QRs");
      const data = await res.json();
      return data.qrs;
    }
  });
  
  const stats = [
    { name: "Total QR Codes", value: kpis?.totalQRs ?? 0, icon: QrCode, description: "Total generated" },
    { name: "Active Codes", value: kpis?.activeQRs ?? 0, icon: Activity, description: "Currently scanning" },
    { name: "Total Scans", value: kpis?.totalScans ?? 0, icon: ScanLine, description: "Across all QRs" },
    { name: "Downloads", value: kpis?.totalDownloads ?? 0, icon: Download, description: "Total exports" },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Studio</h1>
          <p className="text-muted-foreground mt-1">Manage all QR codes and scan metrics for {event.name}.</p>
        </div>
        <div className="flex gap-4">
          <Link href={`/events/${event._id}/qr/library`}>
            <Button variant="outline"><Library className="mr-2 h-4 w-4" /> QR Library</Button>
          </Link>
          <Link href={`/events/${event._id}/qr/new/design`}>
            <Button>Create New QR Code</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="border border-border/50 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {kpiLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div>
              ) : (
                <div className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 border border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link href={`/events/${event._id}/qr/library`} className="text-sm text-primary hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>)}
              </div>
            ) : recent?.length === 0 ? (
              <div className="text-sm text-muted-foreground py-12 text-center border rounded-md border-dashed">
                No QR codes created yet. 
                <div className="mt-4">
                  <Link href={`/events/${event._id}/qr/new/design`}>
                    <Button variant="outline" size="sm">Create your first QR Code</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recent?.map((qr: { _id: string; name: string; createdAt: string; scanCount: number }, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center">
                        <QrCode className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{qr.name}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(qr.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{qr.scanCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Scans</p>
                      </div>
                      <Link href={`/events/${event._id}/qr/${qr._id}/design`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Quick Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={`/events/${event._id}/qr/templates`} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors border">
              <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Templates Gallery</p>
                <p className="text-xs text-muted-foreground">{kpis?.templates || 0} templates available</p>
              </div>
            </Link>
            <Link href={`/events/${event._id}/qr/downloads`} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors border">
              <Download className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Download History</p>
                <p className="text-xs text-muted-foreground">View recent exports</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
