import clientPromise from "@/infrastructure/db";

export class AnalyticsService {
  
  /**
   * Generates high-level KPIs for the Overview Dashboard.
   */
  static async getEventKPIs(eventId: string) {
    const client = await clientPromise;
    const db = client.db();
    
    // Total Registrations
    const totalRegistrations = await db.collection("registration_submissions").countDocuments({ eventId });
    const approvedRegistrations = await db.collection("registration_submissions").countDocuments({ eventId, status: "approved" });
    
    // Total Guests
    const totalGuests = await db.collection("guests").countDocuments({ eventId, status: { $ne: "archived" } });
    
    // Total Check-ins
    // We count guests who have checkIns > 0 (or specifically 'in' direction)
    const checkedInGuests = await db.collection("guests").countDocuments({ 
      eventId, 
      "checkIns.direction": "in" 
    });
    
    // Total QR Scans
    const totalScansAgg = await db.collection("qr_codes").aggregate([
      { $match: { eventId } },
      { $group: { _id: null, total: { $sum: "$scanCount" } } }
    ]).toArray();
    const totalScans = totalScansAgg[0]?.total || 0;

    return {
      totalRegistrations,
      approvedRegistrations,
      totalGuests,
      checkedInGuests,
      attendanceRate: totalGuests > 0 ? (checkedInGuests / totalGuests) * 100 : 0,
      totalScans
    };
  }

  /**
   * Generates a time-series aggregation of Check-ins per hour.
   */
  static async getAttendanceTimeline(eventId: string) {
    const client = await clientPromise;
    const db = client.db();

    // In a production system we might use $dateTrunc or a specific time-bucket approach.
    // For simplicity, we unwind checkIns and group by an hourly format.
    const pipeline = [
      { $match: { eventId } },
      { $unwind: "$checkIns" },
      { $match: { "checkIns.direction": "in", "checkIns.status": "success" } },
      { 
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%dT%H:%M:00Z", date: "$checkIns.timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    const results = await db.collection("guests").aggregate(pipeline).toArray();
    
    return results.map(r => ({
      name: r._id,
      value: r.count
    }));
  }

  /**
   * Generates the Registration Funnel stats.
   */
  static async getRegistrationFunnel(eventId: string) {
    const client = await clientPromise;
    const db = client.db();

    const pipeline = [
      { $match: { eventId } },
      { 
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ];

    const results = await db.collection("registration_submissions").aggregate(pipeline).toArray();
    
    // Format into funnel steps
    const funnelMap: Record<string, number> = { pending: 0, approved: 0, rejected: 0, waitlisted: 0 };
    results.forEach(r => { funnelMap[r._id] = r.count; });

    const totalSubmissions = Object.values(funnelMap).reduce((a, b) => a + b, 0);

    return [
      { name: "Submissions", value: totalSubmissions },
      { name: "Approved", value: funnelMap.approved },
      { name: "Waitlisted", value: funnelMap.waitlisted },
      { name: "Rejected", value: funnelMap.rejected }
    ];
  }

  /**
   * Generates Scanner performance metrics based on Audit Logs.
   */
  static async getScannerMetrics(eventId: string) {
    const client = await clientPromise;
    const db = client.db();

    const pipeline = [
      { $match: { "details.eventId": eventId, action: "GUEST_CHECKED_IN" } },
      {
        $group: {
          _id: "$userId", // Operator
          scans: { $sum: 1 }
        }
      },
      { $sort: { scans: -1 } },
      { $limit: 10 }
    ];

    const results = await db.collection("audit_logs").aggregate(pipeline).toArray();
    
    // Try to fetch operator names if possible
    // Here we just return operator IDs and their scan counts
    return results.map(r => ({
      name: r._id, // Ideally mapped to user name
      value: r.scans
    }));
  }

  /**
   * Generates KPIs specifically for the QR Studio Overview.
   */
  static async getQRKPIs(eventId: string) {
    const client = await clientPromise;
    const db = client.db();
    
    const qrCodes = await db.collection("qr_codes").find({ eventId }).toArray();
    
    const totalQRs = qrCodes.length;
    const activeQRs = qrCodes.filter(q => q.status === "active" || q.status === "published").length;
    const archivedQRs = qrCodes.filter(q => q.status === "archived").length;
    
    const totalScans = qrCodes.reduce((sum, q) => sum + (q.scanCount || 0), 0);
    
    const templates = await db.collection("qr_templates").countDocuments({ 
      $or: [{ workspaceId: qrCodes[0]?.workspaceId }, { isSystem: true }] 
    });

    const downloadsObj = await db.collection("qr_analytics").aggregate([
      { $match: { qrId: { $in: qrCodes.map(q => q._id.toString()) } } },
      { $group: { _id: null, totalDownloads: { $sum: "$totalDownloads" } } }
    ]).toArray();
    
    // totalDownloads is returned directly below
    return {
      totalQRs,
      activeQRs,
      archivedQRs,
      totalScans,
      templates: typeof templates === "number" ? templates : 0,
      totalDownloads: downloadsObj[0]?.totalDownloads || 0,
    };
  }

  /**
   * Generates time-series data for QR scans.
   */
  static async getQRTimeSeries(eventId: string) {
    const client = await clientPromise;
    const db = client.db();
    
    // In a real application, there would be a `qr_scans` collection tracking every redirect.
    // We aggregate over this hypothetical collection to generate the charts.
    const scans = await db.collection("qr_scans").aggregate([
      { $match: { eventId } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          scans: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]).toArray();

    const devices = await db.collection("qr_scans").aggregate([
      { $match: { eventId } },
      { 
        $group: { 
          _id: "$device",
          value: { $sum: 1 } 
        } 
      },
      { $sort: { value: -1 } }
    ]).toArray();

    // Map to the expected format for Recharts
    const scanData = scans.map(s => ({
      name: s._id,
      scans: s.scans
    }));

    const deviceData = devices.map(d => ({
      name: d._id || "Unknown",
      value: d.value
    }));

    // Return empty arrays if no data, the UI will handle it gracefully.
    return {
      scanData: scanData.length > 0 ? scanData : [],
      deviceData: deviceData.length > 0 ? deviceData : []
    };
  }
}
