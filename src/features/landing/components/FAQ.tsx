"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FADE_IN, SLIDE_UP } from "../utils/animations";

export function FAQ() {
  const faqs = [
    {
      question: "How does the offline scanner work?",
      answer: "Our scanner app securely downloads the guest list to the device prior to the event. When a QR code is scanned, it validates locally. Once an internet connection is re-established, all check-ins automatically sync to the cloud with conflict resolution."
    },
    {
      question: "Can I manage multiple events simultaneously?",
      answer: "Yes. Identify is built on a multi-event architecture, allowing you to manage, track, and analyze dozens of events concurrently from a single unified workspace."
    },
    {
      question: "What level of access control is available?",
      answer: "Identify supports granular Role-Based Access Control (RBAC). You can assign custom permissions ensuring team members only have access to the specific events or modules they need."
    },
    {
      question: "Do you support custom integrations?",
      answer: "Absolutely. Our Enterprise plan includes access to a robust GraphQL API, webhooks, and native CSV import/export capabilities, allowing seamless integration with your existing CRM or marketing stack."
    },
    {
      question: "Is the platform secure and compliant?",
      answer: "Security is our top priority. We provide detailed audit logs, support SAML SSO, and host data in isolated environments to ensure strict compliance with enterprise security standards."
    }
  ];

  return (
    <section className="py-24 bg-muted/10 border-t border-border/50">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_IN}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about the product and billing.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={SLIDE_UP}
        >
          <Accordion className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b-border/50">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline hover:text-muted-foreground transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
