"use client";

import { useEvent } from "@/providers/event-provider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { AlertCircle, Mail, Globe } from "lucide-react";

export default function NotificationsPage() {
  const { event } = useEvent();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [event._id]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/events/${event._id}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${event._id}/notifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailAlerts: settings.emailAlerts,
          dailyDigest: settings.dailyDigest,
          webhookUrl: settings.webhookUrl,
        }),
      });

      if (res.ok) {
        toast.success("Notification settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (e) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notification Management</h1>
        <p className="text-muted-foreground">Manage alerts, digests, and event notifications.</p>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px] bg-muted/50 p-1 mb-8">
          <TabsTrigger value="notifications" className="rounded-md">Notifications</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-md">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-0 flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-5 flex items-start gap-4">
              <div className="bg-amber-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-amber-900">Email Provider: Not Configured</h3>
                <p className="text-sm text-amber-700/90">
                  Notification preferences are stored successfully in MongoDB, but production email delivery requires an external email provider configuration.
                </p>
              </div>
            </div>

            <div className="flex-1 bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-border pb-6 mb-8">
                <h2 className="text-2xl font-semibold tracking-tight">Notification Channels</h2>
                <p className="text-muted-foreground">The current status of your notification channels.</p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : settings ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-5 rounded-xl border border-border/50 bg-muted/20">
                    <div className="flex flex-col gap-1">
                      <Label className="text-base font-semibold">Real-time Email Notifications</Label>
                      <span className="text-sm text-muted-foreground">Delivers instant updates to event organizers.</span>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {settings.emailAlerts ? "Configured" : "Not Configured"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 rounded-xl border border-border/50 bg-muted/20">
                    <div className="flex flex-col gap-1">
                      <Label className="text-base font-semibold">Daily Digest</Label>
                      <span className="text-sm text-muted-foreground">Daily event activity summary.</span>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {settings.dailyDigest ? "Enabled" : "Disabled"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 rounded-xl border border-border/50 bg-muted/20">
                    <div className="flex flex-col gap-1">
                      <Label className="text-base font-semibold">Webhook</Label>
                      <span className="text-sm text-muted-foreground">External event notifications server payload.</span>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      {settings.webhookUrl ? "Configured" : "Not Configured"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">Failed to load notification settings.</div>
              )}
            </div>

            <div className="flex-1 bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-border pb-6 mb-8">
                <h2 className="text-2xl font-semibold tracking-tight">Supported Notification Events</h2>
                <p className="text-muted-foreground">Event triggers currently supported by the backend.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium rounded-tl-xl">Event</th>
                      <th className="px-6 py-4 font-medium">Channel</th>
                      <th className="px-6 py-4 font-medium rounded-tr-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">New Registration</td>
                      <td className="px-6 py-4 text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4"/> Email</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">Supported</span></td>
                    </tr>
                    <tr className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">Registration Approved</td>
                      <td className="px-6 py-4 text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4"/> Email</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">Supported</span></td>
                    </tr>
                    <tr className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">Registration Rejected</td>
                      <td className="px-6 py-4 text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4"/> Email</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">Supported</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0 flex flex-col gap-8">
          <div className="flex-1 bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-border pb-6 mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">Notification Configuration</h2>
              <p className="text-muted-foreground">Customize when and how you receive updates.</p>
            </div>

            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : settings ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-5 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-background p-2 rounded-full border border-border/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-base font-semibold">Real-time Email Alerts</Label>
                      <span className="text-sm text-muted-foreground">Get notified instantly when someone registers or checks in.</span>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailAlerts}
                    onCheckedChange={(c) => handleChange("emailAlerts", c)}
                  />
                </div>

                <div className="flex items-center justify-between p-5 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-background p-2 rounded-full border border-border/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-base font-semibold">Daily Digest</Label>
                      <span className="text-sm text-muted-foreground">Receive a daily summary of event activity and statistics.</span>
                    </div>
                  </div>
                  <Switch
                    checked={settings.dailyDigest}
                    onCheckedChange={(c) => handleChange("dailyDigest", c)}
                  />
                </div>

                <div className="flex flex-col gap-3 p-5 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-background p-2 rounded-full border border-border/50">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <Label className="text-base font-semibold" htmlFor="webhook">Webhook URL</Label>
                      <span className="text-sm text-muted-foreground mb-3">Send real-time event payloads to an external server.</span>
                      <Input
                        id="webhook"
                        placeholder="https://your-server.com/webhooks/identify"
                        value={settings.webhookUrl || ""}
                        onChange={(e) => handleChange("webhookUrl", e.target.value)}
                        className="h-10 bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={saveSettings} disabled={saving} size="lg" className="bg-primary text-primary-foreground font-semibold px-8 hover:scale-105 transition-transform">
                    {saving ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Failed to load notification settings.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
