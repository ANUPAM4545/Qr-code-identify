import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface QueuedScan {
  id: string; // unique scan id (e.g. uuid)
  eventId: string;
  guestId?: string; // Resolved if possible, otherwise rely on qrPayload
  qrPayload: string;
  timestamp: Date;
  scannerId: string;
  operatorId: string;
  method: "manual" | "qr_scan" | "nfc" | "rfid";
  direction: "in" | "out";
  location?: string;
  retryCount: number;
  syncStatus: "pending" | "failed";
  lastError?: string;
}

interface ScannerDB extends DBSchema {
  scans: {
    key: string;
    value: QueuedScan;
    indexes: { "by-event": string; "by-status": string };
  };
}

export class OfflineQueueService {
  private static dbPromise: Promise<IDBPDatabase<ScannerDB>> | null = null;

  private static getDB() {
    if (typeof window === "undefined") return null; // Prevent SSR issues
    
    if (!this.dbPromise) {
      this.dbPromise = openDB<ScannerDB>("IdentityScannerDB", 1, {
        upgrade(db) {
          const store = db.createObjectStore("scans", { keyPath: "id" });
          store.createIndex("by-event", "eventId");
          store.createIndex("by-status", "syncStatus");
        },
      });
    }
    return this.dbPromise;
  }

  static async enqueueScan(scan: QueuedScan): Promise<void> {
    const db = await this.getDB();
    if (!db) return;
    await db.put("scans", scan);
  }

  static async getPendingScans(eventId: string): Promise<QueuedScan[]> {
    const db = await this.getDB();
    if (!db) return [];
    
    // Fallback if index filtering isn't perfect, just get all and filter
    const allScans = await db.getAllFromIndex("scans", "by-event", eventId);
    return allScans.filter(s => s.syncStatus === "pending" || s.syncStatus === "failed");
  }

  static async markScanSynced(scanId: string): Promise<void> {
    const db = await this.getDB();
    if (!db) return;
    await db.delete("scans", scanId);
  }

  static async markScanFailed(scanId: string, error: string): Promise<void> {
    const db = await this.getDB();
    if (!db) return;
    const scan = await db.get("scans", scanId);
    if (scan) {
      scan.syncStatus = "failed";
      scan.retryCount += 1;
      scan.lastError = error;
      await db.put("scans", scan);
    }
  }

  static async clearQueue(eventId: string): Promise<void> {
    const db = await this.getDB();
    if (!db) return;
    const allScans = await db.getAllFromIndex("scans", "by-event", eventId);
    const tx = db.transaction("scans", "readwrite");
    for (const scan of allScans) {
      tx.store.delete(scan.id);
    }
    await tx.done;
  }
}
