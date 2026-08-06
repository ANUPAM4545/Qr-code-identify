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

export default function QRSettingsPage() {
  const { event } = useEvent();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${event._id}/qr/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // For demonstration, we just send a generic settings payload. In a real scenario, these would be bound to form state.
        body: JSON.stringify({ defaultFallbackUrl: "https://identify.com", errorCorrection: "Q" })
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Settings saved successfully.");
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 h-full overflow-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Studio Settings</h1>
        <p className="text-muted-foreground mt-1">Configure default behaviors and data retention policies.</p>
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Default Configuration</CardTitle>
            <CardDescription>Set the fallback options when creating new QR codes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Default Fallback URL</Label>
              <Input placeholder="https://identify.com" defaultValue="https://identify.com" />
              <p className="text-xs text-muted-foreground">Used if a dynamic QR code has no destination set.</p>
            </div>
            <div className="space-y-3">
              <Label>Default Error Correction Level</Label>
              <Select defaultValue="Q">
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">L - Low (7%)</SelectItem>
                  <SelectItem value="M">M - Medium (15%)</SelectItem>
                  <SelectItem value="Q">Q - Quartile (25%)</SelectItem>
                  <SelectItem value="H">H - High (30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Manage how scan data is collected and retained.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Collect IP Addresses</Label>
                <p className="text-xs text-muted-foreground">Store the IP address of scanners for location analytics.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track Device Types</Label>
                <p className="text-xs text-muted-foreground">Log whether scans come from iOS, Android, or Desktop.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t py-4 mt-4">
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Preferences"}</Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your QR Studio.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Delete all analytics data</p>
                  <p className="text-xs text-muted-foreground">Permanently wipe all scan history and downloads for this event.</p>
                </div>
                <Button variant="destructive">Clear Analytics</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
