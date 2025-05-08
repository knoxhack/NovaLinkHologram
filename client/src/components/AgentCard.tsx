import { useState } from "react";
import { cn, statusToColor, formatStatus, formatUptime } from "@/lib/utils";
import { Agent, AgentType } from "@shared/schema";

interface AgentCardProps {
  agent: Agent;
  agentType?: AgentType;
  hasAlert?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  inactive?: boolean;
}

export default function AgentCard({
  agent,
  agentType,
  hasAlert,
  isSelected,
  onSelect,
  inactive = false
}: AgentCardProps) {
  const { name, status, projectId, memory, uptime = 0 } = agent;
  const [isHovering, setIsHovering] = useState(false);
  
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      clock: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      rocket: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      database: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      eye: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      robot: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      calendar: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    };
    
    return iconMap[iconName] || (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    );
  };

  // Dynamic background color based on status
  const getBgGradient = () => {
    if (inactive) return 'linear-gradient(145deg, rgba(26, 33, 56, 0.7), rgba(18, 24, 42, 0.7))';
    
    if (status === 'active') {
      return `linear-gradient(145deg, rgba(26, 33, 56, 0.8), rgba(18, 24, 42, 0.8)), 
              linear-gradient(90deg, ${agentType?.color || '#3772FF'}15, transparent),
              repeating-linear-gradient(110deg, transparent, transparent 5px, ${agentType?.color || '#3772FF'}05 5px, ${agentType?.color || '#3772FF'}05 7px)`;
    }
    
    if (status === 'processing') {
      return `linear-gradient(145deg, rgba(26, 33, 56, 0.8), rgba(18, 24, 42, 0.8)), 
              linear-gradient(90deg, ${agentType?.color || '#3772FF'}20, transparent),
              repeating-linear-gradient(110deg, transparent, transparent 5px, ${agentType?.color || '#3772FF'}08 5px, ${agentType?.color || '#3772FF'}08 7px)`;
    }
    
    if (status === 'awaiting_input') {
      return `linear-gradient(145deg, rgba(26, 33, 56, 0.8), rgba(18, 24, 42, 0.8)), 
              linear-gradient(90deg, rgba(255, 204, 0, 0.15), transparent),
              repeating-linear-gradient(110deg, transparent, transparent 5px, rgba(255, 204, 0, 0.05) 5px, rgba(255, 204, 0, 0.05) 7px)`;
    }
    
    return 'linear-gradient(145deg, rgba(26, 33, 56, 0.7), rgba(18, 24, 42, 0.7))';
  };
  
  // Dynamic border based on selection and alert status
  const getBorderStyle = () => {
    if (isSelected) {
      return `2px solid ${agentType?.color || 'hsl(var(--primary))'}`; 
    }
    
    if (hasAlert) {
      return '1px solid rgba(255, 45, 85, 0.4)';
    }
    
    return '1px solid rgba(55, 114, 255, 0.2)';
  };

  return (
    <div 
      className={cn(
        "agent-card rounded-lg p-3 cursor-pointer relative overflow-hidden transition-all duration-300",
        isSelected && "shadow-glow",
        inactive && "opacity-70 hover:opacity-100 transition-opacity"
      )}
      style={{ 
        background: getBgGradient(),
        border: getBorderStyle(),
        boxShadow: isSelected ? `0 0 15px rgba(${agentType?.color ? agentType.color.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ') : '12, 255, 225'}, 0.2)` : 'none'
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Cyberpunk-style decorative elements */}
      <div className="absolute -right-1 bottom-1 text-[8px] opacity-30 font-mono transform rotate-90 pointer-events-none select-none">
        {agent.id.toString().padStart(3, '0')}-{Math.floor(Math.random() * 999).toString().padStart(3, '0')}
      </div>
      
      {/* Circuit-like lines in background */}
      <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-10">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 32H12M52 32H64M32 64V52M32 12V0" 
                stroke={agentType?.color || '#3772FF'} strokeWidth="1" />
          <path d="M20 44L24 48L28 44M36 44L40 48L44 44M12 32A20 20 0 0 1 32 12M52 32A20 20 0 0 1 32 52" 
                stroke={agentType?.color || '#3772FF'} strokeWidth="1" />
        </svg>
      </div>
      
      {/* Alert indicator with enhanced animation */}
      {hasAlert && (
        <>
          <div className="absolute -right-1 -top-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center alert-icon z-10">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="absolute -right-1 -top-1 w-10 h-10 rounded-full border border-destructive animate-ping-slow opacity-30 pointer-events-none"></div>
        </>
      )}
      
      {/* Processing animation - only show for processing status */}
      {status === 'processing' && (
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="w-full h-1 bg-accent absolute top-0 animate-scanner"></div>
        </div>
      )}
      
      {/* Awaiting animation - only show for awaiting_input status */}
      {status === 'awaiting_input' && (
        <>
          <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full mr-1 mt-1 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full border border-yellow-400/20 rounded-lg"></div>
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-yellow-400/20 to-transparent animate-scan-x"></div>
          </div>
        </>
      )}
      
      <div className="relative z-1">
        {/* Agent main info */}
        <div className="flex items-center">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${isHovering ? 'scale-110' : ''}`}
            style={{ 
              backgroundColor: agentType ? `${agentType.color}20` : '#3772FF20',
              color: agentType?.color || '#3772FF',
              boxShadow: `0 0 10px ${agentType?.color || '#3772FF'}30`
            }}
          >
            {agentType ? getIcon(agentType.icon) : getIcon('robot')}
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium">{name}</h3>
            
            {/* Project ID */}
            <div className="text-xs text-gray-400 mb-1">
              Project: {projectId}
            </div>
            
            <div className="flex items-center justify-between">
              {/* Status badge */}
              <span className={`text-xs ${statusToColor(status)} rounded-full px-2 py-0.5 inline-flex items-center`}>
                {status === 'processing' && (
                  <span className="mr-1 block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                )}
                {status === 'awaiting_input' && (
                  <span className="mr-1 block w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                )}
                {formatStatus(status)}
              </span>
              
              {/* Only show metrics for active agents */}
              {(status !== 'stopped' && status !== 'error') && (
                <div className="text-xs text-gray-400">
                  {uptime > 0 && formatUptime(uptime)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Agent metrics - only show when hovering or selected */}
        {(isHovering || isSelected) && status !== 'stopped' && (
          <div className="mt-2 pt-2 border-t border-accent/10 grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Memory: {memory ? `${memory}MB` : 'N/A'}
            </div>
            
            {agentType && (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Type: {agentType.name}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
