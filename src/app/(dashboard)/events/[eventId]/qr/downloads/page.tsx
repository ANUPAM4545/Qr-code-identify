"use client";
import { useEvent } from "@/providers/event-provider";
export default function QRDownloadsPage() {
  const { event } = useEvent();
  return <div className="p-8"><h1>Downloads for {event.name}</h1></div>;
}
