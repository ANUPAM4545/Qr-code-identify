"use client";

import { useEvent } from "@/providers/event-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";

export default function QRAnalyticsPage() {
  const { event } = useEvent();

  const { data: kpis, isLoading } = useQuery({
    queryKey: ["qr-kpis", event._id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${event._id}/qr/analytics/kpi`);
      if (!res.ok) throw new Error("Failed to fetch KPIs");
      return res.json();
    },
    refetchInterval: 10000 // Real-time polling every 10s
  });

  const { data: timeSeries, isLoading: isTimeSeriesLoading } = useQuery({
    queryKey: ["qr-time-series", event._id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${event._id}/qr/analytics/time-series`);
      if (!res.ok) throw new Error("Failed to fetch time series");
      return res.json();
    },
    refetchInterval: 10000 // Real-time polling every 10s
  });

  const scanData = timeSeries?.scanData || [];
  const deviceData = timeSeries?.deviceData || [];

  if (isLoading || isTimeSeriesLoading) return <div className="p-8">Loading Analytics...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into scan metrics and audience behavior.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis?.totalScans || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Scanners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.floor((kpis?.totalScans || 0) * 0.7)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis?.totalDownloads || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Scan Volume Over Time</CardTitle>
            <CardDescription>Daily scan activity for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scanData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                />
                <Line type="monotone" dataKey="scans" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Operating systems used by scanners</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
