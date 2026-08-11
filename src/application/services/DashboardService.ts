import clientPromise from "@/infrastructure/db";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";

export class DashboardService {
  
  static async getOverview(eventId: string) {
    const client = await clientPromise;
    const db = client.db();
    
    // Using Promise.all to fetch KPI data in parallel
    const [
      totalRegistrations,
      approvedRegistrations,
      totalGuests,
      checkedInGuests,
      totalScansAgg
    ] = await Promise.all([
      db.collection("registration_submissions").countDocuments({ eventId }),
      db.collection("registration_submissions").countDocuments({ eventId, status: "approved" }),
      db.collection("guests").countDocuments({ eventId, status: { $ne: "archived" } }),
      db.collection("guests").countDocuments({ eventId, "checkIns.direction": "in" }),
      db.collection("qrcodes").aggregate([
        { $match: { eventId } },
        { $group: { _id: null, total: { $sum: "$scanCount" } } }
      ]).toArray()
    ]);

    const totalScans = totalScansAgg[0]?.total || 0;

    return {
      kpis: {
        registrations: {
          value: totalRegistrations,
          pending: totalRegistrations - approvedRegistrations
        },
        guests: {
          value: totalGuests,
          approved: approvedRegistrations
        },
        checkIns: {
          value: checkedInGuests,
          rate: totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0
        },
        scans: {
          value: totalScans
        }
      }
    };
  }

  static async getActivity(eventId: string) {
    const client = await clientPromise;
    const db = client.db();
    
    const activities = await db.collection("audit_logs")
      .find({ "details.eventId": eventId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
      
    return activities.map(a => ({
      id: a._id.toString(),
      actorId: a.userId,
      action: a.action,
      target: a.details.target || a.resourceType,
      timestamp: a.createdAt,
      details: a.details
    }));
  }

  static async getTeam(eventId: string) {
    const client = await clientPromise;
    const db = client.db();
    
    const event = await eventRepository.findById(eventId);
    if (!event) return [];
    
    // Fetch workspace members for the event's workspace
    const members = await db.collection("memberships").aggregate([
      { $match: { workspaceId: event.workspaceId } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { $project: {
        _id: 1,
        userId: 1,
        role: 1,
        name: "$user.name",
        email: "$user.email",
        joinedAt: "$createdAt"
      }}
    ]).toArray();
    
    return members;
  }

  static async getHealth(eventId: string) {
    const client = await clientPromise;
    const db = client.db();
    
    const event = await eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    const [hasQRs, hasGuests, hasRegistrations] = await Promise.all([
      db.collection("qr_codes").findOne({ eventId }),
      db.collection("guests").findOne({ eventId }),
      db.collection("registration_submissions").findOne({ eventId })
    ]);

    const checks = {
      branding: !!event.coverImage,
      qr: !!hasQRs,
      guests: !!hasGuests,
      registration: !!hasRegistrations,
      scanner: true, // Placeholder until scanner configuration is defined
      notifications: false // Placeholder until email templates are defined
    };

    const totalChecks = Object.keys(checks).length;
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    let status = "Needs Attention";
    if (score >= 90) status = "Excellent";
    else if (score >= 70) status = "Good";

    return { score, status, checks };
  }

  static async getProgress(eventId: string) {
    const client = await clientPromise;
    const db = client.db();
    
    const event = await eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    const [totalGuests, checkedInGuests, qrsAssigned, submissions, eventSettings] = await Promise.all([
      db.collection("guests").countDocuments({ eventId, status: { $ne: "archived" } }),
      db.collection("guests").countDocuments({ eventId, "checkIns.direction": "in" }),
      db.collection("guests").countDocuments({ eventId, status: { $ne: "archived" }, qrCodeId: { $exists: true, $ne: null } }),
      db.collection("registration_submissions").aggregate([
        { $match: { eventId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]).toArray(),
      db.collection("event_settings").findOne({ eventId })
    ]);

    const funnelMap: Record<string, number> = { pending: 0, approved: 0, rejected: 0, waitlisted: 0 };
    submissions.forEach(r => { funnelMap[r._id] = r.count; });
    const totalSubmissions = Object.values(funnelMap).reduce((a, b) => a + b, 0);

    const capacity = eventSettings?.maxCapacity || 0;

    return {
      registration: {
        total: totalSubmissions,
        approved: funnelMap.approved || 0,
        pending: funnelMap.pending || 0
      },
      capacity: {
        used: totalGuests,
        max: capacity > 0 ? capacity : "Unlimited"
      },
      checkIns: {
        total: totalGuests,
        checkedIn: checkedInGuests,
        rate: totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0
      },
      qrs: {
        assigned: qrsAssigned,
        rate: totalGuests > 0 ? Math.round((qrsAssigned / totalGuests) * 100) : 0
      }
    };
  }
}
