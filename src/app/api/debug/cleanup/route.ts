import { NextResponse } from "next/server";
import clientPromise from "@/infrastructure/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const users = await db.collection("users").find().toArray();
    const memberships = await db.collection("memberships").find().toArray();
    const invites = await db.collection("workspace_invites").find().toArray();
    
    return NextResponse.json({ success: true, users, memberships, invites });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
