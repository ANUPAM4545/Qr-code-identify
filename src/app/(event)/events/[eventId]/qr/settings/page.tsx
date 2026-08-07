"use client";

import { useEvent } from "@/providers/event-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function QRSettingsPage() {
  const { event } = useEvent();
  const [clearing, setClearing] = useState(false);

  const handleClearAnalytics = async () => {
    if (!confirm("Are you sure you want to permanently delete all scan and download analytics for this event? This action cannot be undone.")) return;
    
    setClearing(true);
    try {
      const res = await fetch(`/api/events/${event._id}/qr/analytics`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to clear analytics");
      }
      toast.success("Analytics cleared successfully.");
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Studio Settings</h1>
        <p className="text-muted-foreground mt-1">Manage data retention and advanced settings.</p>
      </div>

      <div className="space-y-6">
        <Card className="border-destructive/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your QR Studio.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Delete all analytics data</p>
                  <p className="text-xs text-muted-foreground">Permanently wipe all scan history and downloads for this event.</p>
                </div>
                <Button variant="destructive" onClick={handleClearAnalytics} disabled={clearing}>
                  {clearing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {clearing ? "Clearing..." : "Clear Analytics"}
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
