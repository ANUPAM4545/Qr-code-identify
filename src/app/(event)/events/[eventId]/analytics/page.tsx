/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState } from "react";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { LineChart, BarChart } from "@/components/ui/charts/ChartAdapter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as htmlToImage from "html-to-image";

export default function AnalyticsOverviewPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  
  const [kpis, setKpis] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isBackground: boolean = false) => {
    try {
      if (!isBackground) setRefreshing(true);
      const [kpiRes, timeRes] = await Promise.all([
        fetch(`/api/events/${eventId}/analytics/kpi`),
        fetch(`/api/events/${eventId}/analytics/timeline`)
      ]);
      const kpiData = await kpiRes.json();
      const timeData = await timeRes.json();
      
      setKpis(kpiData);
      
      // Convert UTC ISO strings to local time for the chart
      const formattedTimeline = timeData.map((d: any) => ({
        ...d,
        name: new Date(d.name).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
      }));
      setTimeline(formattedTimeline);
    } catch (e) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      if (!isBackground) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    // Real-time polling every 5 seconds without showing the refresh spinner
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  const exportAsJPG = async () => {
    const element = document.getElementById("analytics-dashboard-container");
    if (!element) return;
    try {
      const imgData = await htmlToImage.toJpeg(element, { 
        quality: 0.95,
        backgroundColor: "#ffffff",
        fontEmbedCSS: "",
      });
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `analytics_report_${eventId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Dashboard image saved!");
    } catch (e: any) {
      console.error("html-to-image error:", e);
      toast.error(`Failed to generate image: ${e?.message || e}`);
    }
  };

  const exportAsPDF = () => {
    // Relying on native browser print for high-quality vector PDFs
    // Wrap in setTimeout to allow the dropdown menu state to close first
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;

  return (
    <div id="analytics-dashboard-container" className="p-8 max-w-7xl mx-auto space-y-8 print:p-0 print:m-0 print:max-w-none">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics Overview</h1>
          <p className="text-gray-400">High-level KPIs and real-time attendance trends.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} disabled={refreshing} className="border-gray-800 print:hidden">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className={`${buttonVariants({ size: "sm" })} print:hidden`}>
              <Download className="w-4 h-4 mr-2" /> Export Report
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportAsJPG}>
                Save as Image (.jpg)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsPDF}>
                Print as PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <h3 className="text-lg font-semibold mb-6">Attendance Timeline (Check-ins / Minute)</h3>
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
