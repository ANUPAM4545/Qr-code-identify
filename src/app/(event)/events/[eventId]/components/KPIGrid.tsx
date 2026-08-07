"use client";

import { useDashboardOverview } from "../hooks/useDashboard";
import { Users, QrCode, ScanLine, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function KPIGrid({ eventId }: { eventId: string }) {
  const { data, isLoading, error } = useDashboardOverview(eventId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm h-32 flex flex-col justify-between">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data?.kpis) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center justify-center text-zinc-500 h-32">
        <AlertCircle className="h-5 w-5 mr-2 text-zinc-400" />
        Failed to load KPIs
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Registrations Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="tracking-tight text-sm font-medium text-zinc-600">Registrations</h3>
          <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-zinc-900" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-zinc-900">{kpis.registrations.value}</div>
          <div className="flex items-center mt-2 text-xs text-zinc-500">
            {kpis.registrations.pending > 0 ? (
              <span className="text-zinc-900 font-medium mr-1">{kpis.registrations.pending} pending</span>
            ) : (
              <span className="text-zinc-900 font-medium mr-1">All approved</span>
            )}
            {" approval"}
          </div>
        </div>
      </div>

      {/* Guests Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="tracking-tight text-sm font-medium text-zinc-600">Approved Guests</h3>
          <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-zinc-900" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-zinc-900">{kpis.guests.value}</div>
          <div className="flex items-center mt-2 text-xs text-zinc-500">
            <span className="mr-1 text-zinc-400">Total guest list size</span>
          </div>
        </div>
      </div>

      {/* Check-ins Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="tracking-tight text-sm font-medium text-zinc-600">Checked In</h3>
          <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <ScanLine className="h-4 w-4 text-zinc-900" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-zinc-900">{kpis.checkIns.value}</div>
          <div className="flex items-center mt-2 text-xs text-zinc-500">
            <span className="text-zinc-900 font-medium mr-1">{kpis.checkIns.rate}%</span>
            {" attendance rate"}
          </div>
        </div>
      </div>

      {/* QR Codes Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="tracking-tight text-sm font-medium text-zinc-600">QR Scans</h3>
          <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <QrCode className="h-4 w-4 text-zinc-900" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-zinc-900">{kpis.scans.value}</div>
          <div className="flex items-center mt-2 text-xs text-zinc-500">
            <span className="text-zinc-400">Total lifetime scans</span>
          </div>
        </div>
      </div>
    </div>
  );
}
