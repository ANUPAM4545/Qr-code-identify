import { useQuery } from "@tanstack/react-query";

export function useDashboardOverview(eventId: string) {
  return useQuery({
    queryKey: ["dashboard", eventId, "overview"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/dashboard/overview`);
      if (!res.ok) throw new Error("Failed to load overview");
      return res.json();
    }
  });
}

export function useDashboardActivity(eventId: string) {
  return useQuery({
    queryKey: ["dashboard", eventId, "activity"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/dashboard/activity`);
      if (!res.ok) throw new Error("Failed to load activity");
      return res.json();
    }
  });
}

export function useDashboardTeam(eventId: string) {
  return useQuery({
    queryKey: ["dashboard", eventId, "team"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/dashboard/team`);
      if (!res.ok) throw new Error("Failed to load team");
      return res.json();
    }
  });
}

export function useDashboardHealth(eventId: string) {
  return useQuery({
    queryKey: ["dashboard", eventId, "health"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/dashboard/health`);
      if (!res.ok) throw new Error("Failed to load health");
      return res.json();
    }
  });
}

export function useDashboardProgress(eventId: string) {
  return useQuery({
    queryKey: ["dashboard", eventId, "progress"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/dashboard/progress`);
      if (!res.ok) throw new Error("Failed to load progress");
      return res.json();
    }
  });
}
