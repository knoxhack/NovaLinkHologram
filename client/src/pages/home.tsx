import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import AgentCard from "@/components/AgentCard";
import AgentDetails from "@/components/AgentDetails";
import AgentLogs from "@/components/AgentLogs";
import Hologram from "@/components/Hologram";
import CommandInput from "@/components/CommandInput";
import AuthPrompt from "@/components/AuthPrompt";
import { useAgents } from "@/hooks/useAgents";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Agent, AgentType, Alert } from "@shared/schema";
import { createWebSocketConnection, speak, isAuthenticated } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [spokenText, setSpokenText] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isAnalysisMode, setIsAnalysisMode] = useState<boolean>(false);
  const hologramRef = useRef<any>(null);
  const { toast } = useToast();
  
  const { 
    agents, 
    agentTypes, 
    alerts,
    isLoading,
    refetchAgents 
  } = useAgents();
  
  // Set initial selected agent (ChronoCore) once data is loaded
  useEffect(() => {
    if (agents?.length && !selectedAgentId) {
      // Find ChronoCore agent with ID 1
      const chronoCore = agents.find(agent => agent.id === 1);
      if (chronoCore) {
        setSelectedAgentId(chronoCore.id);
      } else {
        setSelectedAgentId(agents[0].id);
      }
    }
  }, [agents, selectedAgentId]);
  
  // Get authentication status
  const { isAuthenticated: userIsAuth, isLoading: authLoading, user } = useAuth();
  
  // Setup WebSocket connection when authenticated
  useEffect(() => {
    // Only set up WebSocket if authenticated
    if (!userIsAuth) {
      console.log('Not creating WebSocket - user not authenticated');
      return;
    }
    
    const ws = createWebSocketConnection();
    
    // If ws is null (user not authenticated), don't try to set up
    if (!ws) {
      return;
    }
    
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setSocket(ws);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'update') {
          // Trigger a refetch of the agents data
          refetchAgents();
          
          // Check for alerts
          const unresolved = data.data.alerts?.some((a: Alert) => !a.resolved);
          setShowAlert(unresolved);
          
          // If there's an alert, have Nova speak
          if (unresolved && !showAlert) {
            const alert = data.data.alerts.find((a: Alert) => !a.resolved);
            if (alert) {
              const agent = data.data.agents.find((a: Agent) => a.id === alert.agentId);
              if (agent) {
                const alertText = `Alert from Agent ${agent.name}. ${alert.message}`;
                setSpokenText(alertText);
                speak(alertText);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code}`);
      setSocket(null);
      
      // If it's an authentication issue, don't try to reconnect
      if (event.code === 1008) {
        console.log('WebSocket connection closed due to authentication issue');
        // Potentially redirect to login or show a message
      }
    };
    
    // Listen for WebSocket reconnection events
    const handleReconnection = (e: any) => {
      if (e.detail && e.detail.socket) {
        console.log('Reconnected to WebSocket server');
        setSocket(e.detail.socket);
      }
    };
    
    window.addEventListener('websocket-reconnected', handleReconnection);
    
    return () => {
      if (ws) ws.close();
      window.removeEventListener('websocket-reconnected', handleReconnection);
    };
  }, [refetchAgents, showAlert, userIsAuth]);
  
  // Find the selected agent
  const selectedAgent = agents?.find(agent => agent.id === selectedAgentId) || null;
  
  // Get agent alerts
  const agentAlerts = alerts?.filter(alert => 
    selectedAgentId ? alert.agentId === selectedAgentId : true
  );
  
  // Calculate active agent count
  const activeAgentCount = agents?.filter(a => 
    a.status === 'active' || a.status === 'processing' || a.status === 'awaiting_input'
  ).length || 0;
  
  // Handle agent selection
  const handleSelectAgent = (agentId: number) => {
    setSelectedAgentId(agentId);
  };
  
  // Handle command submission
  const handleCommandSubmit = (command: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !selectedAgentId) return;
    
    // Advanced command handling with special commands
    const lowerCommand = command.toLowerCase();
    
    // Check for special commands that trigger hologram modes
    if (lowerCommand.includes("analyze") || lowerCommand.includes("diagnostic") || lowerCommand.includes("scan")) {
      // Trigger analysis mode
      setIsAnalysisMode(true);
      const response = "Running complete system diagnostics on all active agents. Initial scan shows all systems operational. Analysis mode activated.";
      setSpokenText(response);
      
      // Access the hologram's triggerAnalysis method through the ref
      if (hologramRef.current && hologramRef.current.triggerAnalysis) {
        hologramRef.current.triggerAnalysis();
      }
      
      toast({
        title: "Analysis Mode",
        description: "System diagnostics initiated. Running comprehensive scan on all agents.",
        className: "toast-accent",
      });
      
      return;
    }
    
    // Check for help command
    if (lowerCommand === "help" || lowerCommand === "commands") {
      const helpText = "Available commands: status, alert, deploy/schedule, analyze/scan, and help. You can also ask about specific agents by name.";
      setSpokenText(helpText);
      
      toast({
        title: "Help",
        description: "Showing available commands in the hologram display",
      });
      
      return;
    }
    
    // Send the command to the server for regular commands
    socket.send(JSON.stringify({
      type: 'command',
      agentId: selectedAgentId,
      command
    }));
    
    // Update the spoken text
    setSpokenText(`Processing your command: ${command}`);
    
    // Show toast notification
    toast({
      title: "Command Sent",
      description: `Command "${command}" sent to agent ${selectedAgent?.name || 'Unknown'}`,
    });
    
    // If analysis mode was active, turn it off
    if (isAnalysisMode) {
      setIsAnalysisMode(false);
    }
  };
  
  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary font-display text-2xl flex items-center">
          <span className="text-secondary">Nova</span>
          <span className="text-primary">Link</span>
          <div className="ml-2 h-2 w-2 bg-primary rounded-full animate-pulse-slow"></div>
        </div>
      </div>
    );
  }
  
  // Note: Home is already wrapped in a ProtectedRoute in App.tsx
  // which handles redirection to login if not authenticated
  // This check is just a fallback for extra security
  if (!userIsAuth && !authLoading) {
    return null;
  }
  
  // Main content - authenticated users only
  return (
    <div className="flex flex-col h-screen overflow-hidden grid-bg">
      {/* Header */}
      <Header 
        activeAgentCount={activeAgentCount} 
        alertCount={alerts?.filter(a => !a.resolved).length || 0}
      />
      
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Agent List */}
        <div className="w-64 border-r border-accent/20 bg-card/80 overflow-y-auto py-4 flex flex-col">
          <div className="px-4 mb-3">
            <h2 className="font-display text-lg text-primary mb-2">Agent Network</h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search agents..." 
                className="w-full bg-surface-light border border-accent/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-white placeholder-gray-500" 
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="px-4 mb-2 flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-gray-400">Active Agents</span>
            <button className="text-xs text-primary hover:text-secondary transition-colors">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-3 w-3 inline mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort
            </button>
          </div>
          
          {/* Agent Cards */}
          <div className="space-y-2 px-3 overflow-y-auto">
            {agents
              ?.filter(agent => agent.status !== 'stopped')
              .map(agent => {
                const agentType = agentTypes?.find(type => type.id === agent.typeId);
                const hasAlert = alerts?.some(alert => 
                  alert.agentId === agent.id && !alert.resolved
                );
                
                return (
                  <AgentCard 
                    key={agent.id}
                    agent={agent}
                    agentType={agentType}
                    hasAlert={hasAlert}
                    isSelected={agent.id === selectedAgentId}
                    onSelect={() => handleSelectAgent(agent.id)}
                  />
                );
              })}
              
            <div className="pt-2 pb-1">
              <span className="text-xs uppercase tracking-wider text-gray-400 px-1">Inactive Agents</span>
            </div>
            
            {agents
              ?.filter(agent => agent.status === 'stopped')
              .map(agent => {
                const agentType = agentTypes?.find(type => type.id === agent.typeId);
                
                return (
                  <AgentCard 
                    key={agent.id}
                    agent={agent}
                    agentType={agentType}
                    hasAlert={false}
                    isSelected={agent.id === selectedAgentId}
                    onSelect={() => handleSelectAgent(agent.id)}
                    inactive
                  />
                );
              })}
          </div>
        </div>
        
        {/* Center Area - Hologram */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <Hologram 
              ref={hologramRef}
              showAlert={showAlert}
              spokenText={spokenText}
            />
          </div>
          
          {/* Command Input */}
          <CommandInput 
            onSubmit={handleCommandSubmit}
            onVoiceActivityChange={(isActive, transcript) => {
              // When voice recognition becomes active, make hologram react
              if (hologramRef.current) {
                if (isActive) {
                  // Update hologram when voice recognition starts
                  hologramRef.current.updateSpeaking(false);
                  // Show transcript in spoken text area if available
                  if (transcript) {
                    setSpokenText(`Listening: ${transcript}`);
                  }
                } else {
                  // Reset hologram state when voice recognition ends
                  setSpokenText("");
                }
              }
            }}
          />
        </div>
        
        {/* Right Sidebar - Details & Logs */}
        <div className="w-96 border-l border-accent/20 bg-card/80 flex flex-col overflow-hidden">
          {/* Agent Details */}
          {selectedAgent && (
            <AgentDetails 
              agent={selectedAgent} 
              agentType={agentTypes?.find(type => type.id === selectedAgent.typeId)}
            />
          )}
          
          {/* Agent Logs */}
          <AgentLogs 
            agentId={selectedAgentId}
            onSubmitResponse={handleCommandSubmit}
          />
        </div>
      </main>
    </div>
  );
}
