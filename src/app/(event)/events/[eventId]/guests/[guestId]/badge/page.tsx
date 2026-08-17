"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
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
          top: "bg-zinc-950 text-amber-400 border-b-2 border-amber-500/50",
          bottom: "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-zinc-950 font-black",
          bg: "bg-zinc-50",
          text: "text-zinc-950",
          qrBorder: "border-amber-200 bg-white shadow-2xl shadow-amber-900/10 ring-1 ring-amber-500/20",
          accent: "text-amber-600 font-black tracking-widest uppercase",
          pattern: "bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-200/40 via-zinc-50 to-zinc-50"
        };
      case "Speaker":
        return {
          top: "bg-zinc-950 text-fuchsia-400 border-b-2 border-fuchsia-500/50",
          bottom: "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white font-black",
          bg: "bg-zinc-50",
          text: "text-zinc-950",
          qrBorder: "border-fuchsia-200 bg-white shadow-2xl shadow-fuchsia-900/10 ring-1 ring-fuchsia-500/20",
          accent: "text-fuchsia-600 font-black tracking-widest uppercase",
          pattern: "bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-200/40 via-zinc-50 to-zinc-50"
        };
      case "Staff / Volunteer":
        return {
          top: "bg-zinc-950 text-emerald-400 border-b-2 border-emerald-500/50",
          bottom: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-black",
          bg: "bg-zinc-50",
          text: "text-zinc-950",
          qrBorder: "border-emerald-200 bg-white shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-500/20",
          accent: "text-emerald-600 font-black tracking-widest uppercase",
          pattern: "bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-200/40 via-zinc-50 to-zinc-50"
        };
      case "Press / Media":
        return {
          top: "bg-zinc-950 text-blue-400 border-b-2 border-blue-500/50",
          bottom: "bg-gradient-to-r from-blue-500 via-sky-500 to-blue-600 text-white font-black",
          bg: "bg-zinc-50",
          text: "text-zinc-950",
          qrBorder: "border-blue-200 bg-white shadow-2xl shadow-blue-900/10 ring-1 ring-blue-500/20",
          accent: "text-blue-600 font-black tracking-widest uppercase",
          pattern: "bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-200/40 via-zinc-50 to-zinc-50"
        };
      case "Exhibitor":
        return {
          top: "bg-zinc-950 text-orange-400 border-b-2 border-orange-500/50",
          bottom: "bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 text-white font-black",
          bg: "bg-zinc-50",
          text: "text-zinc-950",
          qrBorder: "border-orange-200 bg-white shadow-2xl shadow-orange-900/10 ring-1 ring-orange-500/20",
          accent: "text-orange-600 font-black tracking-widest uppercase",
          pattern: "bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-200/40 via-zinc-50 to-zinc-50"
        };
      case "Sponsor":
        return {
          top: "bg-zinc-950 text-rose-400 border-b-2 border-rose-500/50",
          bottom: "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-black",
          bg: "bg-zinc-50",
          text: "text-zinc-950",
          qrBorder: "border-rose-200 bg-white shadow-2xl shadow-rose-900/10 ring-1 ring-rose-500/20",
          accent: "text-rose-600 font-black tracking-widest uppercase",
          pattern: "bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-200/40 via-zinc-50 to-zinc-50"
        };
      default: // Standard Attendee
        return {
          top: "bg-zinc-950 text-white border-b-2 border-zinc-800",
          bottom: "bg-zinc-900 text-white font-black",
          bg: "bg-zinc-50",
          text: "text-zinc-950",
          qrBorder: "border-zinc-200 bg-white shadow-2xl shadow-zinc-900/5 ring-1 ring-zinc-900/5",
          accent: "text-zinc-500 font-bold tracking-widest uppercase",
          pattern: "bg-zinc-50"
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
              <option>Press / Media</option>
              <option>Exhibitor</option>
              <option>Sponsor</option>
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
          className="bg-white shadow-xl rounded-3xl overflow-hidden flex flex-col relative print:shadow-none print:rounded-none ring-1 ring-black/5"
          style={{ width: '400px', height: '600px' }}
        >
          {/* Top Branding Banner */}
          <div className={`h-28 flex items-center justify-center p-6 relative overflow-hidden ${theme.top}`}>
            {/* Ambient light glow inside banner */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[40px] rounded-full pointer-events-none" />
            <div className="text-3xl font-black tracking-tighter uppercase flex flex-col items-center relative z-10">
              <span className="drop-shadow-md">IDENTIFY</span>
              <span className="text-[10px] font-bold tracking-[0.4em] opacity-80 mt-1">2026</span>
            </div>
          </div>

          {/* Attendee Details */}
          <div className={`flex-1 flex flex-col items-center pt-8 px-6 text-center relative overflow-hidden ${theme.bg} ${theme.pattern}`}>
            <h1 className={`text-4xl font-black tracking-tight leading-[1.1] relative z-10 ${theme.text}`}>
              {guest.firstName}
              <br />
              {guest.lastName}
            </h1>
            
            {guest.organization && (
              <p className={`text-lg mt-4 relative z-10 ${theme.accent}`}>
                {guest.organization}
              </p>
            )}
            
            {guest.title && (
              <p className="text-zinc-500 mt-1 font-medium relative z-10">
                {guest.title}
              </p>
            )}

            {/* Dynamic QR Code */}
            <div className={`mt-auto mb-6 p-4 rounded-3xl border relative z-10 flex flex-col items-center justify-center ${theme.qrBorder}`}>
              <QRCodeSVG 
                value={qrData} 
                size={140}
                level="H"
                includeMargin={false}
              />
              <div className="mt-3 text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                ID: {guestId.substring(0, 8)}
              </div>
            </div>
          </div>

          {/* Bottom Sleek Footer */}
          <div className={`h-12 w-full flex items-center justify-center px-8 text-[10px] font-black tracking-widest uppercase relative overflow-hidden ${theme.bottom}`}>
            <span className="opacity-80">IDENTIFY.COM</span>
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
