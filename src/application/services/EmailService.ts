export class EmailService {
  /**
   * Generalized method to send emails via a configured provider (e.g. SendGrid, Resend, AWS SES)
   */
  static async sendEmail(
    _workspaceId: string,
    _to: string,
    _subject: string,
    _html: string
  ): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    // Provider Integration Logic will go here based on workspace settings
    // const provider = await this.getWorkspaceEmailProvider(workspaceId);
    // await provider.send({ to, subject, html });
  }

  static async sendRegistrationConfirmation(workspaceId: string, eventName: string, to: string) {
    await this.sendEmail(
      workspaceId,
      to,
      `Registration Confirmed: ${eventName}`,
      `<p>Your registration for ${eventName} has been received.</p>`
    );
  }

  static async sendApprovalNotification(workspaceId: string, eventName: string, to: string, qrUrl: string) {
    await this.sendEmail(
      workspaceId,
      to,
      `You are approved for ${eventName}!`,
      `<p>Your registration is approved.</p><p>Your Ticket QR: <img src="${qrUrl}" /></p>`
    );
  }

  static async sendRejectionNotification(workspaceId: string, eventName: string, to: string) {
    await this.sendEmail(
      workspaceId,
      to,
      `Update regarding ${eventName}`,
      `<p>Unfortunately, we are unable to approve your registration at this time.</p>`
    );
  }
}
