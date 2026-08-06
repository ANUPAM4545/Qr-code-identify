"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FADE_IN, STAGGER_CONTAINER, SLIDE_UP } from "../utils/animations";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      description: "For small teams and local events.",
      price: "$0",
      period: "/month",
      features: [
        "Up to 500 guests per event",
        "Standard QR generation",
        "Basic email support",
        "1 active event"
      ],
      buttonText: "Start for free",
      isPopular: false
    },
    {
      name: "Professional",
      description: "For growing organizations.",
      price: "$299",
      period: "/month",
      features: [
        "Unlimited guests",
        "Advanced QR Design Studio",
        "Priority 24/7 support",
        "Unlimited active events",
        "Team collaboration (up to 5)",
        "Real-time analytics"
      ],
      buttonText: "Get Started",
      isPopular: true
    },
    {
      name: "Enterprise",
      description: "For massive scale and security.",
      price: "Custom",
      period: "",
      features: [
        "Dedicated success manager",
        "Custom SLA (99.99%)",
        "Audit logs & SAML SSO",
        "Unlimited everything",
        "On-premise deployment options",
        "Custom API integrations"
      ],
      buttonText: "Contact Sales",
      isPopular: false
    }
  ];

  return (
    <section className="py-24 bg-white" id="pricing">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_IN}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-zinc-900">Simple, transparent pricing.</h2>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            Choose the perfect plan for your organization&apos;s needs. Upgrade or downgrade at any time.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center"
        >
          {plans.map((plan, i) => (
            <motion.div 
              key={i} 
              variants={SLIDE_UP} 
              className={`relative flex flex-col p-8 rounded-[2rem] border transition-all duration-500 group cursor-default ${plan.isPopular ? 'bg-zinc-900 text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] scale-105 border-zinc-800 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.25)] hover:scale-[1.07] z-10 hover:z-20' : 'bg-white text-zinc-900 border-zinc-200 shadow-sm hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-zinc-300 relative z-0 hover:z-20'}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-zinc-900 border border-zinc-200 shadow-sm px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase transition-transform duration-500 group-hover:-translate-y-3 group-hover:shadow-md">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2 transition-colors duration-300">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.isPopular ? 'text-zinc-300' : 'text-zinc-500'}`}>
                {plan.description}
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold tracking-tight transition-transform duration-500 group-hover:scale-105 origin-left">{plan.price}</span>
                <span className={`text-sm ${plan.isPopular ? 'text-zinc-300' : 'text-zinc-500'}`}>{plan.period}</span>
              </div>
              
              <ul className="flex flex-col gap-4 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <Check className={`w-4 h-4 transition-all duration-300 group-hover:scale-125 ${plan.isPopular ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-400 group-hover:text-zinc-900'}`} />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={plan.isPopular ? "secondary" : "outline"} 
                className={`w-full rounded-full h-12 ${plan.isPopular ? 'bg-white text-zinc-900 hover:bg-zinc-100 hover:scale-[1.02] transition-transform' : 'border-zinc-200 text-zinc-900 hover:bg-zinc-50'}`}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
