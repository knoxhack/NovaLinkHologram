import { useState, useEffect, useCallback } from "react";
import { speak } from "@/lib/utils";

type CommandCallback = (command: string) => void;

interface VoiceCommandOptions {
  requireWakeWord?: boolean;
  voiceFeedback?: boolean;
}

export function useVoiceCommands(
  onCommand: CommandCallback, 
  options: VoiceCommandOptions = { requireWakeWord: true, voiceFeedback: true }
) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Use the correct version depending on browser support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Configure recognition
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      // Set up event handlers
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setError(null);
      };
      
      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const transcription = event.results[current][0].transcript;
        setTranscript(transcription);
        
        // Process command
        processCommand(transcription);
      };
      
      recognitionInstance.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      setError("Speech recognition not supported in this browser");
    }
    
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);
  
  // Process received commands
  const processCommand = useCallback((rawCommand: string) => {
    const command = rawCommand.toLowerCase().trim();
    
    // Check if command starts with wake word "nova" (if required)
    const hasWakeWord = command.startsWith("nova") || command.startsWith("nova,");
    
    if (!options.requireWakeWord || hasWakeWord) {
      // Extract actual command, removing wake word if present
      const actualCommand = hasWakeWord 
        ? command.replace(/^nova,?\s*/i, "").trim() 
        : command;
      
      // Provide voice feedback if enabled
      if (options.voiceFeedback) {
        speak(`Processing command: ${actualCommand}`);
      }
      
      // Call the provided callback with the command
      onCommand(actualCommand);
    } else {
      // Wake word required but not provided
      setError("Voice command must start with wake word 'Nova'");
    }
  }, [onCommand, options.requireWakeWord, options.voiceFeedback]);
  
  // Start listening
  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (err) {
        setError("Failed to start voice recognition. It might already be running.");
      }
    } else if (!recognition) {
      setError("Speech recognition not initialized");
    }
  }, [recognition, isListening]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);
  
  // Mock function for development without browser speech recognition
  const mockVoiceCommand = useCallback((mockCommand: string) => {
    setTranscript(mockCommand);
    processCommand(mockCommand);
  }, [processCommand]);
  
  return {
    startListening,
    stopListening,
    isListening,
    transcript,
    error,
    mockVoiceCommand
  };
}

// Add type definition for browsers that don't have it
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
