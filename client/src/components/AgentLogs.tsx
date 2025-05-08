import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatTime } from "@/lib/utils";

interface AgentLogsProps {
  agentId: number | null;
  onSubmitResponse: (response: string) => void;
}

export default function AgentLogs({ agentId, onSubmitResponse }: AgentLogsProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'logs'>('chat');
  const [response, setResponse] = useState('');
  const logsRef = useRef<HTMLDivElement>(null);
  
  // Query to get agent messages
  const { data: messages, isLoading } = useQuery({
    queryKey: agentId ? [`/api/agents/${agentId}/messages`] : null,
    enabled: !!agentId
  });
  
  // Query to get agent alerts
  const { data: alerts } = useQuery({
    queryKey: agentId ? [`/api/agents/${agentId}/alerts`] : null,
    enabled: !!agentId
  });
  
  // Find unresolved alerts
  const hasUnresolvedAlert = alerts?.some((alert: any) => !alert.resolved);
  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleTabChange = (tab: 'chat' | 'logs') => {
    setActiveTab(tab);
  };
  
  const handleSubmitResponse = () => {
    if (!response.trim()) return;
    
    onSubmitResponse(response);
    setResponse('');
  };
  
  // Handle enter key in textarea
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitResponse();
    }
  };
  
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM':
        return (
          <div className="text-primary">[SYSTEM]</div>
        );
      case 'INFO':
        return (
          <div className="text-accent">[INFO]</div>
        );
      case 'TASK':
        return (
          <div className="text-secondary">[TASK]</div>
        );
      case 'AGENT':
        return (
          <div className="flex items-start mb-1">
            <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center mr-2 mt-0.5">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-3 w-3 text-secondary" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-white text-xs">Agent</span>
              <span className="text-gray-400 text-xs ml-2">{formatTime(new Date(messages?.timestamp))}</span>
            </div>
          </div>
        );
      case 'USER':
        return (
          <div className="flex items-start mb-1">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mr-2 mt-0.5">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-3 w-3 text-accent" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-white text-xs">You</span>
              <span className="text-gray-400 text-xs ml-2">{formatTime(new Date(messages?.timestamp))}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  if (!agentId) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-6 text-gray-400">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 mb-2 text-accent/30" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>Select an agent to view communication logs</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-accent/20 flex justify-between items-center">
        <h3 className="font-medium">Agent Communication</h3>
        <div className="flex space-x-2">
          <button 
            className={`text-xs ${activeTab === 'chat' ? 'bg-accent/20' : 'bg-card'} px-2 py-1 rounded text-white hover:bg-accent/20 transition-colors border border-border`}
            onClick={() => handleTabChange('chat')}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 inline-block mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </button>
          <button 
            className={`text-xs ${activeTab === 'logs' ? 'bg-accent/20' : 'bg-card'} px-2 py-1 rounded text-white hover:bg-accent/20 transition-colors border border-border`}
            onClick={() => handleTabChange('logs')}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 inline-block mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Logs
          </button>
        </div>
      </div>
      
      <div ref={logsRef} className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-primary">Loading messages...</div>
          </div>
        ) : messages?.length > 0 ? (
          messages.map((message: any) => {
            const messageDate = new Date(message.timestamp);
            
            if (message.type === 'SYSTEM' || message.type === 'INFO' || message.type === 'TASK') {
              return (
                <div key={message.id} className="bg-card/50 p-2 rounded border-l-2" style={{ borderColor: message.type === 'SYSTEM' ? 'hsl(var(--primary))' : message.type === 'INFO' ? 'hsl(var(--accent))' : 'hsl(var(--secondary))' }}>
                  {getMessageIcon(message.type)} {message.content}
                </div>
              );
            } else if (message.type === 'AGENT') {
              return (
                <div key={message.id} className="bg-card/70 p-2 rounded">
                  <div className="flex items-start mb-1">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center mr-2 mt-0.5">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3 w-3 text-secondary" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-white text-xs">Agent</span>
                      <span className="text-gray-400 text-xs ml-2">{formatTime(messageDate)}</span>
                    </div>
                  </div>
                  <p className="pl-8">{message.content}</p>
                </div>
              );
            } else if (message.type === 'USER') {
              return (
                <div key={message.id} className="bg-accent/10 p-2 rounded">
                  <div className="flex items-start mb-1">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mr-2 mt-0.5">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3 w-3 text-accent" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-white text-xs">You</span>
                      <span className="text-gray-400 text-xs ml-2">{formatTime(messageDate)}</span>
                    </div>
                  </div>
                  <p className="pl-8">{message.content}</p>
                </div>
              );
            }
            
            return null;
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No messages available
          </div>
        )}
        
        {hasUnresolvedAlert && (
          <div className="bg-destructive/10 p-2 rounded border border-destructive/30">
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center mr-2 mt-0.5">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3 w-3 text-destructive" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-destructive">Agent is awaiting your input. Please respond to continue with operations.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Response Input */}
      <div className="p-3 border-t border-accent/20">
        <div className="flex space-x-2">
          <div className="flex-1">
            <textarea 
              placeholder="Type your response to agent..." 
              rows={2} 
              className="w-full bg-card border border-accent/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-white resize-none"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              onKeyDown={handleKeyDown}
            ></textarea>
          </div>
          <div className="flex flex-col space-y-2">
            <button 
              className="bg-primary hover:bg-primary/80 text-black font-medium px-3 py-2 rounded transition-colors"
              onClick={handleSubmitResponse}
              disabled={!response.trim()}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
            <button className="bg-card hover:bg-accent/20 text-white px-3 py-2 rounded transition-colors border border-border">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Quick responses:</span>
          <div className="flex space-x-2">
            <button 
              className="text-primary hover:text-primary/80 transition-colors"
              onClick={() => onSubmitResponse("Proceed")}
            >
              Proceed
            </button>
            <button 
              className="text-primary hover:text-primary/80 transition-colors"
              onClick={() => onSubmitResponse("Reschedule")}
            >
              Reschedule
            </button>
            <button 
              className="text-primary hover:text-primary/80 transition-colors"
              onClick={() => onSubmitResponse("More info")}
            >
              More info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
