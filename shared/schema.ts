import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  varchar,
  jsonb, 
  index 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table enhanced for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

// Type for upsert operation with Replit Auth
export const upsertUserSchema = createInsertSchema(users);

// Agent status enum values
export const AgentStatusEnum = {
  ACTIVE: "active",
  IDLE: "idle",
  PROCESSING: "processing",
  AWAITING_INPUT: "awaiting_input",
  STOPPED: "stopped",
  ERROR: "error",
} as const;

// Agent status type
// Define as explicit string union type for better type safety
export type AgentStatus = "active" | "idle" | "processing" | "awaiting_input" | "stopped" | "error";

// Agent type table
export const agentTypes = pgTable("agent_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(), // Icon name for the agent type
  color: text("color").notNull(), // Color for the agent type
});

export const insertAgentTypeSchema = createInsertSchema(agentTypes).pick({
  name: true,
  icon: true,
  color: true,
});

// Agents table
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  projectId: text("project_id").notNull(),
  typeId: integer("type_id").notNull(),
  status: text("status").notNull().$type<AgentStatus>(),
  memory: integer("memory").notNull(),
  cpu: integer("cpu").notNull(),
  uptime: integer("uptime").notNull(), // uptime in seconds
  lastActive: timestamp("last_active").notNull(),
});

export const insertAgentSchema = createInsertSchema(agents).pick({
  name: true,
  projectId: true,
  typeId: true,
  status: true,
  memory: true,
  cpu: true,
  uptime: true,
  lastActive: true,
});

// Messages/Logs table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // SYSTEM, INFO, TASK, AGENT, USER
  timestamp: timestamp("timestamp").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  agentId: true,
  content: true,
  type: true,
  timestamp: true,
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  message: text("message").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  timestamp: timestamp("timestamp").notNull(),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  agentId: true,
  message: true,
  resolved: true,
  timestamp: true,
});

// Commands table
export const commands = pgTable("commands", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  command: text("command").notNull(),
  executed: boolean("executed").notNull().default(false),
  timestamp: timestamp("timestamp").notNull(),
});

export const insertCommandSchema = createInsertSchema(commands).pick({
  agentId: true,
  command: true,
  executed: true,
  timestamp: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type AgentType = typeof agentTypes.$inferSelect;
export type InsertAgentType = z.infer<typeof insertAgentTypeSchema>;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Command = typeof commands.$inferSelect;
export type InsertCommand = z.infer<typeof insertCommandSchema>;
