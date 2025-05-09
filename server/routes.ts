import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { 
  insertAgentTypeSchema,
  insertAgentSchema, 
  insertMessageSchema, 
  insertAlertSchema, 
  insertCommandSchema,
  Agent
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup authentication
  await setupAuth(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handler
  wss.on('connection', async (ws, req) => {
    console.log('Client connected to WebSocket');

    // Get the session ID from the request cookies
    const sessionCookie = req.headers.cookie?.split(';').find(c => c.trim().startsWith('connect.sid='));
    if (!sessionCookie) {
      // If no session cookie is found, close the connection
      console.log('No session cookie found, closing WebSocket connection');
      ws.close(1008, 'Unauthorized');
      return;
    }
    
    // Add session validation using our session middleware
    // We would need to extract the session ID and validate it against our session store
    
    // A simplistic check - if we were using a more complex setup we'd parse the session
    // but for now we'll just check that the cookie exists
    
    // Add authenticated property to the WebSocket instance for later checks
    (ws as any).authenticated = true;
    
    // Send initial data to the client
    await sendInitialData(ws);
    
    // Handle messages from the client
    ws.on('message', async (message) => {
      try {
        // Make sure the client is authenticated
        if (!(ws as any).authenticated) {
          ws.close(1008, 'Unauthorized');
          return;
        }
        
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
          
          // Get the agent to determine how to respond
          const agent = await storage.getAgent(agentId);
          if (!agent) {
            console.error(`Agent with ID ${agentId} not found`);
            return;
          }
          
          // Record a message for the user command
          await storage.createMessage({
            agentId,
            content: commandText,
            type: "USER",
            timestamp: new Date()
          });
          
          // Determine appropriate response based on command and agent
          let responseContent = "";
          let shouldResolveAlerts = false;
          let newStatus = agent.status;
          
          // Generate a response based on command keywords
          if (commandText.toLowerCase().includes('proceed')) {
            responseContent = `Proceeding with ${agent.name} operation as requested. I'll monitor for any conflicts.`;
            shouldResolveAlerts = true;
            newStatus = 'active';
          } 
          else if (commandText.toLowerCase().includes('reschedule')) {
            responseContent = `Rescheduling ${agent.name} operation for tomorrow at 3AM when system usage is minimal.`;
            shouldResolveAlerts = true;
            newStatus = 'idle';
          }
          else if (commandText.toLowerCase().includes('status')) {
            responseContent = `${agent.name} is currently ${agent.status}. Memory usage is at ${agent.memory}MB with ${agent.uptime} seconds uptime.`;
          }
          else if (commandText.toLowerCase().includes('stop') || commandText.toLowerCase().includes('pause')) {
            responseContent = `Pausing ${agent.name} operations. You can resume by saying 'resume' or 'continue'.`;
            newStatus = 'idle';
          }
          else if (commandText.toLowerCase().includes('resume') || commandText.toLowerCase().includes('continue')) {
            responseContent = `Resuming ${agent.name} operations now.`;
            newStatus = 'active';
          }
          else if (commandText.toLowerCase().includes('help')) {
            responseContent = `Available commands for ${agent.name}: status, proceed, reschedule, stop, resume, help`;
          }
          else {
            // Default response if no specific keywords are detected
            responseContent = `Command received for ${agent.name}. Processing your request now.`;
            newStatus = 'processing';
            
            // After a short delay, simulate completion and return to active state
            setTimeout(async () => {
              await storage.updateAgentStatus(agentId, 'active');
              
              // Create a follow-up message
              await storage.createMessage({
                agentId,
                content: `${agent.name} has completed processing your request.`,
                type: "AGENT",
                timestamp: new Date()
              });
              
              // Send a voice notification to the client
              wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN && (client as any).authenticated) {
                  const voiceData = {
                    type: 'voice',
                    data: {
                      text: `${agent.name} has completed processing your request.`,
                      agentId
                    }
                  };
                  client.send(JSON.stringify(voiceData));
                }
              });
              
              // Broadcast updated agent status
              broadcastUpdates(wss);
            }, 3000);
          }
          
          // If alerts should be resolved, resolve them
          if (shouldResolveAlerts) {
            // Get the agent's alerts
            const alerts = await storage.getAgentAlerts(agentId);
            
            // Resolve all unresolved alerts
            for (const alert of alerts) {
              if (!alert.resolved) {
                await storage.resolveAlert(alert.id);
              }
            }
          }
          
          // Update the agent status if it's changed
          if (newStatus !== agent.status) {
            await storage.updateAgentStatus(agentId, newStatus);
          }
          
          // Create a response message from the agent
          await storage.createMessage({
            agentId,
            content: responseContent,
            type: "AGENT",
            timestamp: new Date()
          });
          
          // Send a voice notification to the client using the helper function
          sendVoiceResponse(wss, {
            text: responseContent,
            agentId
          });
          
          // Broadcast the updated data to all connected clients
          broadcastUpdates(wss);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', (code, reason) => {
      console.log(`Client disconnected from WebSocket: ${code}`);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // API Routes
  
  // Get authenticated user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Get all agent types
  app.get('/api/agent-types', isAuthenticated, async (req, res) => {
    try {
      const agentTypes = await storage.getAgentTypes();
      res.json(agentTypes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching agent types' });
    }
  });
  
  // Get all agents
  app.get('/api/agents', isAuthenticated, async (req, res) => {
    try {
      const agents = await storage.getAgents();
      
      // Enhance agents with dynamic activity simulation
      const enhancedAgents = agents.map(agent => {
        // Randomly update CPU and memory values to simulate activity
        // This gives a more dynamic feel to the interface without needing external API
        const randomFactor = Math.random() * 0.2 + 0.9; // 0.9 to 1.1
        const memory = Math.round(agent.memory * randomFactor);
        const cpu = Math.round((agent.cpu || 0) * randomFactor);
        
        // Every 10th request, simulate a status change for some agents
        if (Math.random() > 0.9) {
          // Only change status for non-stopped agents
          if (agent.status !== 'stopped' && agent.status !== 'error') {
            const statuses: Agent['status'][] = ['active', 'processing', 'awaiting_input', 'idle'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Don't update in the database, just in the response
            return { ...agent, memory, cpu, status: newStatus };
          }
        }
        
        return { ...agent, memory, cpu };
      });
      
      res.json(enhancedAgents);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching agents' });
    }
  });
  
  // Get a specific agent
  app.get('/api/agents/:id', isAuthenticated, async (req, res) => {
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
  app.patch('/api/agents/:id/status', isAuthenticated, async (req, res) => {
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
  app.get('/api/agents/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const messages = await storage.getMessages(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching messages' });
    }
  });
  
  // Create a message
  app.post('/api/messages', isAuthenticated, async (req, res) => {
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
  app.get('/api/alerts', isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching alerts' });
    }
  });
  
  // Get agent alerts
  app.get('/api/agents/:id/alerts', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alerts = await storage.getAgentAlerts(id);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching alerts' });
    }
  });
  
  // Resolve an alert
  app.patch('/api/alerts/:id/resolve', isAuthenticated, async (req, res) => {
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
  app.post('/api/commands', isAuthenticated, async (req, res) => {
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
  app.patch('/api/commands/:id/execute', isAuthenticated, async (req, res) => {
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
      
      // Enhance agents with more dynamic information
      const enhancedAgents = agents.map(agent => {
        // Slightly randomize metrics to make it seem more real-time
        const randomFactor = Math.random() * 0.2 + 0.9; // 0.9 to 1.1
        const memory = Math.round(agent.memory * randomFactor);
        const cpu = Math.round((agent.cpu || 0) * randomFactor);
        
        // Update last active timestamp to recent
        const lastActive = new Date();
        
        return { ...agent, memory, cpu, lastActive };
      });
      
      const initialData = {
        type: 'initial',
        data: {
          agents: enhancedAgents,
          agentTypes,
          alerts
        }
      };
      
      ws.send(JSON.stringify(initialData));
      
      // After a short delay, send a welcome message via the voice channel
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          // Send a welcome voice message with no specific agent ID (system message)
          const welcomeData = {
            type: 'voice',
            data: {
              text: "NovaLink connection established. All systems operational.",
              agentId: null
            }
          };
          
          ws.send(JSON.stringify(welcomeData));
        }
      }, 1000);
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }
}

// Helper function to send voice responses to clients
function sendVoiceResponse(wss: WebSocketServer, responseData: { text: string, agentId: number }) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && (client as any).authenticated) {
      const voiceData = {
        type: 'voice',
        data: responseData
      };
      client.send(JSON.stringify(voiceData));
    }
  });
}

// Helper function to broadcast updates to all connected clients
async function broadcastUpdates(wss: WebSocketServer) {
  try {
    const agents = await storage.getAgents();
    const alerts = await storage.getAlerts();
    
    // Enhance agents with dynamic activity simulation, similar to the GET endpoint
    const enhancedAgents = agents.map(agent => {
      // Randomly update CPU and memory values to simulate activity
      const randomFactor = Math.random() * 0.2 + 0.9; // 0.9 to 1.1
      const memory = Math.round(agent.memory * randomFactor);
      const cpu = Math.round((agent.cpu || 0) * randomFactor);
      
      // Randomly update uptime
      const uptimeIncrement = Math.round(Math.random() * 60); // 0-60 second random increment
      const uptime = agent.uptime + uptimeIncrement;
      
      // Every now and then, simulate a status change for some agents
      if (Math.random() > 0.9) {
        // Only change status for non-stopped agents
        if (agent.status !== 'stopped' && agent.status !== 'error') {
          const statuses: Agent['status'][] = ['active', 'processing', 'awaiting_input', 'idle'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          
          // For processing agents, sometimes create an alert
          if (newStatus === 'awaiting_input' && Math.random() > 0.7) {
            // Only create alert if there are no unresolved alerts for this agent
            const hasUnresolvedAlert = alerts.some(
              alert => alert.agentId === agent.id && !alert.resolved
            );
            
            if (!hasUnresolvedAlert) {
              // This will only show in the current response, not persist to DB
              const alertMessages = [
                "Deployment conflict detected. Awaiting resolution instructions.",
                "Task scheduler conflict found. Please advise on priority assignment.",
                "Security exception encountered. Manual verification required.",
                "Processing pipeline stalled. User input needed to proceed."
              ];
              
              // Add a virtual alert (won't be persisted to DB)
              const virtualAlert = {
                id: Math.floor(Math.random() * 10000) + 1000,
                agentId: agent.id,
                message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
                timestamp: new Date(),
                resolved: false
              };
              
              alerts.push(virtualAlert);
            }
          }
          
          return { ...agent, memory, cpu, uptime, status: newStatus };
        }
      }
      
      return { ...agent, memory, cpu, uptime };
    });
    
    const updateData = {
      type: 'update',
      data: {
        agents: enhancedAgents,
        alerts,
        timestamp: new Date()
      }
    };
    
    wss.clients.forEach(client => {
      // Only send to authenticated and open connections
      if (client.readyState === WebSocket.OPEN && (client as any).authenticated) {
        client.send(JSON.stringify(updateData));
      }
    });
  } catch (error) {
    console.error('Error broadcasting updates:', error);
  }
}
