import { z } from "zod";
import { ObjectId } from "mongodb";

// Define MongoDB schemas using Zod for validation

// User schema
export const userSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email().optional(),
  companyName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  createdAt: z.date().default(() => new Date())
});

export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });

// Scan schema
export const scanSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(),
  name: z.string(),
  networkRange: z.string(),
  scanType: z.enum(["standard", "deep", "solar_focused"]).default("standard"),
  status: z.enum(["pending", "running", "completed", "failed"]).default("pending"),
  totalDevices: z.number().default(0),
  vulnerableDevices: z.number().default(0),
  startTime: z.date().default(() => new Date()),
  endTime: z.date().optional()
});

export const insertScanSchema = scanSchema.omit({ _id: true });

// Device schema
export const deviceSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  scanId: z.string(),
  ipAddress: z.string(),
  macAddress: z.string().optional(),
  hostname: z.string().optional(),
  deviceType: z.string().optional(),
  manufacturer: z.string().optional(),
  os: z.string().optional(),
  firmwareVersion: z.string().optional(),
  isVulnerable: z.boolean().default(false),
  isSolarDevice: z.boolean().default(false),
  openPorts: z.string().optional(), // JSON string
  lastSeen: z.date().default(() => new Date())
});

export const insertDeviceSchema = deviceSchema.omit({ _id: true });

// Vulnerability schema
export const vulnerabilitySchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  deviceId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  cvssScore: z.number().optional(),
  cveId: z.string().optional(),
  affectedComponent: z.string().optional(),
  remediation: z.string().optional(),
  discoveredAt: z.date().default(() => new Date()),
  status: z.enum(["open", "fixed", "in_progress", "ignored"]).default("open")
});

export const insertVulnerabilitySchema = vulnerabilitySchema.omit({ _id: true });

// Threat Intelligence schema
export const threatSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  title: z.string(),
  description: z.string().optional(),
  threatType: z.string().optional(),
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  cveId: z.string().optional(),
  publishedDate: z.date().default(() => new Date()),
  source: z.string().optional(),
  affectedSystems: z.array(z.string()).optional(),
  mitigation: z.string().optional(),
  isRelevantToSolar: z.boolean().default(false),
  isRelevantToIot: z.boolean().default(false)
});

export const insertThreatSchema = threatSchema.omit({ _id: true });

// Solar Assessment schema
export const solarAssessmentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  scanId: z.string(),
  securityScore: z.number().optional(),
  inverterVulnerabilities: z.string().optional(), // JSON string
  monitoringSystemVulnerabilities: z.string().optional(), // JSON string
  communicationProtocolIssues: z.string().optional(), // JSON string
  networkIsolationScore: z.number().optional(),
  authenticationStrength: z.enum(["Weak", "Moderate", "Strong"]).optional(),
  encryptionStatus: z.enum(["Weak", "Moderate", "Strong"]).optional(),
  firmwareStatus: z.enum(["Outdated", "Up-to-date"]).optional(),
  recommendations: z.string().optional(), // JSON string
  createdAt: z.date().default(() => new Date())
});

export const insertSolarAssessmentSchema = solarAssessmentSchema.omit({ _id: true });

// Type definitions
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Scan = z.infer<typeof scanSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type Vulnerability = z.infer<typeof vulnerabilitySchema>;
export type Threat = z.infer<typeof threatSchema>;
export type SolarAssessment = z.infer<typeof solarAssessmentSchema>;
