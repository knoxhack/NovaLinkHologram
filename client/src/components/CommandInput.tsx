import { useState, useRef, useEffect } from "react";

interface CommandInputProps {
  onSubmit: (command: string) => void;
}

export default function CommandInput({ onSubmit }: CommandInputProps) {
  const [command, setCommand] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Function to handle command submission
  const handleSubmit = () => {
    if (!command.trim()) return;
    
    onSubmit(command);
    setCommand("");
  };
  
  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };
  
  // Function to activate voice recognition (mock for now)
  const activateVoice = () => {
    // Focus the input and add a placeholder to simulate voice input
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.placeholder = "Listening...";
      
      // After a brief delay, restore the original placeholder
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.placeholder = "Type a command or speak using 'Nova, [command]'...";
        }
      }, 3000);
    }
  };
  
  return (
    <div className="bg-card border-t border-accent/30 p-4">
      <div className="max-w-3xl mx-auto flex items-center space-x-3">
        <button 
          className="bg-primary/10 hover:bg-primary/20 transition-colors text-primary p-2 rounded-full"
          onClick={activateVoice}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        
        <div className="flex-1 relative">
          <input 
            type="text" 
            ref={inputRef}
            placeholder="Type a command or speak using 'Nova, [command]'..." 
            className="w-full bg-card border border-accent/30 rounded-full px-4 py-3 pr-10 focus:outline-none focus:border-primary text-white"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
            onClick={handleSubmit}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        <button className="bg-accent/10 hover:bg-accent/20 transition-colors text-accent p-2 rounded-full">
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
      </div>
    </div>
  );
}
