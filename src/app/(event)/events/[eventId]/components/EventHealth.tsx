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

  const getStatusColor = (status: string) => {
    if (status === "Excellent") return "text-emerald-500";
    if (status === "Good") return "text-amber-500";
    return "text-rose-500";
  };

  const getStatusBg = (status: string) => {
    if (status === "Excellent") return "bg-emerald-50";
    if (status === "Good") return "bg-amber-50";
    return "bg-rose-50";
  };

  const statusColor = getStatusColor(status);
  const statusBg = getStatusBg(status);

  // For the circular progress
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg group flex flex-col h-full min-h-[300px]">
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${statusBg} opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-2xl`} />
      
      <div className="relative z-10">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900 mb-6">Event Health</h3>
        
        <div className="flex items-center gap-5 mb-8">
          <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                className="text-zinc-100"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="40"
                cy="40"
              />
              <circle
                className={`${statusColor} transition-all duration-1000 ease-out`}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="40"
                cy="40"
              />
            </svg>
            <span className="text-xl font-bold text-zinc-900">{score}%</span>
          </div>
          <div>
            <div className={`text-xl font-bold ${statusColor}`}>{status}</div>
            <div className="text-sm font-medium text-zinc-500 mt-0.5">Overall readiness score</div>
          </div>
        </div>

        <div className="space-y-4">
          {checkItems.map(item => {
            const isPassed = checks[item.key as keyof typeof checks];
            return (
              <div key={item.key} className="flex items-center gap-3 p-2 -mx-2 rounded-lg transition-colors hover:bg-zinc-50">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                  {isPassed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                <span className={`text-sm ${isPassed ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
