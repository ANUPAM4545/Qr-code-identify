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
    if (!slugOrUniqueSlug) return null;
    const raw = slugOrUniqueSlug.trim();
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch {
      // keep raw
    }

    const normalized = decoded.replace(/^\/+|\/+$/g, '');
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(normalized);

    // Cleaned sanitized version (e.g., stripping https://, github.com/, colons, slashes)
    const cleaned = decoded
      .toLowerCase()
      .replace(/^https?[:-]+/i, '')
      .replace(/^(?:www\.)?[^\/]+\//i, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const candidates = Array.from(new Set([raw, decoded, normalized, cleaned].filter(Boolean)));

    const event = await this.findOne({ 
      $or: [
        ...candidates.map(c => ({ uniqueSlug: c })),
        ...candidates.map(c => ({ slug: c })),
        ...(isObjectId ? [{ _id: normalized }] : [])
      ]
    });

    if (event) return event;

    // Fallback: search if any token in the slug matches an event
    const tokens = cleaned.split('-').filter(t => t.length >= 3);
    for (const token of tokens) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const fallback = await this.findOne({
        $or: [
          { uniqueSlug: { $regex: new RegExp(escaped, 'i') } },
          { slug: { $regex: new RegExp(escaped, 'i') } },
          { name: { $regex: new RegExp(escaped, 'i') } }
        ]
      });
      if (fallback) return fallback;
    }

    return null;
  }
}

export const eventRepository = new EventRepository();
