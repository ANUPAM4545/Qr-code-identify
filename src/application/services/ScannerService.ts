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
    
    // 1. Resolve Guest
    let guestId = payload.guestId;

    if (!guestId && payload.qrData) {
      try {
        const parsed = JSON.parse(payload.qrData);
        if (parsed.guestId) guestId = parsed.guestId;
        else if (parsed.g) guestId = parsed.g;
      } catch {
        // If not JSON, we might need to search by qrCodeId (Phase 4 integration)
        // For this demo, assume the payload resolves to guestId
      }
    }

    if (!guestId) {
      return { success: false, status: "invalid", reason: "Invalid QR Payload: Could not extract Guest ID" };
    }

    const guest = await guestRepository.findById(guestId);
    if (!guest || guest.eventId !== eventId || guest.workspaceId !== workspaceId) {
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

    // 3. Execute Check In via GuestService (which logs Audit and Realtime)
    try {
      await GuestService.checkInGuest(workspaceId, eventId, actorId, guestId, {
        direction,
        method: payload.guestId ? "manual" : "qr_scan",
        location,
        status: "success",
        operatorId: actorId
      });

      // Fetch fresh guest to return
      const updatedGuest = await guestRepository.findById(guestId);

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
}
