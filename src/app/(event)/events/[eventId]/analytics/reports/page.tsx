"use client";

import { use } from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);

  const handleExport = (type: string) => {
    // In production, this would trigger ReportService job via JobQueue
    // For now we download the mock KPI export
    // eslint-disable-next-line react-compiler/react-compiler
    window.location.href = `/api/events/${eventId}/analytics/export?type=${type}`;
  };

  const reports = [
    { title: "Executive Summary", description: "High-level overview of registration and attendance KPIs.", type: "executive" },
    { title: "Attendance Roster", description: "Complete list of guests and their check-in timestamps.", type: "attendance" },
    { title: "Registration Data", description: "Raw export of all form submissions and custom fields.", type: "registration" },
    { title: "QR Scan Logs", description: "Detailed timestamp log of every QR interaction.", type: "qr" },
    { title: "Scanner Operations", description: "Operator efficiency and offline sync activity logs.", type: "scanner" }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Reports & Exports</h1>
        <p className="text-gray-400">Download raw data and aggregated executive summaries.</p>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.type} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-gray-800 rounded-lg">
                <FileText className="w-5 h-5 text-gray-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{report.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{report.description}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-green-400">
                  <CheckCircle2 className="w-3 h-3" /> Available instantly
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col md:items-end gap-2">
              <Button onClick={() => handleExport(report.type)} variant="outline" className="w-full md:w-auto">
                <Download className="w-4 h-4 mr-2" /> Download CSV
              </Button>
              <Button onClick={() => handleExport(report.type)} variant="ghost" className="w-full md:w-auto text-gray-400 hover:text-white">
                Download JSON
              </Button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
