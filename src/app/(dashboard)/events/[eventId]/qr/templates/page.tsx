"use client";
import { useEvent } from "@/providers/event-provider";
export default function QRTemplatesPage() {
  const { event } = useEvent();
  return <div className="p-8"><h1>Templates for {event.name}</h1></div>;
}
