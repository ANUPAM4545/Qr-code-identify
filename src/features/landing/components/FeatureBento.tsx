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
        <div className="absolute right-0 bottom-0 w-3/4 h-3/4 border-t border-l border-border/50 bg-background rounded-tl-xl shadow-xl p-4 flex flex-col gap-2">
          <div className="w-1/2 h-4 bg-muted rounded" />
          <div className="w-3/4 h-3 bg-muted/50 rounded" />
          <div className="mt-4 flex gap-2">
            <div className="w-8 h-8 rounded bg-secondary" />
            <div className="flex-1 rounded border border-border/50 p-2">
              <div className="w-full h-2 bg-muted rounded mb-2" />
              <div className="w-2/3 h-2 bg-muted/50 rounded" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "QR Studio",
      description: "Design intelligent, branded QR codes for seamless check-ins.",
      icon: QrCode,
      className: "md:col-span-1 md:row-span-1",
      preview: (
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-foreground rounded-lg p-2 flex items-center justify-center opacity-10 group-hover:opacity-100 transition-opacity duration-500">
          <QrCode className="w-16 h-16 text-background" />
        </div>
      )
    },
    {
      title: "Guest Library",
      description: "Manage VIPs, standard guests, and blocklists.",
      icon: Users,
      className: "md:col-span-1 md:row-span-1",
      preview: null
    },
    {
      title: "Scanner App",
      description: "Offline-first check-in scanner for iOS and Android.",
      icon: ScanLine,
      className: "md:col-span-1 md:row-span-2",
      preview: (
        <div className="absolute right-4 bottom-0 w-32 h-48 border-x border-t border-border/50 bg-background rounded-t-2xl shadow-xl p-2 flex flex-col items-center pt-4">
          <div className="w-16 h-16 border-2 border-dashed border-foreground/30 rounded-lg flex items-center justify-center">
            <ScanLine className="w-8 h-8 text-foreground/50" />
          </div>
          <div className="w-20 h-2 bg-muted mt-4 rounded" />
        </div>
      )
    },
    {
      title: "Analytics",
      description: "Real-time insights on attendance and engagement.",
      icon: BarChart3,
      className: "md:col-span-2 md:row-span-1",
      preview: (
        <div className="absolute right-0 bottom-0 w-2/3 h-full pt-8 pl-8 flex gap-2 items-end">
          {[40, 70, 45, 90, 65, 80].map((h, i) => (
            <div key={i} className="w-8 bg-foreground rounded-t-sm opacity-10 group-hover:opacity-20 transition-all duration-300" style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    },
    {
      title: "Advanced Settings",
      description: "Granular permissions, webhooks, and audit logs.",
      icon: Settings2,
      className: "md:col-span-1 md:row-span-1",
      preview: null
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
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need. <br/> Nothing you don&apos;t.</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
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
              className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 flex flex-col gap-4 ${feature.className}`}
            >
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
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
