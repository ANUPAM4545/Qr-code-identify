"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  BadgeAlert,
  Loader2
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
import { Badge } from "@/components/ui/badge";
import { GuestDocument, GuestStatus } from "@/domain/types";
import { toast } from "sonner";

export default function GuestLibraryPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["guests", eventId, search, statusFilter],
    queryFn: async () => {
      const url = new URL(`/api/events/${eventId}/guests`, window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      
      const res = await fetch(url.toString());
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as GuestDocument[];
    }
  });

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedGuests);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedGuests(newSet);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedGuests.size === 0) return;
    try {
      const res = await fetch(`/api/events/${eventId}/guests/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestIds: Array.from(selectedGuests),
          status: action
        })
      });
      if (res.ok) {
        toast.success(`Successfully updated ${selectedGuests.size} guests`);
        setSelectedGuests(new Set());
        refetch();
      }
    } catch (e) {
      toast.error("Bulk action failed");
    }
  };

  const StatusBadge = ({ status }: { status: GuestStatus }) => {
    const styles = {
      approved: "bg-green-500/10 text-green-600 dark:text-green-400",
      pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
      checked_in: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      default: "bg-muted text-muted-foreground"
    };
    const style = styles[status as keyof typeof styles] || styles.default;
    
    return (
      <Badge variant="outline" className={`capitalize ${style} border-transparent`}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guest Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your attendee lifecycle and registration data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/events/${eventId}/guests/import`}>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Guests
            </Button>
          </Link>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or company..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 border-dashed">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <select 
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="checked_in">Checked In</option>
            </select>
          </div>
        </div>

        {selectedGuests.size > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
            <span className="text-sm font-medium px-2">
              {selectedGuests.size} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="secondary" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("approved")}>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Approve All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("rejected")}>
                  <XCircle className="w-4 h-4 mr-2 text-red-500" /> Reject All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" /> Export Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No guests found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Get started by importing your guest list or adding attendees manually.
            </p>
            <Link href={`/events/${eventId}/guests/import`} className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
              Import from CSV
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGuests(new Set(data.map(g => g._id as string)));
                      } else {
                        setSelectedGuests(new Set());
                      }
                    }}
                    checked={selectedGuests.size === data.length && data.length > 0}
                  />
                </th>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Check-ins</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((guest) => (
                <tr 
                  key={guest._id as string} 
                  className={`hover:bg-muted/30 transition-colors ${selectedGuests.has(guest._id as string) ? 'bg-primary/5' : ''}`}
                >
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedGuests.has(guest._id as string)}
                      onChange={() => toggleSelect(guest._id as string)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-medium text-secondary-foreground shrink-0">
                        {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {guest.firstName} {guest.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{guest.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {guest.organization || "-"}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={guest.status} />
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {guest.checkIns?.length || 0}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/events/${eventId}/guests/${guest._id}`}>
                          <DropdownMenuItem>
                            View Profile
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Assign QR Badge</DropdownMenuItem>
                        <DropdownMenuItem>Send Invitation</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
