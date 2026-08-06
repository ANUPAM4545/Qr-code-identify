"use client";

import { useEvent } from "@/providers/event-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import Link from "next/link";

export default function QRLibraryPage() {
  const { event } = useEvent();

  // Placeholder for DataTable. We can integrate TanStack Table here.
  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Library</h1>
          <p className="text-muted-foreground mt-1">Manage all QR codes, versions, and templates.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
          <Link href={`/events/${event._id}/qr/new/design`}>
            <Button><Plus className="w-4 h-4 mr-2" /> Create QR Code</Button>
          </Link>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 border-border/50 shadow-sm">
        <CardHeader className="py-4 shrink-0 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All QR Codes</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search codes..." className="pl-8 w-[250px] h-9" />
              </div>
              <Button variant="outline" size="sm" className="h-9"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 py-20">
             <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
               <Search className="w-8 h-8 opacity-50" />
             </div>
             <p>No QR codes created yet.</p>
             <Link href={`/events/${event._id}/qr/new/design`}>
               <Button variant="outline">Create your first QR Code</Button>
             </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
