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
    <section className="py-24 bg-zinc-50 border-t border-zinc-200" id="faq">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={FADE_IN}
            className="lg:col-span-5"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-900">Frequently Asked Questions</h2>
            <p className="text-lg text-zinc-500 max-w-md">
              Everything you need to know about the product and billing. Have more questions? Reach out to our team.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={SLIDE_UP}
            className="lg:col-span-7"
          >
            <Accordion className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border border-zinc-200/60 bg-white px-6 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300">
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline text-zinc-900 hover:text-zinc-700 py-6 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-500 text-base leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
