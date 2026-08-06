import crypto from "crypto";
import { webhookRepository } from "@/infrastructure/repositories/WebhookRepository";

export class WebhookService {
  
  static async registerWebhook(workspaceId: string, name: string, endpointUrl: string, events: string[]) {
    // Generate a secure signing secret
    const secret = crypto.randomBytes(24).toString("hex");

    return webhookRepository.create({
      workspaceId,
      name,
      endpointUrl,
      secret,
      events,
      status: "active",
      failureCount: 0
    });
  }

  static async deleteWebhook(webhookId: string) {
    return webhookRepository.delete(webhookId);
  }

  /**
   * Dispatches a webhook payload to all subscribed endpoints for a workspace.
   */
  static async dispatchEvent(workspaceId: string, eventType: string, payload: unknown) {
    const webhooks = await webhookRepository.findByEvent(workspaceId, eventType);
    if (webhooks.length === 0) return;

    const dataString = JSON.stringify({
      event: eventType,
      timestamp: new Date().toISOString(),
      payload
    });

    for (const webhook of webhooks) {
      // Sign the payload
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(dataString)
        .digest("hex");

      try {
        const response = await fetch(webhook.endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Identify-Signature": signature
          },
          body: dataString
        });

        if (response.ok) {
          webhookRepository.update(webhook._id as string, { lastDelivery: new Date(), failureCount: 0 }).catch(() => {});
        } else {
          WebhookService.handleFailure(webhook._id as string, webhook.failureCount);
        }
      } catch (_error) {
        WebhookService.handleFailure(webhook._id as string, webhook.failureCount);
      }
    }
  }

  private static async handleFailure(webhookId: string, currentFailures: number) {
    const newFailures = currentFailures + 1;
    const updates: Record<string, unknown> = { failureCount: newFailures };
    if (newFailures >= 10) {
      updates.status = "failing";
    }
    await webhookRepository.update(webhookId, updates);
  }

}
