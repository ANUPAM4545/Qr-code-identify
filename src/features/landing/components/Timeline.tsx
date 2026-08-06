"use client";

import { motion } from "framer-motion";
import { FADE_IN, SLIDE_UP, STAGGER_CONTAINER } from "../utils/animations";

export function Timeline() {
  const steps = [
    { title: "Create Event", desc: "Set up the foundation" },
    { title: "Configure Form", desc: "Build custom registration" },
    { title: "Generate QR", desc: "Intelligent ticket access" },
    { title: "Invite Guests", desc: "Mass import & invite" },
    { title: "Scan Check-ins", desc: "Offline scanner app" },
    { title: "Track Analytics", desc: "Live dashboard" },
  ];

  return (
    <section className="py-24 bg-muted/30 border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_IN}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">A flawless workflow.</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            Identify maps precisely to how elite event managers work.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="relative max-w-4xl mx-auto"
        >
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border/50 -translate-y-1/2 hidden md:block" />
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-1/2 left-0 right-0 h-px bg-foreground origin-left -translate-y-1/2 hidden md:block"
          />

          <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
            {steps.map((step, i) => (
              <motion.div key={i} variants={SLIDE_UP} className="flex flex-col items-center text-center group relative bg-muted/30 md:bg-transparent py-4 md:py-0 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-background border-2 border-border group-hover:border-foreground transition-colors duration-300 relative z-10 hidden md:block" />
                <div className="md:mt-6 px-2">
                  <h4 className="font-bold text-sm">{step.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-[100px] leading-tight mx-auto">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
