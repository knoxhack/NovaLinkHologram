import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

interface CommandInputProps {
  onSubmit: (command: string) => void;
}

export default function CommandInput({ onSubmit }: CommandInputProps) {
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Use the voice commands hook with current settings
  const { 
    startListening, 
    isListening, 
    transcript, 
    error 
  } = useVoiceCommands((voiceCommand) => {
    // When a voice command is received, submit it
    handleVoiceCommand(voiceCommand);
  }, { requireWakeWord: wakeWordEnabled, voiceFeedback: voiceFeedbackEnabled });
  
  // Handle voice commands
  const handleVoiceCommand = (voiceCommand: string) => {
    setCommand(voiceCommand);
    setTimeout(() => {
      handleSubmit(voiceCommand);
    }, 300);
  };
  
  // Update placeholder when listening state changes
  useEffect(() => {
    if (inputRef.current) {
      if (isListening) {
        inputRef.current.placeholder = "Listening...";
      } else {
        inputRef.current.placeholder = "Type a command or speak using 'Nova, [command]'...";
      }
    }
  }, [isListening]);
  
  // Show toast notifications for errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Voice Recognition Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Function to handle command submission
  const handleSubmit = (customCommand?: string) => {
    const commandToSubmit = customCommand || command;
    if (!commandToSubmit.trim()) return;
    
    // Add to command history
    setCommandHistory(prev => [commandToSubmit, ...prev.slice(0, 9)]);
    setHistoryIndex(-1);
    
    // Send command to parent
    onSubmit(commandToSubmit);
    
    // Toast notification
    toast({
      title: "Command Sent",
      description: `Executing: ${commandToSubmit}`,
      className: "toast-default"
    });
    
    // Clear input if no custom command was provided
    if (!customCommand) {
      setCommand("");
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      // Navigate up through command history
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      // Navigate down through command history
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };
  
  // Function to activate voice recognition
  const activateVoice = () => {
    startListening();
  };
  
  // Quick command suggestions
  const quickCommands = [
    { text: "Proceed", description: "Approve waiting action" },
    { text: "Status", description: "Check system status" }, 
    { text: "Help", description: "Get assistance" },
    { text: "Analyze", description: "Run system diagnostics" },
    { text: "Deploy", description: "Deploy selected agent" }
  ];
  
  return (
    <div className="bg-card border-t border-accent/30 p-4">
      <div className="max-w-3xl mx-auto flex flex-col">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {isListening && (
              <div className="absolute -inset-1 rounded-full bg-accent/30 animate-ping"></div>
            )}
            <button 
              className={`${isListening ? 'bg-secondary text-white' : 'bg-primary/10 hover:bg-primary/20 text-primary'} transition-colors p-2 rounded-full relative z-10`}
              onClick={activateVoice}
              disabled={isListening}
              aria-label="Toggle voice recognition"
              title={isListening ? "Listening for voice commands..." : "Click to activate voice recognition"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 relative">
            <div className="relative w-full">
              <input 
                type="text" 
                ref={inputRef}
                placeholder="Type a command or speak using 'Nova, [command]'..." 
                className={`w-full bg-card border ${isListening ? 'border-accent' : 'border-accent/30'} rounded-full px-4 py-3 pr-10 focus:outline-none focus:border-primary text-white`}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {isListening && transcript && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-accent/80 text-white text-sm rounded-lg shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <p>{transcript}</p>
                  </div>
                </div>
              )}
            </div>
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
              onClick={() => handleSubmit()}
              disabled={!command.trim()}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ${!command.trim() && 'opacity-50'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          <div className="relative">
            <button 
              className={`${showSettings ? 'bg-accent/30 text-white' : 'bg-accent/10 text-accent'} hover:bg-accent/20 transition-colors p-2 rounded-full`}
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Command settings"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {showSettings && (
              <div className="absolute right-0 bottom-full mb-2 w-64 bg-card border border-accent/30 rounded-lg shadow-lg p-3 z-50">
                <h3 className="text-sm font-semibold text-accent mb-2">Voice Command Settings</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white">Require wake word "Nova"</label>
                    <button 
                      className={`w-9 h-5 rounded-full relative transition-colors ${wakeWordEnabled ? 'bg-accent' : 'bg-gray-600'}`}
                      onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
                    >
                      <span 
                        className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${wakeWordEnabled ? 'translate-x-4' : 'translate-x-1'}`} 
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white">Voice feedback</label>
                    <button 
                      className={`w-9 h-5 rounded-full relative transition-colors ${voiceFeedbackEnabled ? 'bg-accent' : 'bg-gray-600'}`}
                      onClick={() => setVoiceFeedbackEnabled(!voiceFeedbackEnabled)}
                    >
                      <span 
                        className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${voiceFeedbackEnabled ? 'translate-x-4' : 'translate-x-1'}`} 
                      />
                    </button>
                  </div>
                  
                  <div className="pt-2 border-t border-accent/10">
                    <button 
                      className="w-full text-center text-xs bg-accent/20 hover:bg-accent/30 text-accent py-1 px-2 rounded transition-colors"
                      onClick={() => setShowSettings(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Commands Bar */}
        <div className="flex justify-center mt-2 space-x-2">
          {quickCommands.map(cmd => (
            <button
              key={cmd.text}
              className="py-1 px-3 bg-primary/10 rounded-full text-xs hover:bg-primary/20 transition-colors group relative"
              onClick={() => {
                setCommand(cmd.text);
                setTimeout(() => handleSubmit(), 100);
              }}
            >
              {cmd.text}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-accent/90 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {cmd.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
