import { registrationFormRepository } from "@/infrastructure/repositories/RegistrationFormRepository";
import { registrationSubmissionRepository } from "@/infrastructure/repositories/RegistrationSubmissionRepository";
import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { GuestService } from "./GuestService";
import { AuditService } from "./AuditService";
import { RealtimeService } from "./RealtimeService";
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

    // Capacity Check
    if (form.settings.capacity) {
      const currentCount = await registrationSubmissionRepository.countByEventId(eventId, { status: { $in: ["approved", "pending"] } });
      if (currentCount >= form.settings.capacity && !form.settings.allowWaitlist) {
        throw new Error("Registration is full");
      }
    }

    const isWaitlisted = form.settings.capacity 
      ? (await registrationSubmissionRepository.countByEventId(eventId, { status: { $in: ["approved", "pending"] } })) >= form.settings.capacity 
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
    let email = "", firstName = "Guest", lastName = "", phone = "", organization = "";
    
    for (const field of form.fields) {
      const answer = submission.answers[field.id] as string | undefined;
      if (!answer) continue;
      
      const label = field.label.toLowerCase();
      if (field.type === "email" || label.includes("email")) email = answer;
      else if (field.type === "phone" || label.includes("phone")) phone = answer;
      else if (label.includes("first")) firstName = answer;
      else if (label.includes("last")) lastName = answer;
      else if (label.includes("org") || label.includes("company")) organization = answer;
    }

    const guest = await GuestService.createGuest(workspaceId, eventId, actorId, {
      firstName,
      lastName,
      email,
      phone,
      organization,
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
}
