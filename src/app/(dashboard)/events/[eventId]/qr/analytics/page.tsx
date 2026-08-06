"use client";
import { useEvent } from "@/providers/event-provider";
export default function QRAnalyticsPage() {
  const { event } = useEvent();
  return <div className="p-8"><h1>Analytics for {event.name}</h1></div>;
}
