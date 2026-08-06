"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { FADE_IN } from "../utils/animations";

const features = [
  {
    id: "workspace",
    title: "Workspace Dashboard",
    description: "A centralized command center for all your events. Monitor high-level metrics, upcoming schedules, and team activity in real-time.",
    preview: (
      <div className="w-full h-full bg-muted/20 p-6 flex flex-col gap-4 border rounded-xl overflow-hidden shadow-sm">
        <div className="w-full h-8 flex justify-between items-center border-b pb-4">
          <div className="w-32 h-4 bg-muted rounded" />
          <div className="w-8 h-8 rounded-full bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-card border rounded-lg p-4"><div className="w-16 h-3 bg-muted rounded mb-2" /><div className="w-12 h-6 bg-foreground/20 rounded" /></div>
          <div className="h-24 bg-card border rounded-lg p-4"><div className="w-16 h-3 bg-muted rounded mb-2" /><div className="w-12 h-6 bg-foreground/20 rounded" /></div>
        </div>
        <div className="flex-1 bg-card border rounded-lg p-4">
          <div className="w-24 h-4 bg-muted rounded mb-4" />
          <div className="w-full h-2 bg-muted/50 rounded mb-2" />
          <div className="w-full h-2 bg-muted/50 rounded mb-2" />
          <div className="w-3/4 h-2 bg-muted/50 rounded" />
        </div>
      </div>
    )
  },
  {
    id: "create-event",
    title: "Create Event Wizard",
    description: "Launch complex events in minutes. Configure dates, locations, ticketing tiers, and custom forms through a streamlined step-by-step process.",
    preview: (
      <div className="w-full h-full bg-muted/20 p-6 flex flex-col gap-4 border rounded-xl overflow-hidden shadow-sm">
        <div className="w-full h-4 bg-muted rounded mb-4" />
        <div className="flex gap-2 mb-6">
          <div className="flex-1 h-1 bg-foreground rounded" />
          <div className="flex-1 h-1 bg-muted rounded" />
          <div className="flex-1 h-1 bg-muted rounded" />
        </div>
        <div className="bg-card border rounded-lg p-6 flex-1">
          <div className="w-32 h-4 bg-muted rounded mb-6" />
          <div className="space-y-4">
            <div><div className="w-20 h-2 bg-muted/50 rounded mb-2" /><div className="w-full h-10 border rounded-md" /></div>
            <div><div className="w-20 h-2 bg-muted/50 rounded mb-2" /><div className="w-full h-10 border rounded-md" /></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "guest-management",
    title: "Guest Management",
    description: "Organize thousands of attendees with powerful filtering, bulk actions, and real-time status updates from the field.",
    preview: (
      <div className="w-full h-full bg-muted/20 p-6 flex flex-col gap-4 border rounded-xl overflow-hidden shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="w-48 h-10 border bg-card rounded-md" />
          <div className="w-24 h-10 bg-foreground rounded-md" />
        </div>
        <div className="bg-card border rounded-lg flex-1">
          <div className="border-b p-4 flex gap-4"><div className="w-4 h-4 rounded bg-muted" /><div className="w-20 h-3 bg-muted rounded" /><div className="w-32 h-3 bg-muted rounded ml-auto" /></div>
          {[1,2,3,4].map(i => (
             <div key={i} className="border-b p-4 flex gap-4 items-center"><div className="w-4 h-4 rounded border" /><div className="w-6 h-6 rounded-full bg-muted" /><div className="w-24 h-3 bg-muted/50 rounded" /><div className="w-16 h-4 bg-secondary rounded ml-auto" /></div>
          ))}
        </div>
      </div>
    )
  }
];

export function ProductShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <section className="py-32 bg-background border-t border-border/50" id="solutions">
      <div className="container mx-auto px-6 max-w-7xl relative" ref={containerRef}>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_IN}
          className="mb-24 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">A complete ecosystem.</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From initial setup to post-event analytics, Identify provides every tool necessary for flawless execution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative">
          {/* Scrollable Text Side */}
          <div className="flex flex-col gap-32 lg:gap-[50vh] py-[10vh] lg:py-[20vh]">
            {features.map((feature) => (
              <div key={feature.id} className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl font-bold">
                  {feature.title.charAt(0)}
                </div>
                <h3 className="text-3xl font-bold">{feature.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Mobile Preview (hidden on Desktop) */}
                <div className="lg:hidden h-[300px] mt-8">
                  {feature.preview}
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Visual Side */}
          <div className="hidden lg:block relative h-[100vh]">
            <div className="sticky top-[20vh] h-[60vh] w-full rounded-2xl overflow-hidden flex items-center justify-center">
               {/* Note: In a production robust setup, we'd use useScroll to crossfade these components based on scroll position. 
                   For the Landing Phase 1, we will show a stacked overlapping card effect or a general preview that updates. */}
                <div className="absolute inset-0 bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-2">
                  <div className="w-full h-full relative">
                    <FeatureScrollSync features={features} containerRef={containerRef} />
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturePreviewItem({ feature, index, total, scrollYProgress }: { feature: { id: string, preview: React.ReactNode }, index: number, total: number, scrollYProgress: MotionValue<number> }) {
  const start = index / total;
  const end = (index + 1) / total;
  
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.1), start, end - 0.1, Math.min(1, end + 0.1)],
    [0, 1, 1, 0]
  );

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0"
    >
      {feature.preview}
    </motion.div>
  );
}

function FeatureScrollSync({ features, containerRef }: { features: { id: string, preview: React.ReactNode }[], containerRef: React.RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  return (
    <>
      {features.map((feature, index) => (
        <FeaturePreviewItem 
          key={feature.id}
          feature={feature} 
          index={index} 
          total={features.length} 
          scrollYProgress={scrollYProgress} 
        />
      ))}
    </>
  );
}
