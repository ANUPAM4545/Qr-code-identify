"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, SlidersHorizontal, QrCode, Mail, Smartphone, LineChart, CheckCircle2 } from "lucide-react";
import { FADE_IN } from "../utils/animations";

const steps = [
  { title: "Create Event", desc: "Set up the foundation", icon: CalendarPlus },
  { title: "Configure Form", desc: "Build custom registration", icon: SlidersHorizontal },
  { title: "Generate QR", desc: "Intelligent ticket access", icon: QrCode },
  { title: "Invite Guests", desc: "Mass import & invite", icon: Mail },
  { title: "Scan Check-ins", desc: "Offline scanner app", icon: Smartphone },
  { title: "Track Analytics", desc: "Live dashboard", icon: LineChart },
];

export function Timeline() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 bg-white border-y border-zinc-200 overflow-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_IN}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6">A flawless workflow.</h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Identify maps precisely to how elite event managers operate, fully automating the busywork so you can focus on the experience.
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto mt-20">
          {/* Desktop Connecting Line */}
          <div className="absolute top-[3.5rem] left-[5%] right-[5%] h-1 bg-zinc-100 rounded-full hidden md:block" />
          
          {/* Animated Progress Line */}
          <div 
            className="absolute top-[3.5rem] left-[5%] h-1 bg-zinc-900 rounded-full hidden md:block transition-all duration-700 ease-in-out" 
            style={{ width: `${(activeStep / (steps.length - 1)) * 90}%` }}
          />

          <div className="grid grid-cols-1 md:grid-cols-6 gap-8 md:gap-4 relative z-10">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              
              return (
                <div 
                  key={i} 
                  className="flex flex-col items-center text-center group cursor-pointer relative"
                  onClick={() => setActiveStep(i)}
                >
                  {/* Icon Node */}
                  <div className={`
                    w-16 h-16 md:w-28 md:h-28 rounded-2xl flex items-center justify-center mb-6 
                    transition-all duration-500 border-2 shadow-sm relative bg-white
                    ${isActive 
                      ? 'border-zinc-900 text-zinc-900 scale-110 shadow-[0_10px_40px_rgba(0,0,0,0.1)]' 
                      : isPast 
                        ? 'border-zinc-900 text-zinc-900' 
                        : 'border-zinc-200 text-zinc-400 hover:border-zinc-300'}
                  `}>
                    <step.icon className={`w-8 h-8 md:w-10 md:h-10 transition-transform duration-500 ${isActive ? 'scale-110' : ''}`} strokeWidth={1.5} />
                    
                    {/* Active Ping Effect */}
                    {isActive && (
                      <span className="absolute inset-0 rounded-2xl ring-2 ring-zinc-900 ring-offset-4 opacity-50 animate-pulse" />
                    )}
                    
                    {/* Checkmark for past steps */}
                    {isPast && (
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      </div>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className={`transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-2 group-hover:opacity-100 group-hover:translate-y-1'}`}>
                    <h4 className={`font-bold text-base md:text-lg mb-2 ${isActive ? 'text-zinc-900' : 'text-zinc-700'}`}>{step.title}</h4>
                    <p className="text-xs md:text-sm text-zinc-500 leading-relaxed max-w-[140px] mx-auto">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
