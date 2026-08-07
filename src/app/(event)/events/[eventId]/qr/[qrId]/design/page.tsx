"use client";

import { use, useEffect, useRef, useState } from "react";
import { useEvent } from "@/providers/event-provider";
import { QRCodeDesignOptions } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Save, Layout, Undo2, Redo2, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { QRExportService } from "@/application/services/QRExportService";

// Custom Hooks & Components
import { useHistory } from "@/hooks/use-history";
import { QR_PRESETS } from "./presets";
import { PresetsToolbar } from "./components/PresetsToolbar";
import { ConfiguratorSidebar } from "./components/ConfiguratorSidebar";
import { PreviewPanel } from "./components/PreviewPanel";

const defaultDesign: QRCodeDesignOptions = QR_PRESETS.Default;

export default function QRDesignStudio({ params }: { params: Promise<{ qrId: string }> }) {
  const { qrId } = use(params);
  const { event } = useEvent();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const qrRef = useRef<any>(null);
  const isNew = qrId === "new";

  // Name and Destination (not debounced for history as they are text inputs, 
  // but to keep it simple we'll keep them in standard state for now)
  const { state: name, set: setName, replace: replaceName } = useHistory(isNew ? "Untitled QR Code" : "Loading...");
  const { state: destination, set: setDestination, replace: replaceDestination } = useHistory("https://identify.com");
  
  const [generationMode, setGenerationMode] = useState<"single" | "bulk">("single");
  const [bulkOptions, setBulkOptions] = useState({ quantity: 10, prefix: "QR-", startNumber: 1, padding: 4 });
  
  // Design Options (using history)
  const { 
    state: design, 
    set: setDesign, 
    replace: replaceDesign, 
    undo, 
    redo, 
    reset,
    canUndo, 
    canRedo 
  } = useHistory<QRCodeDesignOptions>(defaultDesign);

  const { data: existingQR, isLoading } = useQuery({
    queryKey: ["qr", event._id, qrId],
    queryFn: async () => {
      if (isNew) return null;
      const res = await fetch(`/api/events/${event._id}/qr/${qrId}`);
      if (!res.ok) throw new Error("Failed to fetch QR");
      return res.json();
    },
    enabled: !isNew
  });

  useEffect(() => {
    if (existingQR) {
      // Initialize without adding to history stack
      replaceName(existingQR.name);
      replaceDestination(existingQR.destinationUrl || existingQR.design.data || "https://identify.com");
      replaceDesign(existingQR.design);
    }
  }, [existingQR, replaceName, replaceDestination, replaceDesign]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        destinationUrl: destination,
        design: { ...design, data: destination },
        isDynamic: true,
        saveVersion: true,
        versionSummary: "Manual Save"
      };

      const url = isNew ? `/api/events/${event._id}/qr` : `/api/events/${event._id}/qr/${qrId}`;
      const method = isNew ? "POST" : "PATCH";

      // If PATCH, payload shape expected by our API is { updates: {...}, saveVersion: true }
      const finalPayload = isNew ? payload : { updates: payload, saveVersion: true, versionSummary: "User Saved" };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload)
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("QR Code Saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["qrs", event._id] });
      if (isNew) {
        router.push(`/events/${event._id}/qr/${data._id}/design`);
      }
    },
    onError: (err: unknown) => {
      toast.error("Failed to save", { description: (err as Error).message || "An error occurred" });
    }
  });

  const handlePublishAndClose = () => {
    saveMutation.mutate(undefined, {
      onSuccess: () => {
        router.push(`/events/${event._id}/qr`);
      }
    });
  };

  const handlePublishAndGetLink = () => {
    saveMutation.mutate(undefined, {
      onSuccess: () => {
        navigator.clipboard.writeText(destination);
        toast.success("Link copied to clipboard!");
      }
    });
  };

  // Export handling
  const handleExport = async (format: "png" | "svg" | "jpeg" | "webp" | "pdf") => {
    if (!qrRef.current) return;
    try {
      await QRExportService.exportSingleQR(qrRef.current, {
        name: name,
        format
      });
      
      if (!isNew) {
        fetch(`/api/events/${event._id}/qr/${qrId}/downloads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format })
        }).catch(console.error); // Fire and forget
      }

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err: unknown) {
      toast.error("Export failed", { description: (err as Error).message || "Export failed" });
    }
  };

  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${event._id}/qr/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Custom Template", description: "Saved from studio", design })
      });
      if (!res.ok) throw new Error("Failed to save template");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Saved as template");
    },
    onError: (err: unknown) => {
      toast.error("Failed to save template", { description: (err as Error).message || "An error occurred" });
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full bg-background overflow-hidden">
      
      {/* Top Application Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm">Design Studio</span>
          
          {/* History Tools */}
          <div className="flex items-center gap-1 border-l border-border pl-4">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={!canUndo}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={!canRedo}>
              <Redo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => reset()} disabled={!canUndo && !canRedo}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/events/${event._id}/qr`)}>
                Cancel
              </Button>
              
              {generationMode === "bulk" ? (
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md shadow-indigo-900/20"
                  onClick={async () => {
                    try {
                      toast.loading("Generating bulk batch...", { id: "bulk-gen" });
                      const res = await fetch(`/api/events/${event._id}/qr/batch`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: name,
                          design: { ...design, data: destination },
                          options: bulkOptions,
                          destinationUrlBase: destination
                        })
                      });
                      if (!res.ok) throw new Error("Failed to generate batch");
                      const data = await res.json();
                      toast.success(`Successfully generated ${data.quantity} QR codes!`, { id: "bulk-gen" });
                      router.push(`/events/${event._id}/qr/batch/${data.batchId}`);
                    } catch (err: any) {
                      toast.error(err.message, { id: "bulk-gen" });
                    }
                  }}
                >
                  Generate Batch
                </Button>
              ) : (
                <>
                  <Button variant="secondary" size="sm" onClick={() => saveMutation.mutate()}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button size="sm" variant="default" disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? "Saving..." : "Publish"}
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handlePublishAndClose}>Publish & Close</DropdownMenuItem>
                      <DropdownMenuItem onClick={handlePublishAndGetLink}>Publish & Get Link</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
      </div>

      <PresetsToolbar onSelectPreset={(p) => setDesign(p)} />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Configurator Accordion */}
        <ConfiguratorSidebar 
          name={name}
          setName={setName}
          destination={destination}
          setDestination={setDestination}
          design={design}
          setDesign={setDesign}
          isNew={isNew}
          onExport={handleExport}
          generationMode={generationMode}
          setGenerationMode={setGenerationMode}
          bulkOptions={bulkOptions}
          setBulkOptions={setBulkOptions}
        />

        {/* CENTER: Live Preview Pane */}
        <PreviewPanel 
          design={design} 
          destination={destination} 
          qrRef={qrRef} 
        />
      </div>
    </div>
  );
}
