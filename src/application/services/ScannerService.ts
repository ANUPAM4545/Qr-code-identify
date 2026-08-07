import { guestRepository } from "@/infrastructure/repositories/GuestRepository";
import { GuestService } from "./GuestService";

export interface ScanResult {
  success: boolean;
  status: "success" | "duplicate" | "warning" | "invalid" | "offline_accepted";
  guest?: unknown; // Will type as GuestDocument on UI
  reason?: string;
}

export class ScannerService {
  /**
   * Validates and processes a scan payload (QR Code) or a manual check-in
   */
  static async processScan(
    workspaceId: string,
    eventId: string,
    actorId: string, // Scanner Operator
    payload: {
      qrData?: string;
      guestId?: string; // For manual check-in
    },
    direction: "in" | "out" = "in",
    location?: string
  ): Promise<ScanResult> {
    
    // 1. Resolve ID
    let extractedId = payload.guestId;

    if (!extractedId && payload.qrData) {
      try {
        const parsed = JSON.parse(payload.qrData);
        extractedId = parsed.guestId || parsed.g || parsed.id;
      } catch {
        try {
          const url = new URL(payload.qrData);
          extractedId = url.searchParams.get("guestId") || url.searchParams.get("g") || url.searchParams.get("id") || undefined;
          if (!extractedId) {
            const match = url.pathname.match(/\/q\/([a-zA-Z0-9_-]+)/);
            if (match) {
              extractedId = match[1];
            }
          }
        } catch {
          // If it's not JSON and not a URL, assume the raw string itself might be the guestId
          extractedId = payload.qrData;
        }
      }
    }

    if (!extractedId) {
      return { success: false, status: "invalid", reason: `Invalid QR: Could not extract Guest ID from: ${payload.qrData}` };
    }

    let guest = await guestRepository.findById(extractedId);
    
    // If guest not found by ID, the extracted ID might be a QR shortId or Mongo _id
    if (!guest) {
      const { qrCodeRepository } = await import("@/infrastructure/repositories/QRRepositories");
      let qrCode = null;
      try {
        qrCode = await qrCodeRepository.findById(extractedId);
      } catch {}
      
      if (!qrCode) {
        qrCode = await qrCodeRepository.findOne({ shortId: extractedId, workspaceId, eventId });
      }
      
      if (!qrCode) {
        return { success: false, status: "invalid", reason: "Invalid Ticket: Not found in system" };
      }

      // We found a QR code! Let's check if it's assigned to any guest
      const assignedGuest = await guestRepository.findOne({ qrCodeId: qrCode._id!.toString(), eventId, workspaceId });
      
      if (assignedGuest) {
        // This QR code belongs to a guest, so use this guest!
        guest = assignedGuest;
      } else {
        // Unassigned Bulk Ticket logic
        if (qrCode.status !== ("published" as any) && qrCode.status !== "active") {
          return { success: false, status: "invalid", reason: `Ticket status is ${qrCode.status}` };
        }

        const safeId = qrCode._id?.toString() || qrCode.shortId;

        // Log scan metrics
        await ScannerService.logScanMetrics(safeId, eventId, workspaceId);

        return {
          success: true,
          status: "success",
          guest: { firstName: qrCode.name || "Valid Ticket", lastName: "(Unassigned)" }
        };
      }
    }

    // Now we definitely have a guest object
    const finalGuestId = guest._id!.toString();

    if (guest.eventId !== eventId || guest.workspaceId !== workspaceId) {
      return { success: false, status: "invalid", reason: "Guest not found for this event" };
    }

    // 2. Business Validation
    if (guest.status !== "approved" && guest.status !== "registered") {
      return { 
        success: false, 
        status: "invalid", 
        reason: `Guest status is ${guest.status}. Registration must be approved.`,
        guest 
      };
    }

    const lastCheckIn = guest.checkIns && guest.checkIns.length > 0 
      ? guest.checkIns[guest.checkIns.length - 1] 
      : null;

    if (direction === "in" && lastCheckIn?.direction === "in") {
      return { 
        success: false, 
        status: "duplicate", 
        reason: "Guest is already checked in",
        guest 
      };
    }

    if (direction === "out" && (!lastCheckIn || lastCheckIn.direction === "out")) {
      return { 
        success: false, 
        status: "duplicate", 
        reason: "Guest is already checked out",
        guest 
      };
    }

    // If guest has an assigned QR Code, log its metrics!
    if (guest.qrCodeId) {
      await ScannerService.logScanMetrics(guest.qrCodeId, eventId, workspaceId);
    }

    // 3. Execute Check In via GuestService (which logs Audit and Realtime)
    try {
      await GuestService.checkInGuest(workspaceId, eventId, actorId, finalGuestId, {
        direction,
        method: payload.guestId ? "manual" : "qr_scan",
        location,
        status: "success",
        operatorId: actorId
      });

      // Fetch fresh guest to return
      const updatedGuest = await guestRepository.findById(finalGuestId);

      return {
        success: true,
        status: "success",
        guest: updatedGuest
      };
    } catch (e: unknown) {
      return {
        success: false,
        status: "warning",
        reason: `Failed to record check-in: ${(e as Error).message || String(e)}`,
        guest
      };
    }
  }

  /**
   * Helper to update QR Code scan counts and time-series analytics
   */
  private static async logScanMetrics(qrId: string, eventId: string, workspaceId: string) {
    try {
      const client = await (await import("@/infrastructure/db")).default;
      
      // Update the aggregate analytics (for "Total Scans (All Time)")
      await client.db().collection("qr_analytics").updateOne(
        { qrId },
        { $inc: { totalScans: 1 } },
        { upsert: true }
      );
      
      // Update the QR document itself (for "Scan Count")
      const { qrCodeRepository } = await import("@/infrastructure/repositories/QRRepositories");
      // Find the document either by ID or shortId
      let qrCode = null;
      try {
        qrCode = await qrCodeRepository.findById(qrId);
      } catch {}
      
      if (!qrCode) {
        qrCode = await qrCodeRepository.findOne({ shortId: qrId, workspaceId, eventId });
      }

      if (qrCode && qrCode._id) {
        await qrCodeRepository.update(qrCode._id.toString(), {
          scanCount: (qrCode.scanCount || 0) + 1,
          updatedAt: new Date()
        });
      }

      // Log to qr_scans for time-series charts (Scan Volume Over Time)
      await client.db().collection("qr_scans").insertOne({
        qrId,
        eventId,
        workspaceId,
        device: "Mobile", // Basic mock for the "Device Breakdown" chart
        createdAt: new Date()
      });
    } catch (e) {
      console.error("Failed to log scan metrics:", e);
    }
  }
}
