"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DownloadOptionsModalProps {
  onClose: () => void;
  onDownload: (options: any) => void;
  isDownloading: boolean;
}

export function DownloadOptionsModal({ onClose, onDownload, isDownloading }: DownloadOptionsModalProps) {
  const [format, setFormat] = useState<"pdf_a4" | "pdf_sticker" | "zip">("pdf_a4");
  const [filter, setFilter] = useState("all");
  const [shapeFilter, setShapeFilter] = useState("all");
  const [pdfLayout, setPdfLayout] = useState(32);

  const pdfLayoutOptions = [8, 20, 24, 28, 30, 32];

  const handleDownload = () => {
    onDownload({ format, filter, shapeFilter, pdfLayout });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-xl shadow-2xl shadow-indigo-500/10 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
          <h2 className="text-xl font-bold text-white tracking-tight">Download Options</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          
          <div className="grid grid-cols-2 gap-8">
            {/* Format Column */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">1. FORMAT</Label>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => setFormat("pdf_a4")}
                  className={`w-full justify-start h-10 ${format === "pdf_a4" ? "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-600 hover:text-white" : "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"}`}
                >
                  A4 PDF Document
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setFormat("pdf_sticker")}
                  className={`w-full justify-start h-10 ${format === "pdf_sticker" ? "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-600 hover:text-white" : "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"}`}
                >
                  12"x18" Sticker Sheet (96)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setFormat("zip")}
                  className={`w-full justify-start h-10 ${format === "zip" ? "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-600 hover:text-white" : "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"}`}
                >
                  ZIP Archive
                </Button>
              </div>
            </div>

            {/* Filter Column */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">2. FILTER</Label>
              <div className="space-y-4">
                <Select value={filter} onValueChange={v => setFilter(v || "all")}>
                  <SelectTrigger className="w-full bg-slate-900 border-slate-700 h-10 text-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                    <SelectItem value="all">All Codes</SelectItem>
                    <SelectItem value="published">Published Only</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={shapeFilter} onValueChange={v => setShapeFilter(v || "all")}>
                  <SelectTrigger className="w-full bg-slate-900 border-slate-700 h-10 text-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                    <SelectItem value="all">All Shapes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* PDF Layout */}
          {format.startsWith("pdf") && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">3. PDF LAYOUT (PER PAGE)</Label>
              <div className="grid grid-cols-3 gap-2">
                {pdfLayoutOptions.map((layout) => (
                  <Button
                    key={layout}
                    variant="outline"
                    onClick={() => setPdfLayout(layout)}
                    disabled={format === "pdf_sticker"} // Sticker layout usually has fixed per-page
                    className={`h-9 ${pdfLayout === layout && format !== "pdf_sticker" ? "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-600 hover:text-white" : "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"} ${format === "pdf_sticker" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {layout}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2">
          <Button 
            className="w-full h-12 text-md font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-indigo-900/20"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span>
                Generating...
              </span>
            ) : format === "zip" ? (
              "Generate & Download ZIP"
            ) : (
              "Generate & Download PDF"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
