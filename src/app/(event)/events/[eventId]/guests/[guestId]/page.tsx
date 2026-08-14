/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { GuestTimeline } from "@/components/guests/Timeline";
import { QRCodeSVG } from "qrcode.react";
import { Phone, Briefcase, Building2, CheckSquare, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GuestOverviewPage({ params }: { params: Promise<{ eventId: string; guestId: string }> }) {
  const { eventId, guestId } = use(params);
  
  const { data: guest } = useQuery({
    queryKey: ["guest", eventId, guestId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/guests/${guestId}`);
      const json = await res.json();
      return json.data;
    }
  });

  if (!guest) return null;

  // Build timeline events from guest data
  const checkInEvents = (guest.checkIns || []).map((ci: any) => ({
    type: ci.direction === "in" ? "checked_in" : "checked_out",
    title: ci.direction === "in" ? "Checked In" : "Checked Out",
    description: ci.location ? `Location: ${ci.location}` : undefined,
    createdAt: ci.timestamp
  }));

  const timelineEvents = [
    { type: "created", title: "Guest Created", createdAt: guest.createdAt },
    guest.status === "approved" ? { type: "registration_approved", title: "Registration Approved", createdAt: guest.updatedAt } : null,
    guest.qrCodeId ? { type: "qr_generated", title: "Badge QR Generated", createdAt: guest.updatedAt } : null,
    ...checkInEvents
  ].filter(Boolean) as any[];

  return (
    <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <div className="md:col-span-2 space-y-6">
        <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-2xl shadow-black/[0.02]">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-8">Activity Timeline</h3>
          <GuestTimeline events={timelineEvents} />
        </div>

        {/* Internal Notes Card */}
        <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-2xl shadow-black/[0.02] relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-6">
            <StickyNote className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Internal Notes</h3>
          </div>
          
          <textarea 
            className="w-full bg-muted/20 border border-border/50 rounded-2xl p-5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
            placeholder="Add internal notes about this guest... (e.g. VIP handler, dietary requirements)"
            rows={5}
            defaultValue={guest.notes || ""}
          />
          
          <div className="flex justify-end mt-4">
            <Button size="sm" variant="secondary" className="rounded-xl font-semibold shadow-sm">Save Note</Button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Quick QR View */}
        <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-2xl shadow-black/[0.02] flex flex-col items-center justify-center text-center relative overflow-hidden group">
          {/* Ambient Glow */}
          <div className={`absolute top-0 right-0 w-48 h-48 blur-[50px] rounded-full pointer-events-none transition-colors duration-500 ${guest.qrCodeId ? 'bg-emerald-500/10' : 'bg-yellow-500/10'}`} />
          
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 relative z-10">Assigned QR</h3>
          
          <div className="bg-white p-4 rounded-2xl border shadow-sm mb-6 relative z-10 group-hover:scale-105 transition-transform duration-300">
            <QRCodeSVG 
              value={guest.qrCodeId ? `https://identify.app/q/${guest.qrCodeId}` : JSON.stringify({ g: guestId })} 
              size={150}
              level="H"
            />
          </div>
          
          {guest.qrCodeId ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold tracking-wide relative z-10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Dynamic QR Active
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-600 px-4 py-2 rounded-full text-xs font-bold tracking-wide relative z-10 border border-yellow-500/20">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              Pending Sync
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-2xl shadow-black/[0.02]">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Guest Details</h3>
          
          <div className="space-y-5 text-sm">
            <div className="flex justify-between items-center pb-4 border-b border-border/40">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-muted p-1.5 rounded-lg">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-medium">Phone</span>
              </div>
              <span className="font-bold text-foreground text-right">{guest.phone || "—"}</span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-border/40">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-muted p-1.5 rounded-lg">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="font-medium">Role/Title</span>
              </div>
              <span className="font-bold text-foreground text-right">{guest.title || "—"}</span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-border/40">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-muted p-1.5 rounded-lg">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-medium">Company</span>
              </div>
              <span className="font-bold text-foreground text-right">{guest.organization || "—"}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span className="font-medium">Total Check-ins</span>
              </div>
              <span className="text-lg font-black text-primary text-right">{guest.checkIns?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
