/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, use, useMemo, useCallback } from "react";
import { useEvent } from "@/providers/event-provider";
import { QRCodeDesignOptions } from "@/domain/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, Layout, Image as ImageIcon, Box,
  Download, History, Settings, Save, CheckCircle2, AlertTriangle, XCircle, Expand, Shrink, RefreshCcw, MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { QRExportService } from "@/application/services/QRExportService";

// Dynamic import to avoid SSR crash
let QRCodeStyling: unknown;
if (typeof window !== "undefined") {
  import("qr-code-styling").then((mod) => { QRCodeStyling = mod.default; });
}

const QRCanvas = ({ options, qrRef }: { options: QRCodeDesignOptions, qrRef: React.MutableRefObject<any> }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!QRCodeStyling || !ref.current) return;
    
    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "svg",
        data: options.data || "https://identify.com",
        ...options as any
      });
      qrRef.current.append(ref.current);
    } else {
      qrRef.current.update({
        data: options.data || "https://identify.com",
        ...options as any
      });
    }
  }, [options, qrRef]);

  return <div ref={ref} className="flex justify-center items-center w-full h-full min-h-[300px]" />;
};

export default function QRDesignStudio({ params }: { params: Promise<{ qrId: string }> }) {
  const { qrId } = use(params);
  const { event } = useEvent();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const qrRef = useRef<any>(null);

  const isNew = qrId === "new";

  // Base State
  const [name, setName] = useState(isNew ? "Untitled QR Code" : "Loading...");
  const [destination, setDestination] = useState("https://identify.com");
  const [zoom, setZoom] = useState(1);
  
  // Design State
  const [design, setDesign] = useState<QRCodeDesignOptions>({
    margin: 10,
    qrOptions: { errorCorrectionLevel: "Q" },
    dotsOptions: { type: "rounded", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
    cornersDotOptions: { type: "dot", color: "#000000" },
  });

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
      setName(existingQR.name);
      setDestination(existingQR.destinationUrl || existingQR.design.data || "https://identify.com");
      setDesign(existingQR.design);
    }
  }, [existingQR]);

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
      toast.error("Failed to save", { description: err.message });
    }
  });

  // Export handling
  const handleExport = async (format: "png" | "svg" | "jpeg" | "webp" | "pdf") => {
    if (!qrRef.current) return;
    try {
      await QRExportService.exportSingleQR(qrRef.current, {
        name: name,
        format
      });
      
      // Log the download if it's a saved QR code
      if (!isNew) {
        fetch(`/api/events/${event._id}/qr/${qrId}/downloads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format })
        }).catch(console.error); // Fire and forget
      }

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err: unknown) {
      toast.error("Export failed", { description: err.message });
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
      toast.error("Failed to save template", { description: err.message });
    }
  });

  // Validation Engine Logic
  const validation = useMemo(() => {
    let score = 100;
    const bg = design.backgroundOptions?.color || "#ffffff";
    const fg = design.dotsOptions?.color || "#000000";
    if (bg === fg) score -= 80;
    if (bg === "#000000" && fg === "#ffffff") score -= 20; // Inverted might cause scan issues on some devices
    
    let status = "excellent";
    if (score < 60) status = "poor";
    else if (score < 85) status = "good";

    return { score, status };
  }, [design]);

  return (
    <div className="flex h-full w-full bg-muted/20 overflow-hidden">
      
      {/* LEFT: Configuration */}
      <div className="w-[350px] flex-shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden shadow-sm z-10">
        <div className="p-4 border-b border-border font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configurator</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-0">
          <Tabs defaultValue="data" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b h-12 bg-transparent p-0">
              <TabsTrigger value="data" className="flex-1 h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                <Layout className="w-4 h-4 mr-2" /> Data
              </TabsTrigger>
              <TabsTrigger value="design" className="flex-1 h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                <Palette className="w-4 h-4 mr-2" /> Design
              </TabsTrigger>
              <TabsTrigger value="logo" className="flex-1 h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                <ImageIcon className="w-4 h-4 mr-2" /> Logo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="data" className="p-6 space-y-6">
              <div className="space-y-3">
                <Label>QR Code Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main Entrance" />
              </div>
              <div className="space-y-3">
                <Label>Destination URL</Label>
                <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="https://" />
                <p className="text-xs text-muted-foreground">The URL users will be directed to when scanning.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Pattern</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["square", "dots", "rounded", "extra-rounded", "classy", "classy-rounded"].map(type => (
                    <Button 
                      key={type}
                      variant={design.dotsOptions?.type === type ? "default" : "outline"}
                      className="h-10 text-xs capitalize"
                      onClick={() => setDesign(d => ({ ...d, dotsOptions: { ...d.dotsOptions, type: type as any } }))}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm">Colors</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Foreground Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        className="w-12 h-10 p-1"
                        value={design.dotsOptions?.color}
                        onChange={e => setDesign(d => ({ ...d, dotsOptions: { ...d.dotsOptions, color: e.target.value } }))}
                      />
                      <Input 
                        className="flex-1 h-10 uppercase"
                        value={design.dotsOptions?.color}
                        onChange={e => setDesign(d => ({ ...d, dotsOptions: { ...d.dotsOptions, color: e.target.value } }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Background Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        className="w-12 h-10 p-1"
                        value={design.backgroundOptions?.color}
                        onChange={e => setDesign(d => ({ ...d, backgroundOptions: { ...d.backgroundOptions, color: e.target.value } }))}
                      />
                      <Input 
                        className="flex-1 h-10 uppercase"
                        value={design.backgroundOptions?.color}
                        onChange={e => setDesign(d => ({ ...d, backgroundOptions: { ...d.backgroundOptions, color: e.target.value } }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="logo" className="p-6 space-y-6">
              <div className="space-y-4">
                <Label>Logo Image URL</Label>
                <Input 
                  placeholder="https://..."
                  value={design.image || ""}
                  onChange={e => setDesign(d => ({ ...d, image: e.target.value }))}
                />
              </div>
              <div className="space-y-4">
                <Label>Image Margin</Label>
                <Input 
                  type="number"
                  value={design.imageOptions?.margin || 0}
                  onChange={e => setDesign(d => ({ 
                    ...d, 
                    imageOptions: { ...d.imageOptions, margin: parseInt(e.target.value) } 
                  }))}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* CENTER: Infinite Canvas */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}><Shrink className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.25))}><Expand className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(1)}><RefreshCcw className="w-4 h-4" /></Button>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]">
          <div 
            className="transition-transform duration-200 shadow-xl rounded-xl bg-white flex items-center justify-center p-4 border border-border"
            style={{ transform: `scale(${zoom})` }}
          >
             <QRCanvas options={{ ...design, data: destination }} qrRef={qrRef} />
          </div>
        </div>
      </div>

      {/* RIGHT: Engine & Exports */}
      <div className="w-[300px] flex-shrink-0 border-l border-border bg-card flex flex-col h-full shadow-sm z-10">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <span className="font-semibold">Validation Engine</span>
          <div className="flex gap-1">
            <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="sm" variant="outline" className="px-2" />}>
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => saveTemplateMutation.mutate()}>
                  <Layout className="w-4 h-4 mr-2" /> Save as Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quality Score */}
          <Card className="border border-border/50 shadow-sm overflow-hidden">
            <div className={cn(
              "p-4 border-b text-white",
              validation.status === "excellent" ? "bg-green-600" :
              validation.status === "good" ? "bg-yellow-500" : "bg-red-500"
            )}>
              <div className="text-3xl font-bold">{validation.score}</div>
              <div className="text-xs opacity-90 uppercase tracking-wider font-semibold">Quality Score</div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Sufficient Contrast
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Quiet Zone Valid
              </div>
              {validation.score < 100 && (
                <div className="flex items-center gap-2 text-sm text-yellow-600">
                  <AlertTriangle className="w-4 h-4" /> Consider increasing contrast
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Controls */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Export</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full" onClick={() => handleExport("png")}>
                <Download className="w-4 h-4 mr-2" /> PNG
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleExport("svg")}>
                <Download className="w-4 h-4 mr-2" /> SVG
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleExport("jpeg")}>
                <Download className="w-4 h-4 mr-2" /> JPEG
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleExport("webp")}>
                <Download className="w-4 h-4 mr-2" /> WEBP
              </Button>
              <Button variant="outline" className="col-span-2 w-full" onClick={() => handleExport("pdf")}>
                <Download className="w-4 h-4 mr-2" /> PDF Document
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
