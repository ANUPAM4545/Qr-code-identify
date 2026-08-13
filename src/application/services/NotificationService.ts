import { EmailService } from "./EmailService";
import { SmsService } from "./SmsService";
import { RealtimeService } from "./RealtimeService";
import { GuestDocument, Event } from "@/domain/types";

export class NotificationService {
  /**
   * Dispatches the Event Badge / Invitation to a guest via Email and SMS.
   * This acts as the coordinator between Email, SMS, and Realtime logging.
   */
  static async sendGuestInvitation(
    workspaceId: string,
    event: Event,
    guest: GuestDocument,
    qrDataString: string,
    attachment?: string,
    customMessage?: string
  ) {
    if (!guest.email && !guest.phone) {
      console.warn(`Guest ${guest._id} has no email or phone. Skipping notification.`);
      return;
    }

    // Usually, the actual URL would be a dynamic route, but for MVP we link to the qrserver image
    const badgeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrDataString)}`;
    const guestName = `${guest.firstName} ${guest.lastName}`;

    const tasks = [];

    if (guest.email) {
      tasks.push(
        EmailService.sendGuestBadge(
          workspaceId,
          event,
          guest.email,
          guestName,
          badgeUrl,
          attachment,
          customMessage
        )
      );
    }

    if (guest.phone) {
      tasks.push(SmsService.sendGuestBadge(workspaceId, event, guest.phone, guestName, badgeUrl));
    }

    // Wait for all dispatches
    await Promise.allSettled(tasks);

    // Notify the Realtime feed (Dashboard)
    await RealtimeService.broadcast(`event_${event._id}`, "notification_sent", {
      type: "guest_badge",
      guestId: guest._id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      channels: [guest.email ? "email" : null, guest.phone ? "sms" : null].filter(Boolean)
    });
  }
}
