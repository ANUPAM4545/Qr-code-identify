import nodemailer from 'nodemailer';
import { Event } from "@/domain/types";

export class EmailService {
  /**
   * Generalized method to send emails via a configured provider (e.g. SendGrid, Resend, AWS SES)
   */
  static async sendEmail(
    _workspaceId: string,
    to: string,
    subject: string,
    html: string,
    attachments?: Array<{ filename: string; path?: string; content?: string | Buffer }>
  ): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP_USER and SMTP_PASS are not set. Falling back to mock email logging.");
      console.log(`[EMAIL_MOCK] To: ${to}, Subject: ${subject}`);
      if (attachments && attachments.length > 0) {
        console.log(`[EMAIL_MOCK] Includes ${attachments.length} attachment(s)`);
      }
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"Identify Event System" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments,
      });
      console.log(`[EMAIL_SENT] Successfully sent email to ${to}`);
    } catch (error) {
      console.error(`[EMAIL_ERROR] Failed to send email to ${to}:`, error);
    }
  }

  static async sendWorkspaceInvite(workspaceId: string, to: string, role: string, token: string) {
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    // We should create a proper accept link. Since we didn't build a dedicated UI page to accept the invite
    // (we just have an API route right now), we should probably make an API GET route that accepts it
    // and redirects to the dashboard, OR just send them a link to the dashboard where the UI will process the token.
    // Let's create an accept link that points to an API route which will accept the invite and redirect to dashboard.
    // Wait, the API route is POST. We can make a GET route to handle the link click in the email.
    const inviteLink = `${appUrl}/api/invites/${token}/accept-email`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited!</h2>
        <p>You have been invited to join a workspace as a <strong>${role}</strong>.</p>
        <p>Click the button below to accept the invitation and join the team:</p>
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    `;

    await this.sendEmail(
      workspaceId,
      to,
      "You have been invited to join a Workspace",
      html
    );
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

  static async sendGuestBadge(workspaceId: string, event: Event, to: string, guestName: string, badgeUrl: string, attachment?: string, customMessage?: string) {
    const formattedName = guestName.includes(' ') 
      ? guestName.split(' ').join('<br />') 
      : guestName;

    const eventDate = event.date ? new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(event.date)) : 'TBD';
    const eventVenue = event.venue || 'TBD';
    const messageBody = customMessage ? customMessage.replace(/\n/g, '<br />') : `You have been successfully registered for <strong>${event.name}</strong>. Please find your check-in badge attached to this email as a PDF.`;

    const html = `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <div style="background-color: #0f172a; padding: 24px 32px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">${event.name}</h2>
          </div>
          
          <div style="padding: 32px;">
            <p style="color: #0f172a; font-size: 18px; margin-top: 0;">Hi ${guestName},</p>
            
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              ${messageBody}
            </p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">Event Details</h3>
              <p style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;"><strong>Date:</strong> ${eventDate}</p>
              <p style="margin: 0; color: #0f172a; font-size: 15px;"><strong>Venue:</strong> ${eventVenue}</p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
              If you have any questions, please contact the event organizer.<br />
              We look forward to seeing you there!
            </p>
          </div>
          
        </div>
      </div>
    `;
    
    const emailAttachments = [];
    if (attachment) {
      // attachment is a data url like 'data:image/png;base64,...' or 'data:application/pdf;base64,...'
      const base64Data = attachment.split(',')[1];
      const isPdf = attachment.startsWith('data:application/pdf');
      if (base64Data) {
        emailAttachments.push({
          filename: `Your_CheckIn_Badge.${isPdf ? 'pdf' : 'png'}`,
          content: Buffer.from(base64Data, 'base64')
        });
      }
    }

    await this.sendEmail(
      workspaceId,
      to,
      `Your Check-in Badge for ${event.name}`,
      html,
      emailAttachments
    );
  }
}
