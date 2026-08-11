/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState } from "react";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LineChart, BarChart } from "@/components/ui/charts/ChartAdapter";

export default function AnalyticsOverviewPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  
  const [kpis, setKpis] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [kpiRes, timeRes] = await Promise.all([
        fetch(`/api/events/${eventId}/analytics/kpi`),
        fetch(`/api/events/${eventId}/analytics/timeline`)
      ]);
      const kpiData = await kpiRes.json();
      const timeData = await timeRes.json();
      
      setKpis(kpiData);
      setTimeline(timeData);
    } catch (e) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Simulate real-time by polling every 10 seconds for the demo
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [eventId]);

  const handleExport = () => {
    window.location.href = `/api/events/${eventId}/analytics/export`;
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics Overview</h1>
          <p className="text-gray-400">High-level KPIs and real-time attendance trends.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={refreshing} className="border-gray-800">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">

        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Guests</h3>
          <p className="text-3xl font-bold">{kpis?.totalGuests?.toLocaleString() || 0}</p>
          <div className="mt-2 text-xs text-muted-foreground font-medium">{kpis?.approvedRegistrations} Approved</div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Check-ins</h3>
          <p className="text-3xl font-bold">{kpis?.checkedInGuests?.toLocaleString() || 0}</p>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">{kpis?.attendanceRate?.toFixed(1) || 0}% Attendance Rate</div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total QR Scans</h3>
          <p className="text-3xl font-bold">{kpis?.totalScans?.toLocaleString() || 0}</p>
          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">Across all QR Codes</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Line Chart */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Attendance Timeline (Check-ins / Hour)</h3>
          {timeline.length > 0 ? (
            <LineChart 
              data={timeline} 
              height={350} 
              series={[{ dataKey: "value", color: "hsl(var(--primary))", name: "Check-ins" }]}
            />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
              No check-in data available yet.
            </div>
          )}
        </div>

        {/* Mini Bar Chart */}
        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Recent Check-ins</h3>
          {timeline.length > 0 ? (
            <BarChart 
              data={timeline.slice(-5)} 
              height={350} 
              series={[{ dataKey: "value", color: "hsl(var(--primary))", name: "Check-ins" }]}
            />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
              No data available.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
