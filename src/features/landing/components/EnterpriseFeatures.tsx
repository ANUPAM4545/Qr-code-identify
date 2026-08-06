"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Network, DatabaseBackup, Lock, WifiOff, UploadCloud, Activity, CloudSync } from "lucide-react";
import { FADE_IN, STAGGER_CONTAINER, SLIDE_UP } from "../utils/animations";

export function EnterpriseFeatures() {
  const features = [
    { icon: Network, title: "Multi-Event Architecture", desc: "Manage simultaneous massive scale events." },
    { icon: ShieldCheck, title: "Audit Logs", desc: "Comprehensive tracking of all system mutations." },
    { icon: Lock, title: "Granular Permissions", desc: "Role-based access control for teams." },
    { icon: WifiOff, title: "Offline Scanner", desc: "Scan QR tickets completely offline without data loss." },
    { icon: UploadCloud, title: "Import & Export", desc: "Native CSV integrations for heavy data loads." },
    { icon: Activity, title: "Real-time Analytics", desc: "Sub-second latency on check-in metrics." },
    { icon: CloudSync, title: "Cloud Sync", desc: "Automatic conflict resolution across scanner devices." },
    { icon: DatabaseBackup, title: "Enterprise SLA", desc: "99.99% guaranteed uptime." },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_IN}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight">Enterprise grade by default.</h2>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
        >
          {features.map((feat, i) => (
            <motion.div key={i} variants={SLIDE_UP} className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <feat.icon className="w-5 h-5 text-foreground" />
              </div>
              <h4 className="font-semibold text-base">{feat.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
