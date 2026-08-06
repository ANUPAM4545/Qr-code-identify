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
