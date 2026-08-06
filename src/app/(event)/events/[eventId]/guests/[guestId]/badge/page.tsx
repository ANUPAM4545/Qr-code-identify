"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, Settings2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

export default function BadgeStudioPage({ params }: { params: Promise<{ eventId: string; guestId: string }> }) {
  const { eventId, guestId } = use(params);

  const { data: guest, isLoading } = useQuery({
    queryKey: ["guest", eventId, guestId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/guests/${guestId}`);
      const json = await res.json();
      return json.data;
    }
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !guest) return <div className="p-8">Loading badge...</div>;

  // The QR payload (can be URL or JSON)
  const qrData = guest.qrCodeId 
    ? `https://identify.app/q/${guest.qrCodeId}` 
    : JSON.stringify({ g: guestId });

  return (
    <div className="h-full flex">
      {/* Sidebar Controls (Hidden when printing) */}
      <div className="w-80 border-r border-border bg-card p-6 flex flex-col print:hidden">
        <div>
          <h2 className="text-lg font-semibold">Badge Studio</h2>
          <p className="text-sm text-muted-foreground mt-1">Design and print attendee badges directly from your browser.</p>
        </div>

        <div className="mt-8 space-y-6 flex-1">
          <div className="space-y-3">
            <label className="text-sm font-medium">Template</label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
              <option>Standard Attendee</option>
              <option>VIP Access</option>
              <option>Speaker</option>
              <option>Staff / Volunteer</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Print Format</label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
              <option>Single Badge (Thermal 4x3&quot;)</option>
              <option>A4 Sheet (6 per page)</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-border space-y-3">
          <Button className="w-full" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Badge
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Live Preview Area */}
      <div className="flex-1 bg-muted/20 p-12 overflow-auto flex items-center justify-center print:p-0 print:bg-white">
        
        {/* Actual Printable Badge Element */}
        <div 
          className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col relative print:shadow-none print:rounded-none"
          style={{ width: '400px', height: '600px' }}
        >
          {/* Top Branding Banner */}
          <div className="h-32 bg-primary flex items-center justify-center p-6 text-primary-foreground">
            {/* Event Logo Placeholder */}
            <div className="text-2xl font-black tracking-tighter uppercase opacity-90">
              IDENTIFY 2026
            </div>
          </div>

          {/* Attendee Details */}
          <div className="flex-1 flex flex-col items-center pt-10 px-8 text-center bg-white text-black">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight">
              {guest.firstName}
              <br />
              {guest.lastName}
            </h1>
            
            {guest.organization && (
              <p className="text-xl text-gray-500 mt-4 font-medium uppercase tracking-widest">
                {guest.organization}
              </p>
            )}
            
            {guest.title && (
              <p className="text-gray-400 mt-1">
                {guest.title}
              </p>
            )}

            {/* Dynamic QR Code */}
            <div className="mt-auto mb-10 p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
              <QRCodeSVG 
                value={qrData} 
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Bottom Group/Ticket Banner */}
          <div className="h-16 bg-gray-900 flex items-center justify-center text-white text-lg font-bold tracking-widest uppercase">
            {guest.status === "approved" ? "General Admission" : "Pending"}
          </div>
        </div>

      </div>

      {/* Global CSS overrides for printing only this specific component */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .flex-1 > div {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 4in !important;
            height: 6in !important;
            border: 1px solid #000;
          }
          .flex-1 > div * {
            visibility: visible;
          }
          @page {
            size: 4in 6in;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
