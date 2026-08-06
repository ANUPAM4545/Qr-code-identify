"use client";

import { motion } from "framer-motion";
import { FADE_IN } from "../utils/animations";

export function TrustedBy() {
  const logos = [
    { name: "Acme Corp", icon: "A" },
    { name: "GlobalBank", icon: "G" },
    { name: "TechNova", icon: "T" },
    { name: "Pinnacle", icon: "P" },
    { name: "Vanguard", icon: "V" },
    { name: "Nexus", icon: "N" },
  ];

  return (
    <section className="py-20 border-y border-border/50 bg-muted/20">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_IN}
          className="flex flex-col items-center gap-8"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center">
            Trusted by innovative teams worldwide
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {logos.map((logo) => (
              <div key={logo.name} className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-100 opacity-70">
                <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-xl">
                  {logo.icon}
                </div>
                <span className="font-semibold text-xl tracking-tight text-foreground">{logo.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
