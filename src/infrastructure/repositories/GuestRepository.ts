import { MongoRepository } from "./MongoRepository";
import { GuestDocument, GuestGroup } from "@/domain/types";
import { ObjectId, Filter } from "mongodb";

export class GuestRepository extends MongoRepository<GuestDocument> {
  constructor() {
    super("guests");
  }

  async findByEventId(eventId: string, options?: { 
    skip?: number; 
    limit?: number;
    status?: string;
    search?: string;
    groupId?: string;
  }): Promise<{ data: GuestDocument[], total: number }> {
    const filter: Filter<GuestDocument> = { eventId };

    if (options?.status) {
      filter.status = options.status as GuestDocument["status"];
    }
    
    if (options?.groupId) {
      filter.groupIds = options.groupId;
    }

    if (options?.search) {
      filter.$or = [
        { firstName: { $regex: options.search, $options: "i" } },
        { lastName: { $regex: options.search, $options: "i" } },
        { email: { $regex: options.search, $options: "i" } },
        { organization: { $regex: options.search, $options: "i" } }
      ];
    }

    const collection = await this.getCollection();
    
    const cursor = collection.find(filter).sort({ createdAt: -1 });
    
    if (options?.skip !== undefined) cursor.skip(options.skip);
    if (options?.limit !== undefined) cursor.limit(options.limit);
    
    const data = await cursor.toArray() as unknown as GuestDocument[];
    const total = await collection.countDocuments(filter);
    
    return { data, total };
  }

  async insertMany(guests: Omit<GuestDocument, "_id">[]): Promise<string[]> {
    const collection = await this.getCollection();
    const result = await collection.insertMany(guests as unknown as GuestDocument[]);
    return Object.values(result.insertedIds).map(id => id.toString());
  }

  async updateManyStatus(guestIds: string[], status: string): Promise<number> {
    const collection = await this.getCollection();
    const objectIds = guestIds.map(id => new ObjectId(id));
    
    const result = await collection.updateMany(
      { _id: { $in: objectIds } },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      } as unknown as Parameters<typeof collection.updateMany>[1]
    );
    
    return result.modifiedCount;
  }
}

export class GuestGroupRepository extends MongoRepository<GuestGroup> {
  constructor() {
    super("guest_groups");
  }

  async findByEventId(eventId: string): Promise<GuestGroup[]> {
    const collection = await this.getCollection();
    return collection.find({ eventId }).sort({ name: 1 }).toArray() as unknown as GuestGroup[];
  }
}

export const guestRepository = new GuestRepository();
export const guestGroupRepository = new GuestGroupRepository();
