/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { GuestTimeline } from "@/components/guests/Timeline";
import { QRCodeSVG } from "qrcode.react";

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

  // Mocking timeline events for demonstration. 
  // In production, these come from `guest.timeline` or an Audit query.
  const mockEvents = [
    { type: "created", title: "Guest Created", createdAt: guest.createdAt },
    guest.status === "approved" ? { type: "registration_approved", title: "Registration Approved", createdAt: guest.updatedAt } : null,
    guest.qrCodeId ? { type: "qr_generated", title: "Badge QR Generated", createdAt: guest.updatedAt } : null,
  ].filter(Boolean) as any[];

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div className="md:col-span-2 space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Timeline</h3>
          <GuestTimeline events={mockEvents} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Quick QR View */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Assigned QR</h3>
          
          <div className="bg-white p-3 rounded-lg border border-border shadow-sm mb-4">
            <QRCodeSVG 
              value={guest.qrCodeId ? `https://identify.app/q/${guest.qrCodeId}` : JSON.stringify({ g: guestId })} 
              size={120}
            />
          </div>
          
          {guest.qrCodeId ? (
            <p className="text-xs text-green-600 font-medium">Dynamic QR Active</p>
          ) : (
            <p className="text-xs text-yellow-600 font-medium">Static QR Pending Sync</p>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Details</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-right">{guest.phone || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role/Title</span>
              <span className="font-medium text-right">{guest.title || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Company</span>
              <span className="font-medium text-right">{guest.organization || "-"}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border mt-3">
              <span className="text-muted-foreground">Check-ins</span>
              <span className="font-medium text-right">{guest.checkIns?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
