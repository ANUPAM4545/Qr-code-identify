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
    <section className="py-24" id="pricing">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_IN}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing.</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
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
              className={`relative flex flex-col p-8 rounded-2xl border ${plan.isPopular ? 'bg-foreground text-background shadow-2xl scale-105' : 'bg-background text-foreground'}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-foreground border px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.isPopular ? 'text-background/80' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                <span className={`text-sm ${plan.isPopular ? 'text-background/80' : 'text-muted-foreground'}`}>{plan.period}</span>
              </div>
              
              <ul className="flex flex-col gap-4 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <Check className={`w-4 h-4 ${plan.isPopular ? 'text-background' : 'text-foreground'}`} />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={plan.isPopular ? "secondary" : "outline"} 
                className={`w-full rounded-full h-12 ${plan.isPopular ? 'hover:bg-background/90' : ''}`}
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
