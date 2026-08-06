"use client";

import { createContext, useContext, ReactNode, useState } from "react";

interface Event {
  id: string;
  name: string;
  workspaceId: string;
}

interface EventContextType {
  activeEvent: Event | null;
  setActiveEvent: (event: Event | null) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  return (
    <EventContext.Provider value={{ activeEvent, setActiveEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
}
