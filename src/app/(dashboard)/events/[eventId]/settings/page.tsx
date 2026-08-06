"use client";

import { useEvent } from "@/providers/event-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventSettingsPage() {
  const { event } = useEvent();
  const router = useRouter();
  const [name, setName] = useState(event.name);
  const [slug, setSlug] = useState(event.slug);

  const saveGeneral = async () => {
    const res = await fetch(`/api/events/${event._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: event.workspaceId, name, slug })
    });
    if (res.ok) {
      toast.success("Settings saved");
      router.refresh();
    } else {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Settings</h1>
        <p className="text-muted-foreground mt-1">Manage configuration for {event.name}.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg overflow-x-auto flex-nowrap">
          <TabsTrigger value="general" className="rounded-md">General</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-md">Branding</TabsTrigger>
          <TabsTrigger value="registration" className="rounded-md">Registration</TabsTrigger>
          <TabsTrigger value="scanner" className="rounded-md">Scanner</TabsTrigger>
          <TabsTrigger value="danger" className="rounded-md text-red-500 hover:text-red-600 data-[state=active]:text-red-600">Danger Zone</TabsTrigger>
        </TabsList>

        <div className="mt-6 border border-border/50 bg-background rounded-xl p-6">
          <TabsContent value="general" className="mt-0 flex flex-col gap-6">
            <h2 className="text-xl font-semibold tracking-tight border-b border-border/50 pb-4">General Settings</h2>
            
            <div className="space-y-2 max-w-md">
              <Label>Event Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            
            <div className="space-y-2 max-w-md">
              <Label>URL Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>

            <div className="pt-4">
              <Button onClick={saveGeneral}>Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="mt-0">
            <h2 className="text-xl font-semibold tracking-tight border-b border-border/50 pb-4">Branding</h2>
            <p className="text-muted-foreground mt-4">Manage event-specific logos and colors here.</p>
          </TabsContent>

          <TabsContent value="registration" className="mt-0">
            <h2 className="text-xl font-semibold tracking-tight border-b border-border/50 pb-4">Registration</h2>
            <p className="text-muted-foreground mt-4">Configure approvals and waitlists here.</p>
          </TabsContent>

          <TabsContent value="scanner" className="mt-0">
            <h2 className="text-xl font-semibold tracking-tight border-b border-border/50 pb-4">Scanner</h2>
            <p className="text-muted-foreground mt-4">Configure offline mode and auto-sync here.</p>
          </TabsContent>

          <TabsContent value="danger" className="mt-0 flex flex-col gap-6">
            <h2 className="text-xl font-semibold tracking-tight border-b border-border/50 pb-4 text-red-500">Danger Zone</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 border border-red-200/20 bg-red-500/5 rounded-lg">
              <div>
                <h4 className="font-semibold text-red-500">Archive Event</h4>
                <p className="text-sm text-muted-foreground mt-1">Archived events become read-only and disappear from active lists.</p>
              </div>
              <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 whitespace-nowrap">Archive Event</Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 border border-red-500/50 bg-red-500/10 rounded-lg">
              <div>
                <h4 className="font-semibold text-red-600">Delete Event</h4>
                <p className="text-sm text-muted-foreground mt-1">Permanently delete this event and all associated data. This cannot be undone.</p>
              </div>
              <Button variant="destructive" className="whitespace-nowrap">Delete Event</Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
