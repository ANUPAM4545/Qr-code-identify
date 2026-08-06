"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Users, QrCode, Calendar, Search, Bell } from "lucide-react";
import { SCALE_IN } from "../utils/animations";

export function HeroPreview() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { icon: Calendar, label: "Events" },
    { icon: Users, label: "Guests" },
    { icon: QrCode, label: "QR Studio" },
    { icon: BarChart3, label: "Analytics" },
  ];

  return (
    <motion.div 
      variants={SCALE_IN}
      className="relative mx-auto max-w-5xl rounded-2xl border border-zinc-200/60 bg-white shadow-[0_20px_50px_rgb(0,0,0,0.1)] overflow-hidden mt-16 flex flex-col h-[500px]"
    >
      {/* Fake Browser Header */}
      <div className="h-12 border-b border-zinc-200 flex items-center px-4 bg-zinc-50/80 backdrop-blur-sm z-20 relative">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="mx-auto flex h-7 w-1/3 items-center justify-center rounded-md bg-white border border-zinc-200 text-[11px] text-zinc-500 font-medium shadow-sm">
          identify.com/dashboard
        </div>
      </div>

      {/* App Body */}
      <div className="flex flex-1 overflow-hidden bg-white relative z-10">
        {/* Sidebar */}
        <div className="w-48 border-r border-zinc-200 bg-zinc-50/50 p-4 flex flex-col gap-4 hidden sm:flex z-20 relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center shadow-sm">
              <span className="text-white text-[10px] font-bold">I</span>
            </div>
            <span className="text-sm font-semibold text-zinc-900">Acme Corp</span>
          </div>
          {tabs.map((item, i) => (
            <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors duration-300 ${activeTab === i ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50'}`}>
              <item.icon className={`w-3.5 h-3.5 ${activeTab === i ? 'text-zinc-900' : 'text-zinc-400'}`} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 p-6 flex flex-col gap-6"
            >
              {/* Header (Shared) */}
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">Global Tech Summit 2026</h2>
                  <p className="text-xs text-zinc-500 mt-1">Oct 12 - Oct 14 • San Francisco, CA</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center bg-white shadow-sm">
                    <Search className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center bg-white shadow-sm relative">
                    <Bell className="w-4 h-4 text-zinc-500" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 shadow-sm border border-zinc-900" />
                </div>
              </div>

              {/* Dynamic Content Views */}
              {activeTab === 0 && (
                <>
                  <div className="grid grid-cols-3 gap-4 shrink-0">
                    {[
                      { label: "Total Registrations", value: "2,845", trend: "+12%" },
                      { label: "VIP Guests", value: "142", trend: "+4%" },
                      { label: "Check-ins Today", value: "892", trend: "+24%" },
                    ].map((stat, i) => (
                      <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-col gap-2 shadow-sm">
                        <span className="text-xs text-zinc-500 font-medium">{stat.label}</span>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold text-zinc-900">{stat.value}</span>
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{stat.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[150px]">
                    <div className="border-b border-zinc-100 px-4 py-3 flex items-center justify-between bg-zinc-50/50">
                      <span className="text-sm font-semibold text-zinc-900">Recent Registrations</span>
                      <span className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer">View all</span>
                    </div>
                    <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
                      {[
                        { name: "John Smith", role: "VP of Engineering at TechFlow", time: "2 mins ago", init: "JS" },
                        { name: "Alice Lee", role: "Product Manager at Acme Corp", time: "14 mins ago", init: "AL" },
                        { name: "Michael Kim", role: "Software Developer", time: "1 hour ago", init: "MK" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-600 font-bold">
                              {item.init}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-900">{item.name}</span>
                              <span className="text-xs text-zinc-500">{item.role}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400 font-medium">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 1 && (
                <div className="flex-1 rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
                   <div className="border-b border-zinc-100 px-4 py-3 flex items-center justify-between bg-zinc-50/50">
                     <span className="text-sm font-semibold text-zinc-900">Guest Directory</span>
                     <div className="px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium">Add Guest</div>
                   </div>
                   <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
                     {[
                       { name: "Sarah Jenkins", email: "sarah@example.com", status: "VIP", init: "SJ" },
                       { name: "David Chen", email: "david.c@startup.io", status: "Approved", init: "DC" },
                       { name: "Emily Watson", email: "emilyw@enterprise.com", status: "Approved", init: "EW" },
                       { name: "Robert Fox", email: "rfox@agency.net", status: "Pending", init: "RF" },
                       { name: "Jessica Alba", email: "jessica@studio.com", status: "Approved", init: "JA" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between pb-3 border-b border-zinc-100 last:border-0 last:pb-0">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-600 font-bold">{item.init}</div>
                           <div className="flex flex-col">
                             <span className="text-sm font-medium text-zinc-900">{item.name}</span>
                             <span className="text-xs text-zinc-500">{item.email}</span>
                           </div>
                         </div>
                         <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${item.status === 'VIP' ? 'bg-amber-50 text-amber-700 border-amber-200' : item.status === 'Pending' ? 'bg-zinc-50 text-zinc-600 border-zinc-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{item.status}</span>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {activeTab === 2 && (
                <div className="flex-1 flex gap-4 min-h-0">
                  <div className="w-1/3 rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm flex flex-col items-center justify-center p-6 gap-6 h-full text-center">
                    <QrCode className="w-24 h-24 text-zinc-800" />
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-zinc-900">VIP Access Pass</span>
                      <span className="text-xs text-zinc-500 mt-1">Generated: Oct 10, 2026</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                     <div className="h-20 shrink-0 rounded-xl border border-zinc-200 bg-white shadow-sm p-4 flex flex-col justify-between">
                       <span className="text-xs font-medium text-zinc-500">Total QR Scans</span>
                       <span className="text-xl font-bold text-zinc-900">12,405</span>
                     </div>
                     <div className="flex-1 rounded-xl border border-zinc-200 bg-white shadow-sm p-4 flex flex-col gap-4">
                       <span className="text-xs font-medium text-zinc-500">Scan Activity</span>
                       <div className="flex-1 bg-zinc-50 rounded-lg border border-zinc-100 flex items-end px-4 gap-2 pt-4 relative">
                         <div className="absolute inset-0 flex flex-col justify-between py-4 px-2">
                            <div className="border-b border-zinc-200/50 w-full"></div>
                            <div className="border-b border-zinc-200/50 w-full"></div>
                            <div className="border-b border-zinc-200/50 w-full"></div>
                         </div>
                         {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                           <div key={i} className="flex-1 bg-indigo-500/80 hover:bg-indigo-600 transition-colors rounded-t-sm relative z-10" style={{ height: `${h}%` }} />
                         ))}
                       </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div className="flex-1 flex flex-col gap-4 min-h-0">
                  <div className="flex gap-4 shrink-0">
                    <div className="flex-1 h-20 rounded-xl border border-zinc-200 bg-white shadow-sm p-4 flex flex-col justify-between">
                      <span className="text-xs font-medium text-zinc-500">Peak Attendance</span>
                      <span className="text-xl font-bold text-zinc-900">842 <span className="text-[10px] font-normal text-zinc-400">@ 11:30 AM</span></span>
                    </div>
                    <div className="flex-1 h-20 rounded-xl border border-zinc-200 bg-white shadow-sm p-4 flex flex-col justify-between">
                      <span className="text-xs font-medium text-zinc-500">Avg Session Time</span>
                      <span className="text-xl font-bold text-zinc-900">4h 12m</span>
                    </div>
                    <div className="flex-1 h-20 rounded-xl border border-zinc-200 bg-white shadow-sm p-4 flex flex-col justify-between">
                      <span className="text-xs font-medium text-zinc-500">Drop-off Rate</span>
                      <span className="text-xl font-bold text-zinc-900">4.2%</span>
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl border border-zinc-200 bg-white shadow-sm p-6 flex flex-col gap-6">
                    <span className="text-sm font-semibold text-zinc-900">Live Attendance Cross-section</span>
                    <div className="flex-1 flex items-end gap-3 relative">
                       <div className="absolute inset-0 flex flex-col justify-between py-2">
                          <div className="border-b border-dashed border-zinc-200 w-full"></div>
                          <div className="border-b border-dashed border-zinc-200 w-full"></div>
                          <div className="border-b border-dashed border-zinc-200 w-full"></div>
                       </div>
                       {[40, 65, 45, 80, 55, 95, 75, 85, 60, 100, 70, 90].map((h, i) => (
                         <div key={i} className="flex-1 bg-zinc-900 rounded-t-sm opacity-90 relative z-10 hover:opacity-100 transition-opacity cursor-pointer" style={{ height: `${h}%` }} />
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
