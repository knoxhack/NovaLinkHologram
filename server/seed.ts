import { db } from './db';
import { 
  agentTypes, agents, messages, alerts,
  AgentStatusEnum,
  type InsertAgentType, type InsertAgent, 
  type InsertMessage, type InsertAlert
} from '@shared/schema';

async function seedDatabase() {
  console.log('Seeding database...');

  // First check if we already have data
  const existingTypes = await db.select().from(agentTypes);
  if (existingTypes.length > 0) {
    console.log('Database already seeded, skipping');
    return;
  }

  // Seed agent types
  const agentTypeData: InsertAgentType[] = [
    { name: "Time Manager", icon: "clock", color: "#FF45E9" },
    { name: "Data Processor", icon: "database", color: "#4a8cff" },
    { name: "Vision System", icon: "eye", color: "#b366ff" },
    { name: "Task Scheduler", icon: "calendar", color: "#aaaaaa" },
    { name: "AI Assistant", icon: "robot", color: "#ffcc00" },
    { name: "Pipeline Manager", icon: "rocket", color: "#0CFFE1" }
  ];
  
  const createdAgentTypes = await db.insert(agentTypes).values(agentTypeData).returning();
  console.log(`Created ${createdAgentTypes.length} agent types`);
  
  // Seed agents
  const nowTime = new Date();
  
  const agentData: InsertAgent[] = [
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
  
  const createdAgents = await db.insert(agents).values(agentData).returning();
  console.log(`Created ${createdAgents.length} agents`);
  
  // Seed messages
  const fifteenMinutesAgo = new Date(nowTime.getTime() - 15 * 60 * 1000);
  const sixteenMinutesAgo = new Date(nowTime.getTime() - 16 * 60 * 1000);
  const seventeenMinutesAgo = new Date(nowTime.getTime() - 17 * 60 * 1000);
  const eighteenMinutesAgo = new Date(nowTime.getTime() - 18 * 60 * 1000);
  
  const messageData: InsertMessage[] = [
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
  
  const createdMessages = await db.insert(messages).values(messageData).returning();
  console.log(`Created ${createdMessages.length} messages`);
  
  // Seed alerts
  const alertData: InsertAlert[] = [
    {
      agentId: 1, // ChronoCore
      message: "Agent is awaiting your input about the deployment schedule.",
      resolved: false,
      timestamp: nowTime
    }
  ];
  
  const createdAlerts = await db.insert(alerts).values(alertData).returning();
  console.log(`Created ${createdAlerts.length} alerts`);
  
  console.log('Database seeding complete');
}

export { seedDatabase };