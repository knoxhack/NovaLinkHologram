import { Agent, AgentType } from "@shared/schema";
import { formatUptime, formatMemoryUsage } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AgentDetailsProps {
  agent: Agent;
  agentType?: AgentType;
}

export default function AgentDetails({ agent, agentType }: AgentDetailsProps) {
  const queryClient = useQueryClient();
  
  const { mutate: updateAgentStatus, isPending } = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest('PATCH', `/api/agents/${agent.id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    }
  });
  
  const getAgentIcon = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      clock: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>,
      rocket: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>,
      database: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>,
      eye: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>,
      robot: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>,
      calendar: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
    };
    
    return iconMap[iconName] || (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    );
  };
  
  const statusColorMap: Record<string, string> = {
    active: "text-green-400 bg-green-500/20",
    idle: "text-blue-400 bg-blue-500/20",
    processing: "text-orange-400 bg-orange-500/20",
    awaiting_input: "text-red-400 bg-red-500/20",
    stopped: "text-gray-400 bg-gray-500/20",
    error: "text-red-400 bg-red-500/20"
  };
  
  const statusDisplay = agent.status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const handleResume = () => {
    updateAgentStatus('active');
  };
  
  const handlePause = () => {
    updateAgentStatus('idle');
  };
  
  const handleRestart = () => {
    // First stop the agent
    updateAgentStatus('stopped');
    
    // Then after a brief delay, start it again
    setTimeout(() => {
      updateAgentStatus('active');
    }, 1000);
  };

  return (
    <div className="p-4 border-b border-accent/20">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-secondary">Agent Details</h2>
        <button className="text-accent hover:text-primary transition-colors text-sm">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 inline-block mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      <div className="bg-card rounded-lg p-3 border border-accent/20">
        <div className="flex items-center mb-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ 
              backgroundColor: agentType ? `${agentType.color}20` : '#3772FF20',
              color: agentType?.color || '#3772FF' 
            }}
          >
            {agentType && getAgentIcon(agentType.icon)}
          </div>
          <div>
            <h3 className="font-medium">{agent.name}</h3>
            <p className="text-xs text-gray-400">Project: {agent.projectId}</p>
          </div>
          <div className="ml-auto">
            <span className={`text-xs ${statusColorMap[agent.status] || 'bg-gray-500/20 text-gray-400'} rounded px-2 py-1`}>
              {statusDisplay}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-card border border-border rounded p-2">
            <span className="text-gray-400">Status:</span>
            <span className="text-white ml-1">{agent.status === 'stopped' ? 'Stopped' : 'Running'}</span>
          </div>
          <div className="bg-card border border-border rounded p-2">
            <span className="text-gray-400">Uptime:</span>
            <span className="text-white ml-1">{formatUptime(agent.uptime)}</span>
          </div>
          <div className="bg-card border border-border rounded p-2">
            <span className="text-gray-400">Memory:</span>
            <span className="text-white ml-1">{formatMemoryUsage(agent.memory)}</span>
          </div>
          <div className="bg-card border border-border rounded p-2">
            <span className="text-gray-400">CPU:</span>
            <span className="text-white ml-1">{agent.cpu}%</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="flex-1 bg-card hover:bg-accent/20 text-white text-xs py-2 rounded transition-colors border border-border"
            onClick={handleResume}
            disabled={isPending || agent.status === 'active'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 inline-block mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resume
          </button>
          <button 
            className="flex-1 bg-card hover:bg-destructive/20 text-white text-xs py-2 rounded transition-colors border border-border"
            onClick={handlePause}
            disabled={isPending || agent.status === 'idle' || agent.status === 'stopped'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 inline-block mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pause
          </button>
          <button 
            className="flex-1 bg-card hover:bg-secondary/20 text-white text-xs py-2 rounded transition-colors border border-border"
            onClick={handleRestart}
            disabled={isPending || agent.status === 'stopped'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 inline-block mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
