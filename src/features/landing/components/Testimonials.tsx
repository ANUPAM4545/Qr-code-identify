"use client";

import { motion } from "framer-motion";
import { STAGGER_CONTAINER, SLIDE_UP } from "../utils/animations";

export function Testimonials() {
  const testimonials = [
    {
      quote: "Identify completely transformed how we handle our global summits. The seamless check-in experience and offline scanner saved us during a massive network outage.",
      author: "Sarah Jenkins",
      role: "VP of Events, GlobalBank",
      initial: "S"
    },
    {
      quote: "The monochrome design is not just beautiful, it's highly functional. We trained our staff in minutes, and the analytics dashboard gives us instant insights.",
      author: "Marcus Chen",
      role: "Operations Director, TechNova",
      initial: "M"
    },
    {
      quote: "Finally, an event management platform that doesn't look like it was built in 2010. Identify brings modern SaaS architecture to a legacy industry.",
      author: "Elena Rodriguez",
      role: "Founder, Pinnacle Events",
      initial: "E"
    }
  ];

  return (
    <section className="py-24 bg-muted/20 border-y border-border/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((test, i) => (
            <motion.div 
              key={i} 
              variants={SLIDE_UP} 
              className="flex flex-col gap-6 p-8 rounded-2xl border bg-background"
            >
              <div className="flex text-foreground">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 11L8 15H11V19H5V15L7 11H5V7H11V11H10ZM20 11L18 15H21V19H15V15L17 11H15V7H21V11H20Z" />
                </svg>
              </div>
              <p className="text-base text-foreground leading-relaxed flex-1">
                &quot;{test.quote}&quot;
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-foreground">
                  {test.initial}
                </div>
                <div>
                  <h5 className="font-semibold text-sm">{test.author}</h5>
                  <p className="text-xs text-muted-foreground">{test.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
