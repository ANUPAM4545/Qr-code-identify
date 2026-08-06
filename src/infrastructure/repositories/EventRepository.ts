import { MongoRepository } from "./MongoRepository";
import { Event } from "@/domain/types";

export class EventRepository extends MongoRepository<Event> {
  constructor() {
    super("events");
  }

  async findByWorkspaceId(workspaceId: string): Promise<Event[]> {
    return this.findMany({ workspaceId });
  }
}

export const eventRepository = new EventRepository();
