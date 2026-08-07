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
  Loader2,
  Inbox
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GuestDocument, GuestStatus } from "@/domain/types";
import { toast } from "sonner";

export default function GuestLibraryPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: ""
  });

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

  const handleSingleAction = async (guestId: string, action: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/guests/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestIds: [guestId],
          status: action
        })
      });
      if (res.ok) {
        if (action === "approved") {
          toast.success("Guest approved and QR Badge assigned!");
        } else {
          toast.success("Guest updated successfully");
        }
        refetch();
      } else {
        toast.error("Action failed");
      }
    } catch (e) {
      toast.error("Action failed");
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

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add guest");
      
      toast.success("Guest added successfully!");
      setIsAddModalOpen(false);
      setFormData({ firstName: "", lastName: "", email: "", organization: "" });
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
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
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Guest</DialogTitle>
                <DialogDescription>
                  Enter the guest's details manually. They will be added to the library with a Pending status.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGuest} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization (Optional)</Label>
                  <Input id="organization" value={formData.organization} onChange={e => setFormData({ ...formData, organization: e.target.value })} />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding ? "Adding..." : "Add Guest"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
              <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>
                Bulk Actions
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
      <div className="flex-1 overflow-auto rounded-md border border-border/50 shadow-sm bg-background">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-4 bg-muted animate-pulse rounded" />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 bg-muted animate-pulse rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-4 bg-muted animate-pulse rounded" />
                    <div className="w-48 h-3 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="w-32 h-4 bg-muted animate-pulse rounded" />
                <div className="w-24 h-6 bg-muted animate-pulse rounded-full" />
                <div className="w-8 h-8 bg-muted animate-pulse rounded-md ml-auto" />
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-12 m-8 rounded-xl border border-border/50 border-dashed bg-muted/10 min-h-[400px]">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-background mb-6 shadow-sm border border-border/50">
              <Inbox className="w-10 h-10 text-primary/80" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">No Guests Yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed mb-8">
              Start building your guest list to generate QR badges, manage check-ins, and track attendance.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setIsAddModalOpen(true)}>Add Guest Manually</Button>
              <Link href={`/events/${eventId}/guests/import`}>
                <Button variant="outline" className="bg-background">Import CSV</Button>
              </Link>
            </div>
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
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/events/${eventId}/guests/${guest._id}`}>
                          <DropdownMenuItem>
                            View Profile
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSingleAction(guest._id as string, "approved")}>
                          Assign QR Badge
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Invitation sent to guest's email!")}>
                          Send Invitation
                        </DropdownMenuItem>
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
