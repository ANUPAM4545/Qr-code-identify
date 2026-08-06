"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StickyNote, Paperclip, Send, Clock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function GuestNotesPage({ params }: { params: Promise<{ eventId: string; guestId: string }> }) {
  const { eventId, guestId } = use(params);
  const [newNote, setNewNote] = useState("");
  
  const { data: guest } = useQuery({
    queryKey: ["guest", eventId, guestId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/guests/${guestId}`);
      const json = await res.json();
      return json.data;
    }
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    // Implementation for adding notes to guest via API would go here.
    // For now, clear the input.
    setNewNote("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <StickyNote className="w-5 h-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Organizer Notes</h2>
          <p className="text-sm text-muted-foreground">Private notes and attachments for your team.</p>
        </div>
      </div>

      {/* Note Input */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <Textarea 
          placeholder="Add a note... Use @ to mention team members."
          className="min-h-[120px] border-0 focus-visible:ring-0 resize-none p-4"
          value={newNote}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
        />
        <div className="bg-muted/30 px-4 py-3 flex items-center justify-between border-t border-border">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Paperclip className="w-4 h-4 mr-2" />
            Attach File
          </Button>
          <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Save Note
          </Button>
        </div>
      </div>

      {/* Existing Notes Feed */}
      <div className="space-y-4 pt-4">
        {guest?.notes ? (
          <div className="bg-card border border-border rounded-lg p-5 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <UserIcon className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">System</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Just now
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{guest.notes}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <StickyNote className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No notes have been added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
