import { MongoRepository } from "./MongoRepository";
import { Event } from "@/domain/types";

export class EventRepository extends MongoRepository<Event> {
  constructor() {
    super("events");
  }

  async findByWorkspaceId(workspaceId: string): Promise<Event[]> {
    return this.findMany({ workspaceId });
  }

  async findBySlug(workspaceId: string, slug: string): Promise<Event | null> {
    return this.findOne({ workspaceId, slug });
  }

  async findByUniqueSlug(slugOrUniqueSlug: string): Promise<Event | null> {
    return this.findOne({ 
      $or: [
        { uniqueSlug: slugOrUniqueSlug },
        { slug: slugOrUniqueSlug }
      ]
    });
  }
}

export const eventRepository = new EventRepository();
