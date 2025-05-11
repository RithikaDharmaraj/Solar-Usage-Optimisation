import { 
  type User, type InsertUser, 
  type Scan, type Device, 
  type Vulnerability, type Threat, 
  type SolarAssessment 
} from "@shared/schema";
import { getCollection, checkConnection } from "./db";
import { ObjectId } from "mongodb";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
  
  // Scan methods
  createScan(scan: Omit<Scan, "_id">): Promise<Scan>;
  getScan(id: string): Promise<Scan | undefined>;
  getScansByUserId(userId: string): Promise<Scan[]>;
  updateScanStatus(id: string, status: "pending" | "running" | "completed" | "failed", endTime?: Date): Promise<boolean>;
  
  // Device methods
  createDevice(device: Omit<Device, "_id">): Promise<Device>;
  getDevicesByScanId(scanId: string): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  
  // Vulnerability methods
  createVulnerability(vulnerability: Omit<Vulnerability, "_id">): Promise<Vulnerability>;
  getVulnerabilitiesByDeviceId(deviceId: string): Promise<Vulnerability[]>;
  
  // Threat Intelligence methods
  createThreat(threat: Omit<Threat, "_id">): Promise<Threat>;
  getThreats(limit?: number): Promise<Threat[]>;
  
  // Solar Assessment methods
  createSolarAssessment(assessment: Omit<SolarAssessment, "_id">): Promise<SolarAssessment>;
  getSolarAssessmentByScanId(scanId: string): Promise<SolarAssessment | undefined>;
  
  // Dashboard methods
  getDashboardStats(userId: string): Promise<any>;
}

export class MongoDBStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const collection = await getCollection('users');
      const user = await collection.findOne({ _id: new ObjectId(id) });
      return user as User | undefined;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const collection = await getCollection('users');
      const user = await collection.findOne({ username });
      return user as User | undefined;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const collection = await getCollection('users');
      const userToInsert = {
        ...insertUser,
        createdAt: new Date()
      };
      const result = await collection.insertOne(userToInsert);
      return {
        ...userToInsert,
        _id: result.insertedId
      } as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    try {
      const collection = await getCollection('users');
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: userData },
        { returnDocument: 'after' }
      );
      return result as User | undefined;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  // Scan methods
  async createScan(scan: Omit<Scan, "_id">): Promise<Scan> {
    try {
      const collection = await getCollection('scans');
      const result = await collection.insertOne(scan);
      return {
        ...scan,
        _id: result.insertedId
      } as Scan;
    } catch (error) {
      console.error("Error creating scan:", error);
      throw error;
    }
  }

  async getScan(id: string): Promise<Scan | undefined> {
    try {
      const collection = await getCollection('scans');
      const scan = await collection.findOne({ _id: new ObjectId(id) });
      return scan as Scan | undefined;
    } catch (error) {
      console.error("Error fetching scan:", error);
      return undefined;
    }
  }

  async getScansByUserId(userId: string): Promise<Scan[]> {
    try {
      const collection = await getCollection('scans');
      const scans = await collection.find({ userId }).sort({ startTime: -1 }).toArray();
      return scans as Scan[];
    } catch (error) {
      console.error("Error fetching scans by user ID:", error);
      return [];
    }
  }

  async updateScanStatus(id: string, status: "pending" | "running" | "completed" | "failed", endTime?: Date): Promise<boolean> {
    try {
      const collection = await getCollection('scans');
      const updateData: any = { status };
      if (endTime) {
        updateData.endTime = endTime;
      }
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error updating scan status:", error);
      return false;
    }
  }

  // Device methods
  async createDevice(device: Omit<Device, "_id">): Promise<Device> {
    try {
      const collection = await getCollection('devices');
      const result = await collection.insertOne(device);
      return {
        ...device,
        _id: result.insertedId
      } as Device;
    } catch (error) {
      console.error("Error creating device:", error);
      throw error;
    }
  }

  async getDevicesByScanId(scanId: string): Promise<Device[]> {
    try {
      const collection = await getCollection('devices');
      const devices = await collection.find({ scanId }).toArray();
      return devices as Device[];
    } catch (error) {
      console.error("Error fetching devices by scan ID:", error);
      return [];
    }
  }

  async getDevice(id: string): Promise<Device | undefined> {
    try {
      const collection = await getCollection('devices');
      const device = await collection.findOne({ _id: new ObjectId(id) });
      return device as Device | undefined;
    } catch (error) {
      console.error("Error fetching device:", error);
      return undefined;
    }
  }

  // Vulnerability methods
  async createVulnerability(vulnerability: Omit<Vulnerability, "_id">): Promise<Vulnerability> {
    try {
      const collection = await getCollection('vulnerabilities');
      const result = await collection.insertOne(vulnerability);
      return {
        ...vulnerability,
        _id: result.insertedId
      } as Vulnerability;
    } catch (error) {
      console.error("Error creating vulnerability:", error);
      throw error;
    }
  }

  async getVulnerabilitiesByDeviceId(deviceId: string): Promise<Vulnerability[]> {
    try {
      const collection = await getCollection('vulnerabilities');
      const vulnerabilities = await collection.find({ deviceId }).toArray();
      return vulnerabilities as Vulnerability[];
    } catch (error) {
      console.error("Error fetching vulnerabilities by device ID:", error);
      return [];
    }
  }

  // Threat Intelligence methods
  async createThreat(threat: Omit<Threat, "_id">): Promise<Threat> {
    try {
      const collection = await getCollection('threats');
      const result = await collection.insertOne(threat);
      return {
        ...threat,
        _id: result.insertedId
      } as Threat;
    } catch (error) {
      console.error("Error creating threat:", error);
      throw error;
    }
  }

  async getThreats(limit?: number): Promise<Threat[]> {
    try {
      const collection = await getCollection('threats');
      let query = collection.find().sort({ publishedDate: -1 });
      if (limit) {
        query = query.limit(limit);
      }
      const threats = await query.toArray();
      return threats as Threat[];
    } catch (error) {
      console.error("Error fetching threats:", error);
      return [];
    }
  }

  // Solar Assessment methods
  async createSolarAssessment(assessment: Omit<SolarAssessment, "_id">): Promise<SolarAssessment> {
    try {
      const collection = await getCollection('solarAssessments');
      const result = await collection.insertOne(assessment);
      return {
        ...assessment,
        _id: result.insertedId
      } as SolarAssessment;
    } catch (error) {
      console.error("Error creating solar assessment:", error);
      throw error;
    }
  }

  async getSolarAssessmentByScanId(scanId: string): Promise<SolarAssessment | undefined> {
    try {
      const collection = await getCollection('solarAssessments');
      const assessment = await collection.findOne({ scanId });
      return assessment as SolarAssessment | undefined;
    } catch (error) {
      console.error("Error fetching solar assessment by scan ID:", error);
      return undefined;
    }
  }

  // Dashboard methods
  async getDashboardStats(userId: string): Promise<any> {
    try {
      // Collect all the data needed for the dashboard
      const scansCollection = await getCollection('scans');
      const devicesCollection = await getCollection('devices');
      const vulnerabilitiesCollection = await getCollection('vulnerabilities');
      const threatsCollection = await getCollection('threats');
      const solarAssessmentsCollection = await getCollection('solarAssessments');
      
      // Get total scans count
      const totalScans = await scansCollection.countDocuments({ userId });
      
      // Get total devices
      const scans = await scansCollection.find({ userId }).toArray();
      const scanIds = scans.map(scan => scan._id.toString());
      
      let totalDevices = 0;
      let devices: any[] = [];
      
      for (const scanId of scanIds) {
        const scanDevices = await devicesCollection.find({ scanId }).toArray();
        devices = [...devices, ...scanDevices];
        totalDevices += scanDevices.length;
      }
      
      // Get vulnerabilities
      const deviceIds = devices.map(device => device._id.toString());
      let vulnerabilities: any[] = [];
      let totalVulnerabilities = 0;
      let criticalCount = 0;
      let highCount = 0;
      let mediumCount = 0;
      let lowCount = 0;
      
      for (const deviceId of deviceIds) {
        const deviceVulnerabilities = await vulnerabilitiesCollection.find({ deviceId }).toArray();
        vulnerabilities = [...vulnerabilities, ...deviceVulnerabilities];
        totalVulnerabilities += deviceVulnerabilities.length;
        
        // Count by severity
        deviceVulnerabilities.forEach(vuln => {
          switch (vuln.severity) {
            case 'Critical': criticalCount++; break;
            case 'High': highCount++; break;
            case 'Medium': mediumCount++; break;
            case 'Low': lowCount++; break;
          }
        });
      }
      
      // Get solar score (average of all assessments)
      const solarAssessments = await solarAssessmentsCollection.find({ 
        scanId: { $in: scanIds } 
      }).toArray();
      
      let solarScore = 0;
      if (solarAssessments.length > 0) {
        const totalScore = solarAssessments.reduce((acc, curr) => acc + (curr.securityScore || 0), 0);
        solarScore = Math.round(totalScore / solarAssessments.length);
      }
      
      // Get recent scans
      const recentScans = await scansCollection.find({ userId })
        .sort({ startTime: -1 })
        .limit(5)
        .toArray();
      
      // Get recent threats
      const recentThreats = await threatsCollection.find()
        .sort({ publishedDate: -1 })
        .limit(5)
        .toArray();
      
      // Get recommendations based on vulnerabilities
      const recommendations = [
        { 
          id: '1', 
          title: 'Update firmware on vulnerable devices', 
          description: 'Several devices have outdated firmware with known vulnerabilities.',
          priority: 'high'
        },
        { 
          id: '2', 
          title: 'Implement network segmentation', 
          description: 'Isolate IoT and solar devices from critical infrastructure.',
          priority: 'medium'
        },
        { 
          id: '3', 
          title: 'Enable two-factor authentication', 
          description: 'Add an extra layer of security to administrative interfaces.',
          priority: 'high'
        }
      ];
      
      return {
        totalScans,
        totalDevices,
        totalVulnerabilities,
        solarScore,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        recentScans,
        recentThreats,
        recommendations
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        totalScans: 0,
        totalDevices: 0,
        totalVulnerabilities: 0,
        solarScore: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        recentScans: [],
        recentThreats: [],
        recommendations: []
      };
    }
  }
}

// Create an instance of either MongoDB storage or in-memory storage
let storageInstance: IStorage;

// Try to check the database connection
export async function initializeStorage(): Promise<IStorage> {
  // Start with in-memory storage to ensure the app works immediately
  console.log("Initializing in-memory storage while checking MongoDB...");
  const memStorage = new MemStorage();
  
  try {
    // Check if MongoDB is available with a short timeout
    console.log("Checking MongoDB connection...");
    const isConnected = await checkConnection();
    
    if (isConnected) {
      console.log("✅ Successfully connected to MongoDB - using MongoDB storage");
      storageInstance = new MongoDBStorage();
    } else {
      console.log("❌ MongoDB connection failed - using in-memory storage");
      storageInstance = memStorage;
      
      // Retry MongoDB connection periodically
      setInterval(async () => {
        try {
          const retryConnection = await checkConnection();
          if (retryConnection && !(storageInstance instanceof MongoDBStorage)) {
            console.log("✅ MongoDB connection established - switching to MongoDB storage");
            storageInstance = new MongoDBStorage();
          }
        } catch (error) {
          console.error("Error during MongoDB reconnection attempt:", error);
        }
      }, 60000); // Try again every minute
    }
  } catch (error) {
    console.error("Error during storage initialization:", error);
    storageInstance = memStorage;
  }
  
  return storageInstance;
}

// Create an in-memory storage implementation as backup
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private scans: Map<string, Scan>;
  private devices: Map<string, Device>;
  private vulnerabilities: Map<string, Vulnerability>;
  private threats: Map<string, Threat>;
  private solarAssessments: Map<string, SolarAssessment>;
  
  constructor() {
    this.users = new Map();
    this.scans = new Map();
    this.devices = new Map();
    this.vulnerabilities = new Map();
    this.threats = new Map();
    this.solarAssessments = new Map();
  }
  
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = new ObjectId();
    const newUser: User = { ...user, _id: id, createdAt: new Date() };
    this.users.set(id.toString(), newUser);
    return newUser;
  }
  
  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Scan methods
  async createScan(scan: Omit<Scan, "_id">): Promise<Scan> {
    const id = new ObjectId();
    const newScan: Scan = { ...scan, _id: id };
    this.scans.set(id.toString(), newScan);
    return newScan;
  }
  
  async getScan(id: string): Promise<Scan | undefined> {
    return this.scans.get(id);
  }
  
  async getScansByUserId(userId: string): Promise<Scan[]> {
    return Array.from(this.scans.values()).filter(scan => scan.userId === userId);
  }
  
  async updateScanStatus(id: string, status: "pending" | "running" | "completed" | "failed", endTime?: Date): Promise<boolean> {
    const scan = this.scans.get(id);
    if (!scan) return false;
    
    scan.status = status;
    if (endTime) scan.endTime = endTime;
    this.scans.set(id, scan);
    return true;
  }
  
  // Device methods
  async createDevice(device: Omit<Device, "_id">): Promise<Device> {
    const id = new ObjectId();
    const newDevice: Device = { ...device, _id: id };
    this.devices.set(id.toString(), newDevice);
    return newDevice;
  }
  
  async getDevicesByScanId(scanId: string): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(device => device.scanId === scanId);
  }
  
  async getDevice(id: string): Promise<Device | undefined> {
    return this.devices.get(id);
  }
  
  // Vulnerability methods
  async createVulnerability(vulnerability: Omit<Vulnerability, "_id">): Promise<Vulnerability> {
    const id = new ObjectId();
    const newVulnerability: Vulnerability = { ...vulnerability, _id: id };
    this.vulnerabilities.set(id.toString(), newVulnerability);
    return newVulnerability;
  }
  
  async getVulnerabilitiesByDeviceId(deviceId: string): Promise<Vulnerability[]> {
    return Array.from(this.vulnerabilities.values())
      .filter(vulnerability => vulnerability.deviceId === deviceId);
  }
  
  // Threat Intelligence methods
  async createThreat(threat: Omit<Threat, "_id">): Promise<Threat> {
    const id = new ObjectId();
    const newThreat: Threat = { ...threat, _id: id };
    this.threats.set(id.toString(), newThreat);
    return newThreat;
  }
  
  async getThreats(limit?: number): Promise<Threat[]> {
    const threats = Array.from(this.threats.values())
      .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
    
    return limit ? threats.slice(0, limit) : threats;
  }
  
  // Solar Assessment methods
  async createSolarAssessment(assessment: Omit<SolarAssessment, "_id">): Promise<SolarAssessment> {
    const id = new ObjectId();
    const newAssessment: SolarAssessment = { ...assessment, _id: id };
    this.solarAssessments.set(id.toString(), newAssessment);
    return newAssessment;
  }
  
  async getSolarAssessmentByScanId(scanId: string): Promise<SolarAssessment | undefined> {
    return Array.from(this.solarAssessments.values())
      .find(assessment => assessment.scanId === scanId);
  }
  
  // Dashboard methods
  async getDashboardStats(userId: string): Promise<any> {
    // Get scans
    const scans = Array.from(this.scans.values())
      .filter(scan => scan.userId === userId);
    
    // Get devices
    const scanIds = scans.map(scan => scan._id!.toString());
    const devices = Array.from(this.devices.values())
      .filter(device => scanIds.includes(device.scanId));
    
    // Get vulnerabilities
    const deviceIds = devices.map(device => device._id!.toString());
    const vulnerabilities = Array.from(this.vulnerabilities.values())
      .filter(vuln => deviceIds.includes(vuln.deviceId));
    
    // Count vulnerabilities by severity
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'Critical': criticalCount++; break;
        case 'High': highCount++; break;
        case 'Medium': mediumCount++; break;
        case 'Low': lowCount++; break;
      }
    });
    
    // Get solar assessments
    const solarAssessments = Array.from(this.solarAssessments.values())
      .filter(assessment => scanIds.includes(assessment.scanId));
    
    // Calculate solar score
    let solarScore = 0;
    if (solarAssessments.length > 0) {
      const totalScore = solarAssessments.reduce((total, assessment) => {
        return total + (assessment.securityScore || 0);
      }, 0);
      solarScore = Math.round(totalScore / solarAssessments.length);
    }
    
    // Get recent data
    const recentScans = scans
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 5);
    
    const recentThreats = Array.from(this.threats.values())
      .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime())
      .slice(0, 5);
    
    // Sample recommendations
    const recommendations = [
      { 
        id: '1', 
        title: 'Update firmware on vulnerable devices', 
        description: 'Several devices have outdated firmware with known vulnerabilities.',
        priority: 'high'
      },
      { 
        id: '2', 
        title: 'Implement network segmentation', 
        description: 'Isolate IoT and solar devices from critical infrastructure.',
        priority: 'medium'
      },
      { 
        id: '3', 
        title: 'Enable two-factor authentication', 
        description: 'Add an extra layer of security to administrative interfaces.',
        priority: 'high'
      }
    ];
    
    return {
      totalScans: scans.length,
      totalDevices: devices.length,
      totalVulnerabilities: vulnerabilities.length,
      solarScore,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      recentScans,
      recentThreats,
      recommendations
    };
  }
}

// Export an initial storage instance that will be replaced when the app starts
export let storage: IStorage = new MemStorage();

// Update the storage instance
export async function setupStorage() {
  try {
    console.log("Setting up storage with reliable fallback mechanism");
    storage = await initializeStorage();
    
    // Verify storage is properly initialized
    if (!storage) {
      console.warn("Storage initialization failed, using memory storage as fallback");
      storage = new MemStorage();
    }
    
    return storage;
  } catch (error) {
    console.error("Critical error during storage setup:", error);
    console.log("Falling back to in-memory storage");
    storage = new MemStorage();
    return storage;
  }
}
