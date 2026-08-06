"use client";
import { useEvent } from "@/providers/event-provider";
export default function QRSettingsPage() {
  const { event } = useEvent();
  return <div className="p-8"><h1>Settings for {event.name}</h1></div>;
}
