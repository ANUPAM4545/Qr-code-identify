"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ 
          duration: 0.2, 
          ease: [0.22, 1, 0.36, 1] // Custom ease-out curve for premium feel
        }}
        className="flex flex-col flex-1 w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
