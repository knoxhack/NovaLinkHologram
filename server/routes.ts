import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertAgentTypeSchema,
  insertAgentSchema, 
  insertMessageSchema, 
  insertAlertSchema, 
  insertCommandSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send initial data to the client
    sendInitialData(ws);
    
    // Handle messages from the client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'command') {
          // Handle command
          const agentId = parseInt(data.agentId);
          const commandText = data.command;
          
          // Create a new command
          const command = await storage.createCommand({
            agentId,
            command: commandText,
            executed: false,
            timestamp: new Date()
          });
          
          // If the command is for the ChronoCore agent and it's awaiting input,
          // resolve the alert and update the agent status
          if (agentId === 1 && (
              commandText.toLowerCase().includes('proceed') || 
              commandText.toLowerCase().includes('reschedule')
          )) {
            // Get the agent's alerts
            const alerts = await storage.getAgentAlerts(agentId);
            
            // Resolve all unresolved alerts
            for (const alert of alerts) {
              if (!alert.resolved) {
                await storage.resolveAlert(alert.id);
              }
            }
            
            // Update the agent status to active
            await storage.updateAgentStatus(agentId, 'active');
            
            // Create a response message from the agent
            const responseContent = commandText.toLowerCase().includes('proceed') 
              ? "Proceeding with deployment as requested. I'll monitor for any conflicts."
              : "Rescheduling deployment for tomorrow at 3AM when system usage is minimal.";
            
            await storage.createMessage({
              agentId,
              content: responseContent,
              type: "AGENT",
              timestamp: new Date()
            });
          }
          
          // Record a message for the user command
          await storage.createMessage({
            agentId,
            content: commandText,
            type: "USER",
            timestamp: new Date()
          });
          
          // Broadcast the updated data to all connected clients
          broadcastUpdates(wss);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
  
  // API Routes
  
  // Get all agent types
  app.get('/api/agent-types', async (req, res) => {
    try {
      const agentTypes = await storage.getAgentTypes();
      res.json(agentTypes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching agent types' });
    }
  });
  
  // Get all agents
  app.get('/api/agents', async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching agents' });
    }
  });
  
  // Get a specific agent
  app.get('/api/agents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.getAgent(id);
      
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching agent' });
    }
  });
  
  // Update agent status
  app.patch('/api/agents/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schema = z.object({ status: z.string() });
      const { status } = schema.parse(req.body);
      
      const updatedAgent = await storage.updateAgentStatus(id, status);
      
      if (!updatedAgent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      // Broadcast the update to all connected clients
      broadcastUpdates(wss);
      
      res.json(updatedAgent);
    } catch (error) {
      res.status(500).json({ message: 'Error updating agent status' });
    }
  });
  
  // Get agent messages
  app.get('/api/agents/:id/messages', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const messages = await storage.getMessages(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching messages' });
    }
  });
  
  // Create a message
  app.post('/api/messages', async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      // Broadcast the update to all connected clients
      broadcastUpdates(wss);
      
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: 'Error creating message' });
    }
  });
  
  // Get all alerts
  app.get('/api/alerts', async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching alerts' });
    }
  });
  
  // Get agent alerts
  app.get('/api/agents/:id/alerts', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alerts = await storage.getAgentAlerts(id);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching alerts' });
    }
  });
  
  // Resolve an alert
  app.patch('/api/alerts/:id/resolve', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.resolveAlert(id);
      
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      // Broadcast the update to all connected clients
      broadcastUpdates(wss);
      
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: 'Error resolving alert' });
    }
  });
  
  // Create a command
  app.post('/api/commands', async (req, res) => {
    try {
      const commandData = insertCommandSchema.parse(req.body);
      const command = await storage.createCommand(commandData);
      
      // Broadcast the update to all connected clients
      broadcastUpdates(wss);
      
      res.status(201).json(command);
    } catch (error) {
      res.status(500).json({ message: 'Error creating command' });
    }
  });
  
  // Execute a command
  app.patch('/api/commands/:id/execute', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const command = await storage.executeCommand(id);
      
      if (!command) {
        return res.status(404).json({ message: 'Command not found' });
      }
      
      // Broadcast the update to all connected clients
      broadcastUpdates(wss);
      
      res.json(command);
    } catch (error) {
      res.status(500).json({ message: 'Error executing command' });
    }
  });

  return httpServer;
}

// Helper function to send initial data to a client
async function sendInitialData(ws: WebSocket) {
  if (ws.readyState === WebSocket.OPEN) {
    try {
      const agents = await storage.getAgents();
      const agentTypes = await storage.getAgentTypes();
      const alerts = await storage.getAlerts();
      
      const initialData = {
        type: 'initial',
        data: {
          agents,
          agentTypes,
          alerts
        }
      };
      
      ws.send(JSON.stringify(initialData));
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }
}

// Helper function to broadcast updates to all connected clients
async function broadcastUpdates(wss: WebSocketServer) {
  try {
    const agents = await storage.getAgents();
    const alerts = await storage.getAlerts();
    
    const updateData = {
      type: 'update',
      data: {
        agents,
        alerts,
        timestamp: new Date()
      }
    };
    
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(updateData));
      }
    });
  } catch (error) {
    console.error('Error broadcasting updates:', error);
  }
}
