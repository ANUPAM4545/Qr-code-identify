"use client";

import { useDashboardHealth } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Circle } from "lucide-react";

export function EventHealth({ eventId }: { eventId: string }) {
  const { data, isLoading, error } = useDashboardHealth(eventId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (error || !data) {
    return (
      <div className="h-64 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-500">
        <AlertCircle className="h-5 w-5 mr-2 text-zinc-400" />
        Failed to load health
      </div>
    );
  }

  const { score, status, checks } = data;

  const checkItems = [
    { key: 'registration', label: 'Registration Configured' },
    { key: 'qr', label: 'QR Design Configured' },
    { key: 'guests', label: 'Guests Imported' }
  ];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
      <h3 className="text-lg font-semibold tracking-tight text-zinc-900 mb-6">Event Health</h3>
      
      <div className="flex items-center gap-4 mb-6">
        <div className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold bg-zinc-100 text-zinc-900`}>
          {score}%
        </div>
        <div>
          <div className="text-xl font-bold text-zinc-900">{status}</div>
          <div className="text-sm text-zinc-500">Overall readiness score</div>
        </div>
      </div>

      <div className="space-y-3">
        {checkItems.map(item => {
          const isPassed = checks[item.key as keyof typeof checks];
          return (
            <div key={item.key} className="flex items-center gap-3">
              {isPassed ? (
                <CheckCircle2 className="h-4 w-4 text-zinc-900 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-zinc-300 shrink-0" />
              )}
              <span className={`text-sm ${isPassed ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
