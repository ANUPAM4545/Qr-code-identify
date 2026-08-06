import { eventRepository } from "@/infrastructure/repositories/EventRepository";
import { 
  eventSettingsRepository, 
  scannerSettingsRepository, 
  registrationSettingsRepository, 
  brandingSettingsRepository,
  qrConfigurationRepository,
  guestConfigurationRepository
} from "@/infrastructure/repositories/SettingsRepositories";
import { AuditService } from "./AuditService";

export class EventService {
  static async createEvent(userId: string, workspaceId: string, name: string, slug: string, timezone: string, date: Date, venue?: string) {
    // 1. Create Event
    const event = await eventRepository.create({
      workspaceId,
      name,
      slug,
      timezone,
      date,
      venue,
    });

    const eventId = event._id as string;

    // 2. Provision Default Settings
    await Promise.all([
      eventSettingsRepository.create({
        eventId,
        workspaceId,
        isPublic: false,
      }),
      scannerSettingsRepository.create({
        eventId,
        workspaceId,
        offlineEnabled: true,
        autoSync: true,
      }),
      registrationSettingsRepository.create({
        eventId,
        workspaceId,
        requireApproval: false,
        allowWaitlist: false,
      }),
      brandingSettingsRepository.create({
        eventId,
        workspaceId,
        primaryColor: "#000000",
      }),
      qrConfigurationRepository.create({
        eventId,
        workspaceId,
        style: "squares",
        fgColor: "#000000",
        bgColor: "#ffffff",
      }),
      guestConfigurationRepository.create({
        eventId,
        workspaceId,
        collectPhone: false,
        collectOrganization: false,
        customFields: [],
      })
    ]);

    // 3. Audit Log
    await AuditService.log(userId, "EVENT_CREATED", { name, slug }, workspaceId);

    return event;
  }
}
