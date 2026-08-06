"use client";

import { useState } from "react";
import Link from "next/link";
import { useScroll, useMotionValueEvent, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    if (latest > prevScroll && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setPrevScroll(latest);
  });

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Solutions", href: "#solutions" },
    { label: "Pricing", href: "#pricing" },
    { label: "Documentation", href: "#documentation" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-4 inset-x-0 mx-auto z-50 flex items-center justify-between px-6 py-3 max-w-5xl bg-white/70 backdrop-blur-xl border border-zinc-200/50 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg leading-none">I</span>
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-900">Identify</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-all hover:bg-zinc-100/50 px-3 py-1.5 rounded-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-4 py-2 hover:bg-zinc-100/50 rounded-full">
            Sign In
          </Link>
          <Button className="rounded-full px-6 bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-105 transition-all shadow-sm">Get Started</Button>
        </div>
        <Sheet>
          <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" />}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-4 mt-4 pt-4 border-t">
                <Link href="/login" className="text-lg font-medium">
                  Sign In
                </Link>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
