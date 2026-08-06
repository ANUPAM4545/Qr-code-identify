"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { use } from "react";
import { LayoutDashboard, Palette, BarChart, History, Layers, Download, Clock, Settings } from "lucide-react";
import { useEvent } from "@/providers/event-provider";

export default function QRDetailsLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ qrId: string }>;
}) {
  const pathname = usePathname();
  const { event } = useEvent();
  const { qrId } = use(params);
  const eventId = event._id;

  if (qrId === "new") {
    // If it's a new QR code, just show the design studio without details tabs
    return <>{children}</>;
  }

  const tabs = [
    { name: "Overview", href: `/events/${eventId}/qr/${qrId}`, icon: LayoutDashboard },
    { name: "Design", href: `/events/${eventId}/qr/${qrId}/design`, icon: Palette },
    { name: "Analytics", href: `/events/${eventId}/qr/${qrId}/analytics`, icon: BarChart },
    { name: "History", href: `/events/${eventId}/qr/${qrId}/history`, icon: History },
    { name: "Versions", href: `/events/${eventId}/qr/${qrId}/versions`, icon: Layers },
    { name: "Downloads", href: `/events/${eventId}/qr/${qrId}/downloads`, icon: Download },
    { name: "Timeline", href: `/events/${eventId}/qr/${qrId}/timeline`, icon: Clock },
    { name: "Settings", href: `/events/${eventId}/qr/${qrId}/settings`, icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* QR Code Details Navigation */}
      <div className="border-b border-border bg-card/50 px-6 py-2">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
