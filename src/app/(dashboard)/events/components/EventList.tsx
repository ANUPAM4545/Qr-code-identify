"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Copy, 
  Archive, 
  Calendar,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Event } from "@/domain/types";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loading-state";

interface EventListProps {
  workspaceId: string;
}

export function EventList({ workspaceId }: EventListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const fetchEvents = async () => {
    const params = new URLSearchParams({
      workspaceId,
      page: page.toString(),
      limit: "12",
    });
    if (search) params.append("search", search);
    if (statusFilter) params.append("status", statusFilter);
    
    const res = await fetch(`/api/events?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["events", workspaceId, search, statusFilter, page],
    queryFn: fetchEvents,
  });



  const actionMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async ({ eventId, action, payload }: { eventId: string, action: string, payload?: any }) => {
      const res = await fetch(`/api/events/${eventId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, action, payload }),
      });
      if (!res.ok) throw new Error(`Failed to ${action} event`);
    },
    onSuccess: (_, variables) => {
      toast.success(`Event ${variables.action}d successfully`);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    }
  });

  if (error) {
    return <div className="text-red-500">Error loading events: {(error as Error).message}</div>;
  }

  const events: Event[] = data?.data?.events || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-9 bg-background w-full"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full sm:w-auto text-sm font-medium">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter ? `Status: ${statusFilter}` : "All Statuses"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setStatusFilter(""); setPage(1); }}>All Statuses</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setStatusFilter("draft"); setPage(1); }}>Draft</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter("published"); setPage(1); }}>Published</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter("archived"); setPage(1); }}>Archived</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button nativeButton={false} render={<Link href="/events/create" />}>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingState text="Loading events..." />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 border-dashed bg-background/50 p-12 text-center h-[300px]">
          <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No events found</h2>
          <p className="text-muted-foreground mb-6">Create an event to get started.</p>
          <Button nativeButton={false} render={<Link href="/events/create" />} variant="outline">
            Create Event
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <div 
                key={event._id as string} 
                className="group relative flex flex-col rounded-xl border border-border/50 bg-background overflow-hidden hover:border-foreground/20 transition-all hover:shadow-md"
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-xs px-2 py-0.5 rounded-full border border-border/50 bg-muted/50 font-medium capitalize">
                      {event.status}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/events/${event._id}`)}>
                          View Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => actionMutation.mutate({ 
                          eventId: event._id as string, 
                          action: "duplicate",
                          payload: {
                            name: `${event.name} (Copy)`,
                            slug: `${event.slug}-copy-${Math.floor(Math.random() * 10000)}`,
                            date: event.date
                          }
                        })}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => actionMutation.mutate({ eventId: event._id as string, action: event.status === "archived" ? "restore" : "archive" })}
                        >
                          <Archive className="mr-2 h-4 w-4" /> {event.status === "archived" ? "Restore" : "Archive"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <Link href={`/events/${event._id}`}>
                    <h3 className="font-semibold text-lg mb-1 truncate group-hover:underline underline-offset-4">{event.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-4">
                    {event.description || "No description provided."}
                  </p>
                  
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="truncate">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm font-medium">Page {page} of {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
