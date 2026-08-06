"use client";

import { use, useEffect, useState } from "react";
import { Loader2, Activity, UserPlus, ScanLine, CheckCircle2 } from "lucide-react";

type LiveEvent = {
  id: string;
  type: 'CHECK_IN' | 'REGISTRATION' | 'SYSTEM';
  message: string;
  timestamp: Date;
};

export default function LiveMonitorPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    // In a real implementation, this would connect to RealtimeService (Socket.IO).
    // For now, we simulate an incoming stream of events for the Live Monitor.
    
    const mockEvents: LiveEvent[] = [
      { id: "1", type: "SYSTEM", message: "Live Monitor initialized", timestamp: new Date() }
    ];
    setEvents([...mockEvents]);

    const interval = setInterval(() => {
      const types: ('CHECK_IN' | 'REGISTRATION')[] = ['CHECK_IN', 'REGISTRATION'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const newEvent: LiveEvent = {
        id: Math.random().toString(),
        type,
        message: type === 'CHECK_IN' ? "Guest Jane Doe was checked in at Main Entrance." : "New VIP Registration submitted.",
        timestamp: new Date()
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
    }, 5000);

    return () => clearInterval(interval);
  }, [eventId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'CHECK_IN': return <ScanLine className="w-5 h-5 text-green-400" />;
      case 'REGISTRATION': return <UserPlus className="w-5 h-5 text-blue-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 h-full flex flex-col">
      
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
            Live Monitor 
            <span className="ml-4 flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </h1>
          <p className="text-gray-400">Real-time stream of all activity inside the event.</p>
        </div>
      </div>

      <div className="flex-1 bg-black border border-gray-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
          <h3 className="font-medium flex items-center">
            <Activity className="w-4 h-4 mr-2 text-gray-400" /> Event Stream
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {events.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            events.map(ev => (
              <div key={ev.id} className="flex items-start p-4 bg-gray-900/30 border border-gray-800/50 rounded-lg animate-in fade-in slide-in-from-top-4">
                <div className="mt-1 mr-4">
                  {getIcon(ev.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-200">{ev.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{ev.timestamp.toLocaleTimeString()}</p>
                </div>
                <div className="ml-4">
                  <CheckCircle2 className="w-4 h-4 text-gray-700" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
