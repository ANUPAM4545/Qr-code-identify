import { ObjectId } from "mongodb";

export type Role = "owner" | "admin" | "manager" | "member" | "viewer";
export type EventStatus = "draft" | "scheduled" | "published" | "live" | "paused" | "completed" | "archived" | "cancelled";

export interface User {
  _id?: ObjectId | string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string | null;
  organization?: string | null;
  timezone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Workspace {
  _id?: ObjectId | string;
  name: string;
  slug: string;
  logo?: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  _id?: ObjectId | string;
  userId: string;
  workspaceId: string;
  role: Role;
  favoriteEventIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  _id?: ObjectId | string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  templateId?: string | null;
  status: EventStatus;
  venue?: string | null;
  timezone: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventTemplate {
  _id?: ObjectId | string;
  workspaceId?: string | null; // null for system templates
  name: string;
  description: string;
  category: string;
  isSystem: boolean;
  version: number;
  settings?: Partial<EventSettings>;
  branding?: Partial<BrandingSettings>;
  registration?: Partial<RegistrationSettings>;
  scanner?: Partial<ScannerSettings>;
  qr?: Partial<QRConfiguration>;
  guest?: Partial<GuestConfiguration>;
  notification?: Partial<NotificationSettings>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  _id?: ObjectId | string;
  workspaceId: string;
  theme: "system" | "light" | "dark";
  accentColor: string;
  features: string[];
  updatedAt: Date;
}

export interface EventSettings {
  _id?: ObjectId | string;
  eventId: string;
  workspaceId: string;
  isPublic: boolean;
  maxCapacity?: number;
  updatedAt: Date;
}

export interface BrandingSettings {
  _id?: ObjectId | string;
  workspaceId: string;
  eventId?: string;
  primaryColor: string;
  logo?: string | null;
  updatedAt: Date;
}

export interface ScannerSettings {
  _id?: ObjectId | string;
  workspaceId: string;
  eventId?: string;
  offlineEnabled: boolean;
  autoSync: boolean;
  updatedAt: Date;
}

export interface RegistrationSettings {
  _id?: ObjectId | string;
  workspaceId: string;
  eventId?: string;
  requireApproval: boolean;
  allowWaitlist: boolean;
  updatedAt: Date;
}

export interface QRConfiguration {
  _id?: ObjectId | string;
  workspaceId: string;
  eventId?: string;
  style: string;
  fgColor: string;
  bgColor: string;
  updatedAt: Date;
}

export interface GuestConfiguration {
  _id?: ObjectId | string;
  workspaceId: string;
  eventId?: string;
  collectPhone: boolean;
  collectOrganization: boolean;
  customFields: string[];
  updatedAt: Date;
}

export interface NotificationSettings {
  _id?: ObjectId | string;
  workspaceId: string;
  eventId?: string;
  emailAlerts: boolean;
  dailyDigest: boolean;
  webhookUrl?: string | null;
  updatedAt: Date;
}

export interface AuditLog {
  _id?: ObjectId | string;
  workspaceId?: string;
  userId: string;
  action: string;
  details: unknown;
  createdAt: Date;
}

// ==========================================
// Phase 4: QR Design Studio Types
// ==========================================

export type QRStatus = "active" | "draft" | "disabled" | "archived";

export interface QRCodeDesignOptions {
  width?: number;
  height?: number;
  data?: string;
  margin?: number;
  qrOptions?: {
    typeNumber?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40;
    mode?: "Numeric" | "Alphanumeric" | "Byte" | "Kanji";
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  };
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    margin?: number;
    crossOrigin?: string;
  };
  dotsOptions?: {
    type?: "rounded" | "dots" | "classy" | "classy-rounded" | "square" | "extra-rounded";
    color?: string;
    gradient?: {
      type: "linear" | "radial";
      rotation?: number;
      colorStops: Array<{ offset: number; color: string }>;
    };
  };
  backgroundOptions?: {
    color?: string;
    gradient?: {
      type: "linear" | "radial";
      rotation?: number;
      colorStops: Array<{ offset: number; color: string }>;
    };
  };
  cornersSquareOptions?: {
    type?: "dot" | "square" | "extra-rounded";
    color?: string;
  };
  cornersDotOptions?: {
    type?: "dot" | "square";
    color?: string;
  };
  image?: string;
}

export interface QRCodeDocument {
  _id?: ObjectId | string;
  workspaceId: string;
  eventId: string;
  name: string;
  description?: string;
  category?: string;
  destinationUrl?: string; // If static/dynamic
  isDynamic: boolean;
  status: QRStatus;
  design: QRCodeDesignOptions;
  scanCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QRVersion {
  _id?: ObjectId | string;
  qrId: string;
  workspaceId: string;
  eventId: string;
  design: QRCodeDesignOptions;
  authorId: string;
  changeSummary?: string;
  createdAt: Date;
}

export interface QRTemplate {
  _id?: ObjectId | string;
  workspaceId?: string; // null if system template
  name: string;
  description?: string;
  category?: string;
  isSystem: boolean;
  design: QRCodeDesignOptions;
  createdAt: Date;
  updatedAt: Date;
}
