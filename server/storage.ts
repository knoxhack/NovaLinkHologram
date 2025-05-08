import { 
  users, type User, type InsertUser, type UpsertUser,
  agentTypes, type AgentType, type InsertAgentType,
  agents, type Agent, type InsertAgent,
  messages, type Message, type InsertMessage,
  alerts, type Alert, type InsertAlert,
  commands, type Command, type InsertCommand,
  AgentStatusEnum, type AgentStatus
} from "@shared/schema";

import { db } from './db';
import { eq, and, SQL } from 'drizzle-orm';

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Agent type operations
  getAgentTypes(): Promise<AgentType[]>;
  getAgentType(id: number): Promise<AgentType | undefined>;
  createAgentType(agentType: InsertAgentType): Promise<AgentType>;
  
  // Agent operations
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgentStatus(id: number, status: string): Promise<Agent | undefined>;
  
  // Message operations
  getMessages(agentId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Alert operations
  getAlerts(): Promise<Alert[]>;
  getAgentAlerts(agentId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: number): Promise<Alert | undefined>;
  
  // Command operations
  getCommands(agentId: number): Promise<Command[]>;
  createCommand(command: InsertCommand): Promise<Command>;
  executeCommand(id: number): Promise<Command | undefined>;
}

// Database implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    // This method is kept for interface compatibility but not used with Replit Auth
    return undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    // This method is kept for interface compatibility but not used with Replit Auth
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Agent type operations
  async getAgentTypes(): Promise<AgentType[]> {
    return await db.select().from(agentTypes);
  }
  
  async getAgentType(id: number): Promise<AgentType | undefined> {
    const [agentType] = await db.select().from(agentTypes).where(eq(agentTypes.id, id));
    return agentType;
  }
  
  async createAgentType(agentType: InsertAgentType): Promise<AgentType> {
    const [createdAgentType] = await db.insert(agentTypes).values(agentType).returning();
    return createdAgentType;
  }
  
  // Agent operations
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }
  
  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }
  
  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [createdAgent] = await db.insert(agents).values(agent).returning();
    return createdAgent;
  }
  
  async updateAgentStatus(id: number, status: string): Promise<Agent | undefined> {
    const [updatedAgent] = await db
      .update(agents)
      .set({ status: status as AgentStatus })
      .where(eq(agents.id, id))
      .returning();
    return updatedAgent;
  }
  
  // Message operations
  async getMessages(agentId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.agentId, agentId));
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [createdMessage] = await db.insert(messages).values(message).returning();
    return createdMessage;
  }
  
  // Alert operations
  async getAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts);
  }
  
  async getAgentAlerts(agentId: number): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.agentId, agentId));
  }
  
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [createdAlert] = await db.insert(alerts).values(alert).returning();
    return createdAlert;
  }
  
  async resolveAlert(id: number): Promise<Alert | undefined> {
    const [updatedAlert] = await db
      .update(alerts)
      .set({ resolved: true })
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }
  
  // Command operations
  async getCommands(agentId: number): Promise<Command[]> {
    return await db.select().from(commands).where(eq(commands.agentId, agentId));
  }
  
  async createCommand(command: InsertCommand): Promise<Command> {
    const [createdCommand] = await db.insert(commands).values(command).returning();
    return createdCommand;
  }
  
  async executeCommand(id: number): Promise<Command | undefined> {
    const [updatedCommand] = await db
      .update(commands)
      .set({ executed: true })
      .where(eq(commands.id, id))
      .returning();
    return updatedCommand;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agentTypes: Map<number, AgentType>;
  private agents: Map<number, Agent>;
  private messages: Map<number, Message>;
  private alerts: Map<number, Alert>;
  private commands: Map<number, Command>;
  private currentAgentTypeId: number;
  private currentAgentId: number;
  private currentMessageId: number;
  private currentAlertId: number;
  private currentCommandId: number;

  constructor() {
    this.users = new Map();
    this.agentTypes = new Map();
    this.agents = new Map();
    this.messages = new Map();
    this.alerts = new Map();
    this.commands = new Map();
    this.currentAgentTypeId = 1;
    this.currentAgentId = 1;
    this.currentMessageId = 1;
    this.currentAlertId = 1;
    this.currentCommandId = 1;
    
    // Initialize with default agent types
    this.seedAgentTypes();
    
    // Initialize with default agents
    this.seedAgents();
    
    // Initialize with default messages
    this.seedMessages();
    
    // Initialize with default alerts
    this.seedAlerts();
  }
  
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id;
    let user = this.users.get(id);
    
    if (user) {
      user = { ...user, ...userData, updatedAt: new Date() };
    } else {
      user = { 
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;
    }
    
    this.users.set(id, user);
    return user;
  }
  
  // Agent type operations
  async getAgentTypes(): Promise<AgentType[]> {
    return Array.from(this.agentTypes.values());
  }
  
  async getAgentType(id: number): Promise<AgentType | undefined> {
    return this.agentTypes.get(id);
  }
  
  async createAgentType(insertAgentType: InsertAgentType): Promise<AgentType> {
    const id = this.currentAgentTypeId++;
    const agentType: AgentType = { ...insertAgentType, id };
    this.agentTypes.set(id, agentType);
    return agentType;
  }
  
  // Agent operations
  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }
  
  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }
  
  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.currentAgentId++;
    const agent: Agent = { ...insertAgent, id };
    this.agents.set(id, agent);
    return agent;
  }
  
  async updateAgentStatus(id: number, status: string): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    agent.status = status as any;
    this.agents.set(id, agent);
    return agent;
  }
  
  // Message operations
  async getMessages(agentId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.agentId === agentId,
    );
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { ...insertMessage, id };
    this.messages.set(id, message);
    return message;
  }
  
  // Alert operations
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }
  
  async getAgentAlerts(agentId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.agentId === agentId,
    );
  }
  
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = { ...insertAlert, id };
    this.alerts.set(id, alert);
    return alert;
  }
  
  async resolveAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    alert.resolved = true;
    this.alerts.set(id, alert);
    return alert;
  }
  
  // Command operations
  async getCommands(agentId: number): Promise<Command[]> {
    return Array.from(this.commands.values()).filter(
      (command) => command.agentId === agentId,
    );
  }
  
  async createCommand(insertCommand: InsertCommand): Promise<Command> {
    const id = this.currentCommandId++;
    const command: Command = { ...insertCommand, id };
    this.commands.set(id, command);
    return command;
  }
  
  async executeCommand(id: number): Promise<Command | undefined> {
    const command = this.commands.get(id);
    if (!command) return undefined;
    
    command.executed = true;
    this.commands.set(id, command);
    return command;
  }
  
  // Seed methods for initial data
  private seedAgentTypes(): void {
    const agentTypes: InsertAgentType[] = [
      { name: "Time Manager", icon: "clock", color: "#FF45E9" },
      { name: "Data Processor", icon: "database", color: "#4a8cff" },
      { name: "Vision System", icon: "eye", color: "#b366ff" },
      { name: "Task Scheduler", icon: "calendar", color: "#aaaaaa" },
      { name: "AI Assistant", icon: "robot", color: "#ffcc00" },
      { name: "Pipeline Manager", icon: "rocket", color: "#0CFFE1" }
    ];
    
    agentTypes.forEach(type => {
      this.createAgentType(type);
    });
  }
  
  private seedAgents(): void {
    const nowTime = new Date();
    
    const agents: InsertAgent[] = [
      {
        name: "ChronoCore",
        projectId: "AstroPipeline",
        typeId: 1, // Time Manager
        status: AgentStatusEnum.AWAITING_INPUT,
        memory: 384,
        cpu: 12,
        uptime: 12240, // 3h 24m in seconds
        lastActive: nowTime
      },
      {
        name: "AstroPipeline",
        projectId: "StarfleetOps",
        typeId: 6, // Pipeline Manager
        status: AgentStatusEnum.ACTIVE,
        memory: 256,
        cpu: 8,
        uptime: 7200, // 2h in seconds
        lastActive: nowTime
      },
      {
        name: "DataSynth",
        projectId: "MetricAnalyzer",
        typeId: 2, // Data Processor
        status: AgentStatusEnum.PROCESSING,
        memory: 512,
        cpu: 24,
        uptime: 3600, // 1h in seconds
        lastActive: nowTime
      },
      {
        name: "VisionCore",
        projectId: "ImageClassifier",
        typeId: 3, // Vision System
        status: AgentStatusEnum.ACTIVE,
        memory: 768,
        cpu: 32,
        uptime: 1800, // 30m in seconds
        lastActive: nowTime
      },
      {
        name: "XenoAI",
        projectId: "AITrainer",
        typeId: 5, // AI Assistant
        status: AgentStatusEnum.IDLE,
        memory: 192,
        cpu: 4,
        uptime: 9000, // 2h 30m in seconds
        lastActive: nowTime
      },
      {
        name: "QuantumScheduler",
        projectId: "QuantumOps",
        typeId: 4, // Task Scheduler
        status: AgentStatusEnum.STOPPED,
        memory: 0,
        cpu: 0,
        uptime: 0,
        lastActive: new Date(nowTime.getTime() - 3600000) // 1 hour ago
      }
    ];
    
    agents.forEach(agent => {
      this.createAgent(agent);
    });
  }
  
  private seedMessages(): void {
    const nowTime = new Date();
    const fifteenMinutesAgo = new Date(nowTime.getTime() - 15 * 60 * 1000);
    const sixteenMinutesAgo = new Date(nowTime.getTime() - 16 * 60 * 1000);
    const seventeenMinutesAgo = new Date(nowTime.getTime() - 17 * 60 * 1000);
    const eighteenMinutesAgo = new Date(nowTime.getTime() - 18 * 60 * 1000);
    
    const messages: InsertMessage[] = [
      {
        agentId: 1, // ChronoCore
        content: "ChronoCore agent initialized at 14:32:05",
        type: "SYSTEM",
        timestamp: eighteenMinutesAgo
      },
      {
        agentId: 1,
        content: "Connected to AstroPipeline project repo",
        type: "INFO",
        timestamp: seventeenMinutesAgo
      },
      {
        agentId: 1,
        content: "Scheduled deployment preparation started",
        type: "TASK",
        timestamp: sixteenMinutesAgo
      },
      {
        agentId: 1,
        content: "I've analyzed the deployment schedule and found potential conflicts with existing services.",
        type: "AGENT",
        timestamp: fifteenMinutesAgo
      },
      {
        agentId: 1,
        content: "Would you like me to proceed with the conflicting deployment or reschedule for a later time?",
        type: "AGENT",
        timestamp: nowTime
      }
    ];
    
    messages.forEach(message => {
      this.createMessage(message);
    });
  }
  
  private seedAlerts(): void {
    const nowTime = new Date();
    
    const alerts: InsertAlert[] = [
      {
        agentId: 1, // ChronoCore
        message: "Agent is awaiting your input about the deployment schedule.",
        resolved: false,
        timestamp: nowTime
      }
    ];
    
    alerts.forEach(alert => {
      this.createAlert(alert);
    });
  }
}

// Use DatabaseStorage to enable database persistence
export const storage = new DatabaseStorage();
