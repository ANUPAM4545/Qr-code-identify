"use client";

import { motion } from "framer-motion";
import { QrCode, Users, ScanLine, BarChart3, Settings2, CalendarDays } from "lucide-react";
import { FADE_IN, SLIDE_UP, STAGGER_CONTAINER } from "../utils/animations";

export function FeatureBento() {
  const features = [
    {
      title: "Event Management",
      description: "Create and configure complex multi-day events with ease.",
      icon: CalendarDays,
      className: "md:col-span-2 md:row-span-2",
      preview: (
        <div className="absolute right-0 bottom-0 w-3/4 h-3/4 border-t border-l border-zinc-200 bg-zinc-50 rounded-tl-2xl shadow-[-10px_-10px_30px_rgba(0,0,0,0.03)] p-4 flex flex-col gap-2 overflow-hidden transition-transform duration-500 group-hover:-translate-y-2 group-hover:-translate-x-2">
          <div className="w-1/2 h-4 bg-zinc-300 rounded" />
          <div className="w-3/4 h-3 bg-zinc-200 rounded" />
          <div className="mt-4 flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] shadow-sm"><CalendarDays className="w-4 h-4"/></div>
            <div className="flex-1 rounded-lg border border-zinc-300 bg-white p-3 shadow-sm">
              <div className="w-full h-2 bg-zinc-200 rounded mb-3" />
              <div className="w-2/3 h-2 bg-zinc-200 rounded" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "QR Studio",
      description: "Design intelligent, branded QR codes for seamless check-ins.",
      icon: QrCode,
      className: "md:col-span-1 md:row-span-1 overflow-visible",
      preview: (
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-zinc-900 rounded-2xl p-2 flex items-center justify-center opacity-10 group-hover:opacity-100 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-all duration-500 shadow-xl rotate-12 group-hover:rotate-6">
          <QrCode className="w-20 h-20 text-white" />
        </div>
      )
    },
    {
      title: "Guest Library",
      description: "Manage VIPs, standard guests, and blocklists.",
      icon: Users,
      className: "md:col-span-1 md:row-span-1",
      preview: (
        <div className="absolute bottom-0 right-4 flex -space-x-4 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
          {[1,2,3,4].map(i => (
             <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-zinc-200 shadow-sm flex items-center justify-center text-xs text-zinc-500 font-bold">
               {['A','B','C','D'][i-1]}
             </div>
          ))}
        </div>
      )
    },
    {
      title: "Scanner App",
      description: "Offline-first check-in scanner for iOS and Android.",
      icon: ScanLine,
      className: "md:col-span-1 md:row-span-2",
      preview: (
        <div className="absolute inset-x-8 bottom-0 h-48 border-x border-t border-zinc-200 bg-zinc-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-2 flex flex-col items-center pt-6 transition-transform duration-500 group-hover:-translate-y-4">
          <div className="w-20 h-20 border-2 border-dashed border-emerald-500/50 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <ScanLine className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="w-24 h-2 bg-zinc-300 mt-6 rounded-full" />
          <div className="w-16 h-2 bg-zinc-200 mt-2 rounded-full" />
        </div>
      )
    },
    {
      title: "Analytics",
      description: "Real-time insights on attendance and engagement.",
      icon: BarChart3,
      className: "md:col-span-2 md:row-span-1",
      preview: (
        <div className="absolute right-0 bottom-0 w-2/3 h-full pt-8 pl-8 flex gap-3 items-end">
          {[40, 70, 45, 90, 65, 80].map((h, i) => (
            <div key={i} className="w-10 bg-zinc-900 rounded-t-lg opacity-20 group-hover:opacity-100 transition-all duration-500 group-hover:shadow-[0_-5px_15px_rgba(0,0,0,0.1)]" style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }} />
          ))}
        </div>
      )
    },
    {
      title: "Advanced Settings",
      description: "Granular permissions, webhooks, and audit logs.",
      icon: Settings2,
      className: "md:col-span-1 md:row-span-1",
      preview: (
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white rounded-full border border-zinc-100 shadow-[0_0_40px_rgba(0,0,0,0.05)] flex items-center justify-center transition-transform duration-700 group-hover:rotate-90">
          <Settings2 className="w-16 h-16 text-zinc-200" />
        </div>
      )
    }
  ];

  return (
    <section className="py-24" id="features">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_IN}
          className="flex flex-col gap-4 mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900">Everything you need. <br/> Nothing you don&apos;t.</h2>
          <p className="text-lg text-zinc-500 max-w-2xl">
            A comprehensive suite of tools engineered specifically for high-stakes enterprise events.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 auto-rows-[250px]"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={SLIDE_UP}
              whileHover="hover"
              initial="rest"
              animate="rest"
              className={`group relative overflow-hidden rounded-[2rem] border border-zinc-200/60 bg-white p-8 flex flex-col gap-4 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-300 ${feature.className}`}
            >
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-zinc-900">{feature.title}</h3>
                  <p className="text-sm text-zinc-500 max-w-[250px] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              {feature.preview}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
