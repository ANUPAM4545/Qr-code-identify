import { registrationFormRepository } from "@/infrastructure/repositories/RegistrationFormRepository";
import { registrationSubmissionRepository } from "@/infrastructure/repositories/RegistrationSubmissionRepository";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { eventSettingsRepository } from "@/infrastructure/repositories/SettingsRepositories";
import { GuestService } from "./GuestService";
import { AuditService } from "./AuditService";
import { RealtimeService } from "./RealtimeService";
import { EventNotificationService } from "./EventNotificationService";
import { RegistrationSubmission } from "@/domain/types";

export class RegistrationService {
  
  /**
   * Process a new public registration submission
   */
  static async submitRegistration(
    eventId: string,
    answers: Record<string, unknown>,
    deviceMetadata?: RegistrationSubmission["deviceMetadata"]
  ): Promise<RegistrationSubmission> {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new Error("Event not found");

    const form = await registrationFormRepository.findByEventId(eventId);
    if (!form) throw new Error("Registration form not configured for this event");

    const eventSettings = await eventSettingsRepository.findOne({ eventId });
    const capacity = form.settings.capacity || eventSettings?.maxCapacity;

    // Capacity Check
    if (capacity) {
      const currentCount = await registrationSubmissionRepository.countByEventId(eventId, { status: { $in: ["approved", "pending"] } });
      if (currentCount >= capacity && !form.settings.allowWaitlist) {
        throw new Error("Registration is full");
      }
    }

    const isWaitlisted = capacity 
      ? (await registrationSubmissionRepository.countByEventId(eventId, { status: { $in: ["approved", "pending"] } })) >= capacity 
      : false;

    // Duplicate Check logic would go here (e.g. check duplicate email in submissions)
    
    // Status determination
    let initialStatus: "pending" | "approved" | "waitlisted" = "pending";
    if (isWaitlisted) {
      initialStatus = "waitlisted";
    } else if (form.settings.autoApprove) {
      initialStatus = "approved";
    }

    const submission: Omit<RegistrationSubmission, "_id"> = {
      workspaceId: event.workspaceId,
      eventId,
      formId: form._id as string,
      status: initialStatus,
      answers,
      deviceMetadata,
      submittedAt: new Date()
    };

    const created = await registrationSubmissionRepository.create(submission);

    await AuditService.log(
      "system",
      "REGISTRATION_SUBMITTED",
      { eventId, submissionId: created._id },
      event.workspaceId
    );

    const guestName = `${answers.firstName || ""} ${answers.lastName || ""}`.trim() || (answers.name as string) || (answers.email as string) || "Attendee";
    await EventNotificationService.createNotification({
      eventId,
      workspaceId: event.workspaceId,
      type: "registration",
      title: "New Attendee Registered",
      message: `${guestName} registered for ${event.name}`,
      details: {
        submissionId: created._id,
        status: initialStatus,
        email: answers.email,
        name: guestName,
      },
    });

    await RealtimeService.notifyRegistrationSubmitted(eventId, created);

    // Automation Pipeline
    if (initialStatus === "approved") {
      await this.processApproval(event.workspaceId, eventId, created._id as string, form, created, "system");
    }

    return created;
  }

  /**
   * Approve a pending submission and trigger Guest Provisioning pipeline
   */
  static async approveSubmission(
    workspaceId: string,
    eventId: string,
    submissionId: string,
    actorId: string
  ): Promise<void> {
    const submission = await registrationSubmissionRepository.findById(submissionId);
    if (!submission) throw new Error("Submission not found");
    if (submission.status === "approved") return; // Idempotent

    const form = await registrationFormRepository.findByEventId(eventId);
    if (!form) throw new Error("Form not found");

    await registrationSubmissionRepository.update(submissionId, {
      status: "approved",
      reviewedAt: new Date(),
      reviewedBy: actorId
    });

    await AuditService.log(
      actorId,
      "REGISTRATION_APPROVED",
      { eventId, submissionId },
      workspaceId
    );

    await this.processApproval(workspaceId, eventId, submissionId, form, submission, actorId);
  }

  /**
   * Internal pipeline to create Guest and QR code upon approval
   */
  private static async processApproval(
    workspaceId: string,
    eventId: string,
    submissionId: string,
    form: { settings: { createGuest?: boolean; generateQR?: boolean }; fields: Array<{ id: string; label: string; type: string }> },
    submission: RegistrationSubmission,
    actorId: string
  ) {
    if (!form.settings.createGuest) return;

    // Map answers to Guest model
    // In a real app, form fields would have mapped semantic tags (e.g. isEmail, isFirstName)
    // For now, we best-effort map based on typical field labels or types from answers
    let email = "", firstName = "Guest", lastName = "", phone = "", organization = "", title = "";
    
    for (const field of form.fields) {
      const answer = submission.answers[field.id] as string | undefined;
      if (!answer) continue;
      
      const label = field.label.toLowerCase();
      if (field.type === "email" || label.includes("email")) email = answer;
      else if (field.type === "phone" || label.includes("phone") || label.includes("mobile")) phone = answer;
      else if (label.includes("first")) firstName = answer;
      else if (label.includes("last")) lastName = answer;
      else if (label.includes("org") || label.includes("company")) organization = answer;
      else if (label.includes("role") || label.includes("title") || label.includes("job") || label.includes("position") || label.includes("designation")) title = answer;
    }

    // Direct key fallback for custom form payloads
    for (const [key, val] of Object.entries(submission.answers || {})) {
      if (!val || typeof val !== "string") continue;
      const strVal = val.trim();
      if (!strVal) continue;
      
      const lowerKey = key.toLowerCase();
      if (!phone && (lowerKey.includes("phone") || lowerKey.includes("mobile") || lowerKey.includes("contact") || lowerKey.includes("tel"))) phone = strVal;
      else if (!title && (lowerKey.includes("role") || lowerKey.includes("title") || lowerKey.includes("job") || lowerKey.includes("position") || lowerKey.includes("designation"))) title = strVal;
      else if (!organization && (lowerKey.includes("company") || lowerKey.includes("org") || lowerKey.includes("organization") || lowerKey.includes("business") || lowerKey.includes("corp") || lowerKey.includes("work"))) organization = strVal;
      else if (!email && lowerKey.includes("email")) email = strVal;
    }

    const guest = await GuestService.createGuest(workspaceId, eventId, actorId, {
      firstName,
      lastName,
      email,
      phone,
      organization,
      title,
      customData: submission.answers,
      status: "approved"
    });

    // Link guest back to submission
    await registrationSubmissionRepository.update(submissionId, { guestId: guest._id as string });

    // Generate QR if enabled
    if (form.settings.generateQR) {
      await GuestService.approveGuest(workspaceId, eventId, actorId, guest._id as string, true);
    }
  }

  static async rejectSubmission(
    workspaceId: string,
    eventId: string,
    submissionId: string,
    actorId: string
  ): Promise<void> {
    await registrationSubmissionRepository.update(submissionId, {
      status: "rejected",
      reviewedAt: new Date(),
      reviewedBy: actorId
    });

    await AuditService.log(
      actorId,
      "REGISTRATION_REJECTED",
      { eventId, submissionId },
      workspaceId
    );
  }
  static async waitlistSubmission(
    workspaceId: string,
    eventId: string,
    submissionId: string,
    actorId: string
  ): Promise<void> {
    await registrationSubmissionRepository.update(submissionId, {
      status: "waitlisted",
      reviewedAt: new Date(),
      reviewedBy: actorId
    });

    await AuditService.log(
      actorId,
      "REGISTRATION_WAITLISTED",
      { eventId, submissionId },
      workspaceId
    );
  }
}
