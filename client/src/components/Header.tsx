import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import AuthStatus from './AuthStatus';

interface HeaderProps {
  activeAgentCount: number;
  alertCount?: number;
}

export default function Header({ activeAgentCount, alertCount = 0 }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { toast } = useToast();
  
  // Add pulse animation to notification bell when there are alerts
  useEffect(() => {
    if (alertCount > 0 && !isNotificationOpen) {
      const interval = setInterval(() => {
        // Flash notification every 10 seconds if there are unread alerts
        toast({
          title: "Agent Alert",
          description: `${alertCount} unresolved ${alertCount === 1 ? 'alert' : 'alerts'} require your attention.`,
          className: "toast-error",
        });
      }, 30000); // Show every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [alertCount, isNotificationOpen, toast]);
  
  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };
  
  // Current time display
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time as HH:MM:SS
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  });
  
  // Format date as DD/MM/YYYY
  const formattedDate = currentTime.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return (
    <header className="bg-card/90 backdrop-blur-sm border-b border-accent/30 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        <div className="text-primary font-display font-bold text-2xl flex items-center">
          <span className="text-secondary">Nova</span>
          <span className="text-primary">Link</span>
          <div className="ml-2 h-2 w-2 bg-primary rounded-full animate-pulse-slow"></div>
        </div>
        
        {/* System time */}
        <div className="ml-6 text-xs text-gray-400 font-mono flex flex-col items-center">
          <div className="text-sm">{formattedTime}</div>
          <div className="text-xs">{formattedDate}</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Connection status */}
        <div className="text-sm px-3 py-1 rounded-full bg-card border border-accent/20 flex items-center">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} mr-2`}></div>
          <span>{isConnected ? 'Connected to Replit API' : 'Disconnected'}</span>
        </div>
        
        {/* Agent count */}
        <div className="text-sm px-3 py-1 rounded-full bg-card border border-accent/20">
          {activeAgentCount} Agent{activeAgentCount !== 1 ? 's' : ''} Active
        </div>
        
        {/* Notification bell */}
        <div className="relative">
          <button 
            className={`w-9 h-9 rounded-full bg-card flex items-center justify-center border ${alertCount > 0 ? 'border-destructive/70' : 'border-accent/30'} hover:bg-card/80 transition-colors relative`}
            onClick={toggleNotifications}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 ${alertCount > 0 ? 'text-destructive' : 'text-accent'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            
            {/* Notification counter */}
            {alertCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center alert-icon">
                {alertCount > 9 ? '9+' : alertCount}
              </div>
            )}
          </button>
          
          {/* Notification dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-card border border-accent/30 rounded-lg shadow-lg z-50 p-2 backdrop-blur-sm overflow-hidden">
              <div className="py-2 px-3 border-b border-accent/20 flex justify-between items-center">
                <h3 className="font-medium text-sm">Notifications</h3>
                <button className="text-xs text-accent hover:text-primary transition-colors">
                  Mark all as read
                </button>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {alertCount > 0 ? (
                  <div className="p-3 border-b border-accent/10 hover:bg-accent/5 transition-colors">
                    <div className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 mr-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Agent awaiting input</div>
                        <div className="text-xs text-gray-400">ChronoCore needs your input on deployment schedule</div>
                        <div className="text-xs text-gray-500 mt-1">5 minutes ago</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Auth Status Component */}
        <AuthStatus />
      </div>
    </header>
  );
}
