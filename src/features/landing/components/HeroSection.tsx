"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FADE_IN, SLIDE_UP, STAGGER_CONTAINER } from "../utils/animations";
import { HeroPreview } from "./HeroPreview";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-background to-background -z-10" />
      
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto"
        >
          <motion.div variants={FADE_IN} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50 text-xs font-medium text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-foreground" />
            Introducing Identify Enterprise 2.0
          </motion.div>
          
          <motion.h1 
            variants={SLIDE_UP}
            className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight"
          >
            Manage Events. <br className="hidden md:block" />
            Track Every Guest. <br className="hidden md:block" />
            All From One Platform.
          </motion.h1>
          
          <motion.p 
            variants={SLIDE_UP}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl"
          >
            The premium enterprise platform for event management, intelligent QR codes, secure check-ins, and real-time operations analytics.
          </motion.p>
          
          <motion.div variants={SLIDE_UP} className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full h-12 px-8 text-base group">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-12 px-8 text-base">
              Talk to Sales
            </Button>
          </motion.div>
        </motion.div>

        <HeroPreview />
      </div>
    </section>
  );
}
