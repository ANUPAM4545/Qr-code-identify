"use client";

import { useEvent } from "@/providers/event-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ScanLine, Activity, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function QROverviewPage() {
  const { event } = useEvent();
  
  // Note: Real metrics would be fetched from /api/events/[eventId]/qr/analytics or similar
  // Placing foundational UI here.
  
  const stats = [
    { name: "Total QR Codes", value: "12", icon: QrCode, trend: "+2 this week" },
    { name: "Total Scans", value: "8,234", icon: ScanLine, trend: "+12% vs last month" },
    { name: "Active Codes", value: "8", icon: Activity, trend: "4 drafts" },
    { name: "Last Scan", value: "2 mins ago", icon: Clock, trend: "Registration Desk" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Overview</h1>
          <p className="text-muted-foreground mt-1">Manage all QR codes and scan metrics for {event.name}.</p>
        </div>
        <div className="flex gap-4">
          <Link href={`/events/${event._id}/qr/design`}>
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
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Placeholder for Data Table / Recent QRs */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground py-8 text-center">
            Detailed analytics and charts will populate here as QR codes are scanned.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
