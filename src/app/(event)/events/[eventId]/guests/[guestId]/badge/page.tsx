"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, Settings2, Download, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";

export default function BadgeStudioPage({ params }: { params: Promise<{ eventId: string; guestId: string }> }) {
  const { eventId, guestId } = use(params);
  const [badgeTemplate, setBadgeTemplate] = useState("Standard Attendee");
  const [isSending, setIsSending] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

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

  const handleDownloadPDF = async () => {
    const badgeElement = document.getElementById("badge-preview-element");
    if (!badgeElement) return;

    try {
      toast.loading("Generating PDF...", { id: "pdf-toast" });
      
      const imgData = await toPng(badgeElement, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        fontEmbedCSS: '',
        style: {
          transform: "scale(1)",
          transformOrigin: "top left"
        }
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [101.6, 152.4] // 4x6 inches approx
      });

      pdf.addImage(imgData, "PNG", 0, 0, 101.6, 152.4);
      pdf.save(`Badge_${guest?.firstName}_${guest?.lastName}.pdf`);
      
      toast.success("PDF Downloaded", { id: "pdf-toast" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF", { id: "pdf-toast" });
    }
  };

  const handleSendInvitation = async () => {
    const badgeElement = document.getElementById("badge-preview-element");
    if (!badgeElement) return;

    try {
      setIsSending(true);
      toast.loading("Generating PDF & sending invitation...", { id: "send-toast" });
      
      const imgData = await toPng(badgeElement, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        fontEmbedCSS: '',
        style: {
          transform: "scale(1)",
          transformOrigin: "top left"
        }
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [101.6, 152.4] // 4x6 inches approx
      });

      pdf.addImage(imgData, "PNG", 0, 0, 101.6, 152.4);
      const pdfDataUri = pdf.output("datauristring");

      const res = await fetch(`/api/events/${eventId}/guests/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestIds: [guestId],
          attachment: pdfDataUri,
          customMessage: customMessage
        }),
      });

      if (!res.ok) throw new Error("Failed to send");

      toast.success("Invitation sent successfully with badge attached!", { id: "send-toast" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to send invitation", { id: "send-toast" });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading || !guest) return <div className="p-8">Loading badge...</div>;

  // The QR payload (can be URL or JSON)
  const qrData = guest.qrCodeId 
    ? `https://identify.app/q/${guest.qrCodeId}` 
    : JSON.stringify({ g: guestId });

  const getThemeStyles = () => {
    switch (badgeTemplate) {
      case "VIP Access":
        return {
          top: "bg-gradient-to-br from-amber-300 via-yellow-500 to-orange-500 text-black shadow-inner",
          bottom: "bg-gradient-to-r from-yellow-600 to-amber-700 text-white",
          bg: "bg-gradient-to-b from-amber-50 to-white",
          text: "text-amber-950",
          qrBorder: "border-amber-200 shadow-amber-100/50",
          accent: "text-amber-700"
        };
      case "Speaker":
        return {
          top: "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-inner",
          bottom: "bg-gradient-to-r from-violet-700 to-fuchsia-700 text-white",
          bg: "bg-gradient-to-b from-fuchsia-50 to-white",
          text: "text-slate-900",
          qrBorder: "border-fuchsia-200 shadow-fuchsia-100/50",
          accent: "text-fuchsia-600"
        };
      case "Staff / Volunteer":
        return {
          top: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-inner",
          bottom: "bg-gradient-to-r from-emerald-700 to-teal-800 text-white",
          bg: "bg-gradient-to-b from-emerald-50 to-white",
          text: "text-slate-900",
          qrBorder: "border-emerald-200 shadow-emerald-100/50",
          accent: "text-emerald-600"
        };
      default: // Standard Attendee
        return {
          top: "bg-slate-900 text-white",
          bottom: "bg-slate-800 text-white",
          bg: "bg-white",
          text: "text-slate-900",
          qrBorder: "border-slate-100 shadow-slate-100/50",
          accent: "text-slate-500"
        };
    }
  };

  const theme = getThemeStyles();

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
            <select 
              value={badgeTemplate}
              onChange={(e) => setBadgeTemplate(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
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

          <div className="space-y-3">
            <label className="text-sm font-medium">Email Message</label>
            <textarea 
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Optional custom message..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm min-h-[80px]"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border space-y-3">
          <Button className="w-full" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Badge
          </Button>
          <Button variant="outline" className="w-full" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSendInvitation} disabled={isSending}>
            <Send className="w-4 h-4 mr-2" /> {isSending ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </div>

      {/* Live Preview Area */}
      <div className="flex-1 bg-muted/20 p-12 overflow-auto flex items-center justify-center print:p-0 print:bg-white">
        
        {/* Actual Printable Badge Element */}
        <div 
          id="badge-preview-element"
          className="bg-white shadow-2xl shadow-black/10 rounded-[2rem] overflow-hidden flex flex-col relative print:shadow-none print:rounded-none ring-1 ring-black/5"
          style={{ width: '400px', height: '600px' }}
        >
          {/* Top Branding Banner */}
          <div className={`h-36 flex items-center justify-center p-6 ${theme.top}`}>
            {/* Event Logo Placeholder */}
            <div className="text-3xl font-black tracking-tighter uppercase opacity-95 flex flex-col items-center">
              <span>IDENTIFY</span>
              <span className="text-sm font-bold tracking-[0.3em] opacity-80 mt-1">2026</span>
            </div>
          </div>

          {/* Attendee Details */}
          <div className={`flex-1 flex flex-col items-center pt-10 px-8 text-center ${theme.bg}`}>
            <h1 className={`text-4xl font-bold tracking-tight leading-tight ${theme.text}`}>
              {guest.firstName}
              <br />
              {guest.lastName}
            </h1>
            
            {guest.organization && (
              <p className={`text-xl mt-4 font-bold uppercase tracking-widest ${theme.accent}`}>
                {guest.organization}
              </p>
            )}
            
            {guest.title && (
              <p className="text-slate-500 mt-2 font-medium">
                {guest.title}
              </p>
            )}

            {/* Dynamic QR Code */}
            <div className={`mt-auto mb-10 p-5 bg-white rounded-2xl border shadow-lg ${theme.qrBorder}`}>
              <QRCodeSVG 
                value={qrData} 
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Bottom Group/Ticket Banner */}
          <div className={`h-16 flex items-center justify-center text-lg font-bold tracking-[0.2em] uppercase ${theme.bottom}`}>
            {guest.status !== "approved" ? "Pending" : 
              (badgeTemplate === "Standard Attendee" ? "General Admission" : badgeTemplate)
            }
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
