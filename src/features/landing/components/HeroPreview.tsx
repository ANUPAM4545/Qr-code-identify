"use client";

import { motion } from "framer-motion";
import { BarChart3, Users, QrCode, Calendar, Search, Bell } from "lucide-react";
import { SCALE_IN } from "../utils/animations";

export function HeroPreview() {
  return (
    <motion.div 
      variants={SCALE_IN}
      className="relative mx-auto max-w-5xl rounded-xl border border-border/50 bg-background shadow-2xl overflow-hidden mt-16 flex flex-col h-[500px]"
    >
      {/* Fake Browser Header */}
      <div className="h-12 border-b border-border/50 flex items-center px-4 bg-muted/30">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
        </div>
        <div className="mx-auto flex h-6 w-1/3 items-center justify-center rounded-md bg-background border text-[10px] text-muted-foreground font-medium">
          identify.com/dashboard
        </div>
      </div>

      {/* App Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-border/50 bg-muted/10 p-4 flex flex-col gap-4 hidden sm:flex">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
              <span className="text-background text-[10px] font-bold">I</span>
            </div>
            <span className="text-sm font-semibold">Acme Corp</span>
          </div>
          {[
            { icon: Calendar, label: "Events" },
            { icon: Users, label: "Guests" },
            { icon: QrCode, label: "QR Studio" },
            { icon: BarChart3, label: "Analytics" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium ${i === 0 ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'}`}>
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Global Tech Summit 2026</h2>
              <p className="text-xs text-muted-foreground mt-1">Oct 12 - Oct 14 • San Francisco, CA</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border flex items-center justify-center">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="w-8 h-8 rounded-full border flex items-center justify-center">
                <Bell className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Registrations", value: "2,845", trend: "+12%" },
              { label: "VIP Guests", value: "142", trend: "+4%" },
              { label: "Check-ins Today", value: "892", trend: "+24%" },
            ].map((stat, i) => (
              <div key={i} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-[10px] font-medium text-foreground bg-secondary px-1.5 py-0.5 rounded">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Table (Skeleton) */}
          <div className="flex-1 rounded-lg border bg-card overflow-hidden flex flex-col">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Recent Registrations</span>
              <span className="text-xs text-muted-foreground cursor-pointer">View all</span>
            </div>
            <div className="p-4 flex flex-col gap-3 flex-1 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted" />
                    <div className="flex flex-col gap-1">
                      <div className="w-24 h-3 bg-muted rounded" />
                      <div className="w-32 h-2 bg-muted/50 rounded" />
                    </div>
                  </div>
                  <div className="w-16 h-4 bg-muted rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
