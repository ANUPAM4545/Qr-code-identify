import { NextResponse } from "next/server";
import clientPromise from "@/infrastructure/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const guests = await db.collection("guests").find({}).toArray();
  const qrCodes = await db.collection("qr_codes").find({}).toArray();
  const events = await db.collection("events").find({}).toArray();
  
  return NextResponse.json({ 
    success: true,
    data: {
      guests: guests.map(g => ({ _id: g._id, workspaceId: g.workspaceId, eventId: g.eventId, name: g.firstName })), 
      qrCodes: qrCodes.map(q => ({ _id: q._id, workspaceId: q.workspaceId, scanCount: q.scanCount })),
      events: events.map(e => ({ _id: e._id, workspaceId: e.workspaceId, name: e.name }))
    }
  });
}
