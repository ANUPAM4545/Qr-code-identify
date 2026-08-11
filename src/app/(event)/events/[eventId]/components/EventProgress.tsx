"use client";

import { useDashboardProgress } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export function EventProgress({ eventId }: { eventId: string }) {
  const { data, isLoading, error } = useDashboardProgress(eventId);

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  if (error || !data) {
    return (
      <div className="h-48 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-500">
        <AlertCircle className="h-5 w-5 mr-2 text-zinc-400" />
        Failed to load progress
      </div>
    );
  }

  const { capacity, checkIns, qrs } = data;
  const capacityPct = capacity.max !== "Unlimited" && capacity.max > 0 ? Math.round((capacity.used / capacity.max) * 100) : 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
      <h3 className="text-lg font-semibold tracking-tight text-zinc-900 mb-6">Operational Progress</h3>
      
      <div className="flex flex-col gap-5 flex-1 justify-center">
        {/* Capacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700">Capacity</span>
            <span className="text-zinc-500">
              {capacity.used} / {capacity.max} <span className="font-medium text-zinc-900 ml-1">{capacity.max !== "Unlimited" ? `${capacityPct}%` : ""}</span>
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-zinc-900 rounded-full transition-all" 
              style={{ width: `${capacity.max !== "Unlimited" ? capacityPct : 0}%` }}
            />
          </div>
        </div>

        {/* Check-ins */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700">Check-ins</span>
            <span className="font-medium text-zinc-900">{checkIns.rate}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-zinc-900 rounded-full transition-all" 
              style={{ width: `${checkIns.rate}%` }}
            />
          </div>
        </div>

        {/* QR Assigned */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700">QR Assigned</span>
            <span className="font-medium text-zinc-900">{qrs.rate}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-zinc-900 rounded-full transition-all" 
              style={{ width: `${qrs.rate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
