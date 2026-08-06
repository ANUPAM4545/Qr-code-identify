"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FADE_IN, SLIDE_UP } from "../utils/animations";

export function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-muted/80 via-background to-background -z-10" />
      
      <div className="container mx-auto px-6 max-w-5xl text-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center gap-8"
        >
          <motion.h2 
            variants={SLIDE_UP} 
            className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl"
          >
            Start Managing Events Like An Enterprise.
          </motion.h2>
          
          <motion.p 
            variants={FADE_IN} 
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Join the world&apos;s most innovative organizations managing seamless, secure, and data-driven events on Identify.
          </motion.p>
          
          <motion.div variants={SLIDE_UP} className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Button size="lg" className="rounded-full h-14 px-10 text-base group">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-base">
              Contact Sales
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
