import { Event } from "@/domain/types";

export class SmsService {
  /**
   * Generalized method to send SMS messages via a configured provider (e.g. Twilio, AWS SNS)
   */
  static async sendSms(
    _workspaceId: string,
    _to: string,
    _message: string
  ): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      // In development, just log the payload to console to simulate sending
      console.log(`[SMS_MOCK] Sending to ${_to}: ${_message}`);
      return;
    }

    // Provider Integration Logic will go here based on workspace settings
    // const provider = await this.getWorkspaceSmsProvider(workspaceId);
    // await provider.send({ to, message });
  }

  static async sendGuestBadge(workspaceId: string, event: Event, to: string, guestName: string, badgeUrl: string) {
    const message = `Hi ${guestName}, welcome to ${event.name}! Here is your unique QR check-in badge: ${badgeUrl}`;
    await this.sendSms(workspaceId, to, message);
  }
}
