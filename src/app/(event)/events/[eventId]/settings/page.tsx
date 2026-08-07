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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

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

  const archiveEvent = async () => {
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/events/${event._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: event.workspaceId, status: "archived" })
      });
      if (!res.ok) throw new Error("Failed to archive");
      toast.success("Event archived");
      router.push("/events");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsArchiving(false);
    }
  };

  const deleteEvent = async () => {
    if (!confirm("Are you sure you want to permanently delete this event?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${event._id}?workspaceId=${event.workspaceId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Event deleted");
      router.push("/events");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full p-6 md:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Event Settings</h1>
        <p className="text-muted-foreground">Manage configuration for {event.name}.</p>
      </div>

      <Tabs defaultValue="general" className="w-full flex flex-col gap-6">
        <TabsList className="w-full justify-start h-14 p-1.5 bg-card/50 border border-border/50 rounded-xl overflow-x-auto flex-nowrap backdrop-blur-xl shadow-sm">
          <TabsTrigger value="general" className="rounded-lg px-6 py-2.5 text-sm font-medium">General</TabsTrigger>
          <TabsTrigger value="danger" className="rounded-lg px-6 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 data-[state=active]:text-red-600 data-[state=active]:bg-red-500/10">Danger Zone</TabsTrigger>
        </TabsList>

        <div className="border border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl rounded-2xl p-8 lg:p-12 w-full">
          <TabsContent value="general" className="mt-0 flex flex-col gap-8">
            <div className="flex flex-col gap-2 border-b border-border/50 pb-6">
              <h2 className="text-2xl font-semibold tracking-tight">General Settings</h2>
              <p className="text-muted-foreground">Update your event's primary details and URL slug.</p>
            </div>
            
            <div className="space-y-4 max-w-2xl">
              <Label className="text-sm font-medium text-muted-foreground">Event Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 text-lg bg-background/50 border-border/50 focus-visible:ring-primary/50" />
            </div>
            
            <div className="space-y-4 max-w-2xl">
              <Label className="text-sm font-medium text-muted-foreground">URL Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="h-12 text-lg bg-background/50 border-border/50 focus-visible:ring-primary/50" />
            </div>

            <div className="pt-8">
              <Button onClick={saveGeneral} size="lg" className="bg-primary text-primary-foreground font-semibold px-8 hover:scale-105 transition-transform">Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="danger" className="mt-0 flex flex-col gap-8">
            <div className="flex flex-col gap-2 border-b border-red-500/20 pb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-red-500">Danger Zone</h2>
              <p className="text-red-500/70">Irreversible actions that affect your entire event and its data.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-between p-8 border border-red-500/20 bg-red-500/5 rounded-2xl transition-all hover:bg-red-500/10">
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-red-400">Archive Event</h4>
                <p className="text-base text-muted-foreground">Archived events become read-only and disappear from active lists. Data is preserved.</p>
              </div>
              <Button variant="outline" size="lg" className="text-red-500 border-red-500/50 hover:text-red-400 hover:bg-red-500/20 whitespace-nowrap min-w-[150px] font-semibold" onClick={archiveEvent} disabled={isArchiving || event.status === "archived"}>
                {isArchiving ? "Archiving..." : event.status === "archived" ? "Archived" : "Archive Event"}
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-between p-8 border border-red-500/40 bg-red-500/10 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all hover:shadow-[0_0_40px_rgba(239,68,68,0.25)]">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-red-500">Delete Event</h4>
                <p className="text-base text-red-500/80">Permanently delete this event and all associated guests, QR codes, and analytics. This cannot be undone.</p>
              </div>
              <Button variant="destructive" size="lg" className="whitespace-nowrap shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:scale-105 transition-transform min-w-[150px] font-bold" onClick={deleteEvent} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Event"}
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
