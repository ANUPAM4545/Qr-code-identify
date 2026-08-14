"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion";
import { QrCode, Users, ScanLine, BarChart3, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

const features = [
  {
    id: "qr",
    title: "Dynamic QR Studio",
    description: "Generate intelligent, branded QR codes that adapt in real-time. Track scans instantly.",
    icon: QrCode,
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    id: "guests",
    title: "Smart Guest CRM",
    description: "Manage thousands of attendees with instant search, bulk actions, and rich profiles.",
    icon: Users,
    color: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-500/20",
  },
  {
    id: "scanner",
    title: "Lightning Fast Check-in",
    description: "Sub-second scanning with instant offline-sync. Keep your lines moving flawlessly.",
    icon: ScanLine,
    color: "from-purple-400 to-fuchsia-500",
    shadow: "shadow-purple-500/20",
  },
  {
    id: "analytics",
    title: "Real-time Analytics",
    description: "Watch your event unfold with beautiful, live-updating charts and heatmaps.",
    icon: BarChart3,
    color: "from-orange-400 to-rose-500",
    shadow: "shadow-orange-500/20",
  }
];

export function AdvancedFeatures() {
  const [activeFeature, setActiveFeature] = useState(features[0].id);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-32 relative overflow-hidden bg-zinc-950" id="features">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 1 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] bg-gradient-to-tr ${features.find(f => f.id === activeFeature)?.color}`}
          />
        </AnimatePresence>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10" ref={containerRef}>
        <div className="flex flex-col md:flex-row gap-16 items-center">
          
          {/* Left Side: Feature Selection */}
          <div className="w-full md:w-1/2 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium mb-6 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Next Generation Platform
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Everything works <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">like magic.</span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-xl">
                We've reimagined event management from the ground up, stripping away the complexity to leave you with pure, unadulterated power.
              </p>
            </motion.div>

            <div className="flex flex-col gap-4 mt-4">
              {features.map((feature, index) => (
                <motion.button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                  className={`group relative p-6 rounded-2xl text-left transition-all duration-300 overflow-hidden ${
                    activeFeature === feature.id 
                      ? "bg-white/10 border-white/20 shadow-2xl backdrop-blur-md" 
                      : "bg-transparent border-transparent hover:bg-white/5 border border-transparent"
                  } border`}
                >
                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br transition-all duration-500 ${
                      activeFeature === feature.id ? feature.color : "from-zinc-800 to-zinc-900"
                    }`}>
                      <feature.icon className={`w-6 h-6 ${activeFeature === feature.id ? "text-white" : "text-zinc-400"}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${activeFeature === feature.id ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm transition-colors duration-300 ${activeFeature === feature.id ? "text-zinc-300" : "text-zinc-500"}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {activeFeature === feature.id && (
                    <motion.div
                      layoutId="activeFeatureIndicator"
                      className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Side: Interactive Showcase */}
          <div className="w-full md:w-1/2 h-[600px] relative perspective-1000">
            <motion.div
              initial={{ opacity: 0, rotateY: 20, x: 50 }}
              animate={isInView ? { opacity: 1, rotateY: 0, x: 0 } : { opacity: 0, rotateY: 20, x: 50 }}
              transition={{ duration: 1, type: "spring", bounce: 0.3 }}
              className="w-full h-full relative"
            >
              {/* Glassmorphism Device Mockup */}
              <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="h-14 border-b border-white/10 flex items-center px-6 gap-2 bg-white/5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                
                <div className="flex-1 relative p-8">
                  <AnimatePresence mode="wait">
                    {/* QR Studio Showcase */}
                    {activeFeature === "qr" && (
                      <motion.div
                        key="qr"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full flex flex-col items-center justify-center gap-8"
                      >
                        <div className="relative w-64 h-64 bg-white rounded-3xl p-6 shadow-2xl flex items-center justify-center">
                          <QrCode className="w-full h-full text-zinc-900" />
                          <motion.div
                            animate={{ top: ["0%", "100%", "0%"], opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)]"
                          />
                        </div>
                        <div className="flex gap-4">
                          <div className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium flex items-center gap-2 backdrop-blur-md">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure
                          </div>
                          <div className="px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium backdrop-blur-md">
                            Live Tracking
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Guest CRM Showcase */}
                    {activeFeature === "guests" && (
                      <motion.div
                        key="guests"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full flex flex-col gap-4"
                      >
                        {[
                          { initials: 'JD', name: 'John Doe', email: 'john.doe@acme.corp', role: 'VIP Guest' },
                          { initials: 'AS', name: 'Alice Smith', email: 'alice@tech.inc', role: 'Speaker' },
                          { initials: 'MR', name: 'Mike Ross', email: 'mike.ross@pearson.co', role: 'Attendee' },
                          { initials: 'KL', name: 'Karen Lee', email: 'karen@design.studio', role: 'Attendee' }
                        ].map((guest, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                              {guest.initials}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-zinc-200">{guest.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">
                                  {guest.role}
                                </span>
                              </div>
                              <div className="text-sm text-zinc-400">{guest.email}</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                              <ArrowRight className="w-4 h-4 text-zinc-400" />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Scanner Showcase */}
                    {activeFeature === "scanner" && (
                      <motion.div
                        key="scanner"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full flex flex-col items-center justify-center"
                      >
                        <motion.div 
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="relative w-48 h-48 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.3)] mb-12"
                        >
                          <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                          >
                            <ScanLine className="w-20 h-20 text-purple-400" />
                          </motion.div>
                        </motion.div>
                        
                        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                          <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
                          />
                          <div className="flex justify-between items-center relative z-10">
                            <span className="text-zinc-400">Status</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4" /> Ready to scan
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Analytics Showcase */}
                    {activeFeature === "analytics" && (
                      <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full flex flex-col gap-6"
                      >
                        <div className="flex gap-4">
                          <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-zinc-400 text-sm mb-2">Live Attendees</div>
                            <div className="text-4xl font-bold text-white">2,405</div>
                          </div>
                          <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-zinc-400 text-sm mb-2">Check-in Rate</div>
                            <div className="text-4xl font-bold text-orange-400">89%</div>
                          </div>
                        </div>
                        
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 flex items-end justify-between gap-2">
                          {[30, 50, 40, 70, 85, 60, 95, 80, 100].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: "10%" }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 1, type: "spring", delay: i * 0.05 }}
                              className="w-full bg-gradient-to-t from-orange-500/50 to-rose-500 rounded-t-lg"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
