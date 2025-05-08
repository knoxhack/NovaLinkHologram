import { useState, useEffect } from 'react';

interface HeaderProps {
  activeAgentCount: number;
}

export default function Header({ activeAgentCount }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(true);
  
  return (
    <header className="bg-card border-b border-accent/30 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="text-primary font-display font-bold text-2xl flex items-center">
          <span className="text-secondary">Nova</span>
          <span className="text-primary">Link</span>
          <div className="ml-2 h-2 w-2 bg-primary rounded-full animate-pulse-slow"></div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm px-3 py-1 rounded-full bg-card border border-accent/20 flex items-center">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} mr-2`}></div>
          <span>{isConnected ? 'Connected to Replit API' : 'Disconnected'}</span>
        </div>
        
        <div className="text-sm px-3 py-1 rounded-full bg-card border border-accent/20">
          {activeAgentCount} Agents Active
        </div>
        
        <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-primary/40">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
    </header>
  );
}
