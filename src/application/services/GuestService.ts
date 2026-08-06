import { guestRepository } from "@/infrastructure/repositories/GuestRepository";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { AuditService } from "./AuditService";
import { QRService } from "./QRService";
import { GuestDocument, CheckInRecord } from "@/domain/types";
import { RealtimeService } from "./RealtimeService";

export class GuestService {
  /**
   * Create a single guest manually or through a public registration form
   */
  static async createGuest(
    workspaceId: string, 
    eventId: string, 
    actorId: string, 
    data: Partial<GuestDocument>
  ): Promise<GuestDocument> {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    const newGuest: Omit<GuestDocument, "_id"> = {
      workspaceId,
      eventId,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email,
      phone: data.phone,
      organization: data.organization,
      title: data.title,
      customData: data.customData || {},
      status: data.status || "pending",
      groupIds: data.groupIds || [],
      tags: data.tags || [],
      checkIns: [],
      notes: data.notes || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const guest = await guestRepository.create(newGuest);
    const guestId = guest._id as string;

    await AuditService.log(
      actorId,
      "GUEST_CREATED",
      { eventId, guestId, status: newGuest.status },
      workspaceId
    );

    return guest!;
  }

  /**
   * Bulk import guests from CSV/Excel payload
   */
  static async importGuests(
    workspaceId: string,
    eventId: string,
    actorId: string,
    guestsData: Partial<GuestDocument>[]
  ): Promise<{ inserted: number }> {
    const guestsToInsert = guestsData.map(data => ({
      workspaceId,
      eventId,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email,
      phone: data.phone,
      organization: data.organization,
      title: data.title,
      customData: data.customData || {},
      status: data.status || "pending",
      groupIds: data.groupIds || [],
      tags: data.tags || [],
      checkIns: [],
      notes: data.notes || "",
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    if (guestsToInsert.length === 0) return { inserted: 0 };

    const ids = await guestRepository.insertMany(guestsToInsert);

    await AuditService.log(
      actorId,
      "GUEST_IMPORTED_BULK",
      { eventId, count: ids.length },
      workspaceId
    );

    return { inserted: ids.length };
  }

  /**
   * Approve a guest, optionally generating their QR Code automatically
   */
  static async approveGuest(
    workspaceId: string,
    eventId: string,
    actorId: string,
    guestId: string,
    generateQR: boolean = true
  ): Promise<void> {
    const guest = await guestRepository.findById(guestId);
    if (!guest) throw new Error("Guest not found");

    if (guest.status === "approved") return; // Idempotent

    const updatePayload: Partial<GuestDocument> = {
      status: "approved",
      updatedAt: new Date()
    };

    // Integration with Phase 4 QR System
    if (generateQR && !guest.qrCodeId) {
      const qrData = JSON.stringify({ guestId: guest._id }); // In a real app, encrypt or use secure token
      const qrCode = await QRService.createQR(actorId, workspaceId, eventId, `Badge: ${guest.firstName} ${guest.lastName}`, {
        data: qrData
      });
      updatePayload.qrCodeId = qrCode._id as string;
    }

    await guestRepository.update(guestId, updatePayload);

    await AuditService.log(
      actorId,
      "GUEST_APPROVED",
      { eventId, guestId, generatedQR: !!updatePayload.qrCodeId },
      workspaceId
    );

    await RealtimeService.notifyGuestUpdated(eventId, guestId, "approved");
  }

  /**
   * Handle a physical check-in from the Scanner
   */
  static async checkInGuest(
    workspaceId: string,
    eventId: string,
    actorId: string, // The operator/scanner user ID
    guestId: string,
    checkInRecord: Omit<CheckInRecord, "timestamp">
  ): Promise<void> {
    const guest = await guestRepository.findById(guestId);
    if (!guest) throw new Error("Guest not found");

    const record: CheckInRecord = {
      ...checkInRecord,
      timestamp: new Date()
    };

    const newCheckIns = [...(guest.checkIns || []), record];

    await guestRepository.update(guestId, {
      checkIns: newCheckIns,
      status: record.direction === "in" ? "checked_in" : "checked_out",
      updatedAt: new Date()
    });

    await AuditService.log(
      actorId,
      `GUEST_CHECKED_${record.direction.toUpperCase()}`,
      { eventId, guestId, method: record.method, location: record.location },
      workspaceId
    );

    await RealtimeService.notifyCheckIn(eventId, guestId, record);
  }
}
