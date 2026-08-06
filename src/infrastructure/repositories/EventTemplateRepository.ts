import { MongoRepository } from "./MongoRepository";
import { EventTemplate } from "@/domain/types";

export class EventTemplateRepository extends MongoRepository<EventTemplate> {
  constructor() {
    super("event_templates");
  }

  async findSystemTemplates(): Promise<EventTemplate[]> {
    const collection = await this.getCollection();
    return collection.find({ isSystem: true }).toArray() as unknown as Promise<EventTemplate[]>;
  }

  async findByWorkspaceId(workspaceId: string): Promise<EventTemplate[]> {
    const collection = await this.getCollection();
    return collection.find({ workspaceId }).toArray() as unknown as Promise<EventTemplate[]>;
  }
}

export const eventTemplateRepository = new EventTemplateRepository();
