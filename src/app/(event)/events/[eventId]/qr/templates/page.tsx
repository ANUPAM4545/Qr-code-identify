"use client";

import { useEvent } from "@/providers/event-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, PlusCircle, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { QRTemplate } from "@/domain/types";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";

export default function QRTemplatesPage() {
  const { event } = useEvent();
  const router = useRouter();

  const { data: templates, isLoading } = useQuery<QRTemplate[]>({
    queryKey: ["qr-templates", event._id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${event._id}/qr/templates`);
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    }
  });

  const handleApplyTemplate = (templateId: string) => {
    // Navigate to new QR Code with a query param referencing the template
    // The Design Studio page would need to read this and load the template design.
    // For now, we just pass the templateId
    router.push(`/events/${event._id}/qr/new/design?templateId=${templateId}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates Gallery</h1>
          <p className="text-muted-foreground mt-1">Start from pre-designed templates or your saved designs.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {templates?.map((template) => (
            <Card key={template._id as string} className="flex flex-col overflow-hidden hover:border-primary/50 transition-colors">
              <div className="h-32 bg-muted/50 flex items-center justify-center border-b">
                <div className="w-24 h-24 bg-background rounded-xl border shadow-sm flex items-center justify-center p-2">
                   <QRCodeSVG 
                     value="https://identify.app"
                     size={80}
                     fgColor={template.design?.dotsOptions?.color || template.design?.cornersSquareOptions?.color || "#000000"}
                     bgColor={template.design?.backgroundOptions?.color === "transparent" ? "transparent" : (template.design?.backgroundOptions?.color || "#ffffff")}
                     imageSettings={template.design?.image ? {
                       src: template.design.image,
                       height: 20,
                       width: 20,
                       excavate: true
                     } : undefined}
                   />
                </div>
              </div>
              <CardHeader className="py-4 flex-1">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  {template.isSystem && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">System</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2 text-xs">{template.description}</CardDescription>
              </CardHeader>
              <CardFooter className="py-4 border-t bg-muted/20">
                <Button className="w-full" variant="outline" onClick={() => handleApplyTemplate(template._id as string)}>
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          <Card className="flex flex-col overflow-hidden border-dashed bg-transparent hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => router.push(`/events/${event._id}/qr/new/design`)}>
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted-foreground space-y-2">
              <PlusCircle className="w-8 h-8 opacity-50" />
              <div className="text-center">
                <p className="font-medium text-foreground">Blank Canvas</p>
                <p className="text-xs">Start from scratch</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
