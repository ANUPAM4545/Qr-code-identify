"use client";

import { useState, useRef, useEffect, use, useMemo } from "react";
import { useEvent } from "@/providers/event-provider";
import { QRCodeDesignOptions } from "@/domain/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, Layout, Image as ImageIcon, Box,
  Download, History, Settings, Save, CheckCircle2, AlertTriangle, XCircle
} from "lucide-react";
import { toast } from "sonner";
import QRCodeStyling from "qr-code-styling";
import { cn } from "@/lib/utils";

// Separate generic component for the Canvas to isolate updates
const QRCanvas = ({ options }: { options: QRCodeDesignOptions }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [qrCode] = useState(() => new QRCodeStyling({
    width: 300,
    height: 300,
    type: "svg",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...options as any
  }));

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, [qrCode]);

  useEffect(() => {
    // Optimistically update properties without flickering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    qrCode.update({ ...options as any });
  }, [qrCode, options]);

  return <div ref={ref} className="flex justify-center" />;
};

export default function QRDesignStudio({ params }: { params: Promise<{ qrId: string }> }) {
  const { qrId } = use(params);
  // useEvent() provides event context if needed later
  useEvent();
  
  // Base State
  const [name, setName] = useState(qrId === "new" ? "Untitled QR Code" : "Loading...");
  const [destination, setDestination] = useState("https://identify.com");
  
  // Design State
  const [design, setDesign] = useState<QRCodeDesignOptions>({
    margin: 10,
    qrOptions: { errorCorrectionLevel: "Q" },
    dotsOptions: { type: "rounded", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
    cornersDotOptions: { type: "dot", color: "#000000" },
  });

  const [saving, setSaving] = useState(false);

  // Fake Validation Engine Logic
  const validation = useMemo(() => {
    let score = 100;
    if (design.dotsOptions?.color === "#ffffff") score -= 40;
    
    let status = "excellent";
    if (score < 60) status = "poor";
    else if (score < 85) status = "good";

    return { score, status };
  }, [design]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Endpoint logic...
      toast.success("QR Code Saved", { description: "Version history updated." });
    } catch (err: unknown) {
      toast.error("Failed to save", { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-muted/20 overflow-hidden">
      
      {/* LEFT: Configuration */}
      <div className="w-[350px] flex-shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-border font-semibold flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Configurator</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-3">
            <Label>QR Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-3">
            <Label>Destination URL</Label>
            <Input value={destination} onChange={e => setDestination(e.target.value)} />
          </div>
          
          <Tabs defaultValue="pattern" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pattern" title="Pattern"><Layout className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="colors" title="Colors"><Palette className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="logo" title="Logo"><ImageIcon className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="frame" title="Frame"><Box className="w-4 h-4" /></TabsTrigger>
            </TabsList>
            
            <TabsContent value="pattern" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Dot Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["square", "dots", "rounded", "classy", "extra-rounded"].map((style) => (
                    <Button 
                      key={style}
                      variant={design.dotsOptions?.type === style ? "default" : "outline"}
                      size="sm"
                      className="text-xs capitalize"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onClick={() => setDesign({ ...design, dotsOptions: { ...design.dotsOptions, type: style as any }})}
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="space-y-4 pt-4">
               <div className="space-y-2">
                <Label>Foreground Color</Label>
                <Input 
                  type="color" 
                  value={design.dotsOptions?.color || "#000000"} 
                  onChange={e => setDesign({ ...design, dotsOptions: { ...design.dotsOptions, color: e.target.value }, cornersSquareOptions: { ...design.cornersSquareOptions, color: e.target.value } })} 
                  className="h-10 w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <Input 
                  type="color" 
                  value={design.backgroundOptions?.color || "#ffffff"} 
                  onChange={e => setDesign({ ...design, backgroundOptions: { ...design.backgroundOptions, color: e.target.value }})} 
                  className="h-10 w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="logo" className="space-y-4 pt-4">
              <div className="text-sm text-muted-foreground">Upload a logo to center within the QR code.</div>
              {/* Fake upload */}
              <Button variant="outline" className="w-full">Upload Logo (PNG/SVG)</Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* CENTER: Live Canvas */}
      <div className="flex-1 flex flex-col relative bg-muted/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm z-10">
          <div className="font-medium">{name}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><History className="w-4 h-4 mr-2" /> Versions</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" /> 
              {saving ? "Saving..." : "Save Design"}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 z-10">
           <Card className="p-8 shadow-2xl bg-white border-none rounded-[2rem] transition-all">
             <QRCanvas options={{ ...design, data: destination }} />
           </Card>
        </div>
      </div>

      {/* RIGHT: Inspector */}
      <div className="w-[300px] flex-shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">Inspector</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Validation */}
          <div className="space-y-3">
            <Label>Validation Engine</Label>
            <div className={cn(
              "p-3 rounded-md border text-sm flex items-start gap-3",
              validation.status === "excellent" ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400" :
              validation.status === "good" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
              "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
            )}>
              {validation.status === "excellent" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {validation.status === "good" && <AlertTriangle className="w-5 h-5 shrink-0" />}
              {validation.status === "poor" && <XCircle className="w-5 h-5 shrink-0" />}
              <div>
                <div className="font-semibold capitalize">{validation.status} ({validation.score}/100)</div>
                <div className="opacity-90 mt-1">
                  {validation.status === "excellent" ? "Scan reliability is perfect." : "Adjust contrast or logo size for better scanning."}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Export */}
          <div className="space-y-3">
            <Label>Export Center</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" /> PNG
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" /> SVG
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" /> WEBP
              </Button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
