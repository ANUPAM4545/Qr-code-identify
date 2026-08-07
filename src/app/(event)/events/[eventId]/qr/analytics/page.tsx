"use client";

import { useEvent } from "@/providers/event-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Clock } from "lucide-react";

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function QRAnalyticsPage() {
  const { event } = useEvent();

  const { data: kpis, isLoading: loadingKpis } = useQuery({
    queryKey: ["qr-kpis", event._id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${event._id}/qr/analytics/kpi`);
      if (!res.ok) throw new Error("Failed to load KPIs");
      return res.json();
    }
  });

  const { data: timeSeries, isLoading: loadingTimeSeries } = useQuery({
    queryKey: ["qr-timeseries", event._id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${event._id}/qr/analytics/time-series`);
      if (!res.ok) throw new Error("Failed to load time series data");
      return res.json();
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into scan metrics and audience behavior.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingKpis ? (
              <div className="h-10 animate-pulse bg-muted rounded-md w-24"></div>
            ) : (
              <div className="text-4xl font-bold text-foreground">{kpis?.totalScans || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingKpis ? (
              <div className="h-10 animate-pulse bg-muted rounded-md w-24"></div>
            ) : (
              <div className="text-4xl font-bold text-foreground">{kpis?.totalDownloads || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingKpis ? (
              <div className="h-10 animate-pulse bg-muted rounded-md w-24"></div>
            ) : (
              <div className="text-4xl font-bold text-foreground">{kpis?.activeQRs || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm bg-card lg:col-span-2">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle>Scan Volume Over Time</CardTitle>
            <CardDescription>Daily scan activity for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingTimeSeries ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Clock className="w-8 h-8 animate-pulse mb-4" />
                <p>Loading chart data...</p>
              </div>
            ) : !timeSeries?.scans || timeSeries.scans.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                <p>No scan data available yet.</p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeries.scans} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="_id" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Area type="monotone" dataKey="scans" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Operating systems used by scanners</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingTimeSeries ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Clock className="w-8 h-8 animate-pulse mb-4" />
                <p>Loading chart data...</p>
              </div>
            ) : !timeSeries?.devices || timeSeries.devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                <p>No device data available.</p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeSeries.devices}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="_id"
                    >
                      {timeSeries.devices.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
