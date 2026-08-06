import { qrCodeRepository, qrVersionRepository } from "@/infrastructure/repositories/QRRepositories";
import { AuditService } from "./AuditService";
import { RBACService } from "./RBACService";
import { QRCodeDesignOptions, QRStatus } from "@/domain/types";

export interface GetQROptions {
  status?: QRStatus | QRStatus[];
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class QRService {
  static async createQR(
    userId: string,
    workspaceId: string,
    eventId: string,
    name: string,
    design: QRCodeDesignOptions,
    isDynamic: boolean = true,
    destinationUrl?: string,
    description?: string,
    category?: string
  ) {
    await RBACService.requirePermission(userId, workspaceId, "manager");

    const qr = await qrCodeRepository.create({
      workspaceId,
      eventId,
      name,
      description,
      category,
      destinationUrl,
      isDynamic,
      status: "draft",
      design,
      scanCount: 0,
    });

    const qrId = qr._id as string;

    // Create initial version
    await qrVersionRepository.create({
      qrId,
      workspaceId,
      eventId,
      design,
      authorId: userId,
      changeSummary: "Initial Creation",
    });

    await AuditService.log(userId, "QR_CREATED", { qrId, name }, workspaceId);

    return qr;
  }

  static async updateQR(
    userId: string,
    workspaceId: string,
    eventId: string,
    qrId: string,
    updates: {
      name?: string;
      description?: string;
      category?: string;
      destinationUrl?: string;
      design?: QRCodeDesignOptions;
      status?: QRStatus;
    },
    saveVersion?: boolean,
    versionSummary?: string
  ) {
    await RBACService.requirePermission(userId, workspaceId, "manager");

    const existing = await qrCodeRepository.findById(qrId);
    if (!existing || existing.workspaceId !== workspaceId) {
      throw new Error("QR Code not found");
    }

    const updated = await qrCodeRepository.update(qrId, updates);

    // Save a discrete version only if explicitly requested
    if (saveVersion && updates.design) {
      await qrVersionRepository.create({
        qrId,
        workspaceId,
        eventId,
        design: updates.design,
        authorId: userId,
        changeSummary: versionSummary || "User Saved",
      });
    }

    await AuditService.log(userId, "QR_UPDATED", { qrId, saveVersion }, workspaceId);

    return updated;
  }

  static async getQRCodes(userId: string, workspaceId: string, eventId: string, options: GetQROptions) {
    await RBACService.requirePermission(userId, workspaceId, "viewer");

    const {
      status,
      search,
      category,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { workspaceId, eventId };

    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const client = await (await import("@/infrastructure/db")).default;
    const collection = client.db().collection("qr_codes");

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [qrs, total] = await Promise.all([
      collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query)
    ]);

    return {
      qrs: qrs.map(q => ({ ...q, _id: q._id.toString() })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getQRById(userId: string, workspaceId: string, qrId: string) {
    await RBACService.requirePermission(userId, workspaceId, "viewer");
    const qr = await qrCodeRepository.findById(qrId);
    if (!qr || qr.workspaceId !== workspaceId) throw new Error("QR Code not found");
    return qr;
  }

  static async getVersions(userId: string, workspaceId: string, qrId: string) {
    await RBACService.requirePermission(userId, workspaceId, "viewer");
    const client = await (await import("@/infrastructure/db")).default;
    const versions = await client.db().collection("qr_versions")
      .find({ qrId, workspaceId })
      .sort({ createdAt: -1 })
      .toArray();
    return versions.map(v => ({ ...v, _id: v._id.toString() }));
  }

  static async restoreVersion(userId: string, workspaceId: string, qrId: string, versionId: string) {
    await RBACService.requirePermission(userId, workspaceId, "manager");
    
    const version = await qrVersionRepository.findById(versionId);
    if (!version || version.qrId !== qrId || version.workspaceId !== workspaceId) {
      throw new Error("Version not found");
    }

    await qrCodeRepository.update(qrId, { design: version.design });
    
    // Explicitly log restoring version
    await qrVersionRepository.create({
      qrId,
      workspaceId,
      eventId: version.eventId,
      design: version.design,
      authorId: userId,
      changeSummary: `Restored from version ${versionId}`,
    });

    await AuditService.log(userId, "VERSION_RESTORED", { qrId, versionId }, workspaceId);
    return true;
  }

  static async duplicateQR(userId: string, workspaceId: string, eventId: string, qrId: string) {
    await RBACService.requirePermission(userId, workspaceId, "manager");

    const original = await qrCodeRepository.findById(qrId);
    if (!original || original.workspaceId !== workspaceId) {
      throw new Error("QR Code not found");
    }

    const duplicated = await qrCodeRepository.create({
      workspaceId,
      eventId,
      name: `${original.name} (Copy)`,
      description: original.description,
      category: original.category,
      destinationUrl: original.destinationUrl,
      isDynamic: original.isDynamic,
      status: "draft",
      design: original.design,
      scanCount: 0,
    });

    await AuditService.log(userId, "QR_CREATED", { qrId: duplicated._id, action: "duplicate" }, workspaceId);
    return duplicated;
  }

  static async deleteQR(userId: string, workspaceId: string, qrId: string) {
    await RBACService.requirePermission(userId, workspaceId, "admin");
    
    const qr = await qrCodeRepository.findById(qrId);
    if (!qr || qr.workspaceId !== workspaceId) throw new Error("QR Code not found");

    await qrCodeRepository.delete(qrId);
    await AuditService.log(userId, "QR_DELETED", { qrId }, workspaceId);
    return true;
  }
}
