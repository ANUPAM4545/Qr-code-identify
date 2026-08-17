/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDashboardProgress } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export function EventProgress({ eventId }: { eventId: string }) {
  const { data, isLoading, error } = useDashboardProgress(eventId);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-2xl" />;
  }

  if (error || !data) {
    return (
      <div className="h-[300px] rounded-2xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-500">
        <AlertCircle className="h-5 w-5 mr-2 text-zinc-400" />
        Failed to load progress
      </div>
    );
  }

  const { capacity, checkIns, qrs } = data;

  const chartData = [
    { 
      name: 'Capacity', 
      value: capacity.max !== "Unlimited" ? capacity.rate : 100,
      actualValue: capacity.max !== "Unlimited" ? `${capacity.rate}%` : 'Unlimited',
      detail: `${capacity.used} / ${capacity.max}`
    },
    { 
      name: 'Check-ins', 
      value: checkIns.rate,
      actualValue: `${checkIns.rate}%`,
      detail: `${checkIns.checkedIn} / ${checkIns.total}`
    },
    { 
      name: 'QR Assigned', 
      value: qrs.rate,
      actualValue: `${qrs.rate}%`,
      detail: `${qrs.assigned} / ${qrs.total}`
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-3 text-sm">
          <p className="font-medium text-zinc-900 mb-1">{label}</p>
          <p className="text-zinc-600">Progress: <span className="font-medium text-zinc-900">{data.actualValue}</span></p>
          <p className="text-zinc-500 text-xs mt-1">{data.detail}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
      <h3 className="text-lg font-semibold tracking-tight text-zinc-900 mb-6">Operational Progress</h3>
      
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e4e4e7" />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 13 }} width={100} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
              {
                chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Capacity' && capacity.max === 'Unlimited' ? '#a1a1aa' : '#18181b'} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
