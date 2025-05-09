import { useState, useEffect, useCallback, useRef } from "react";
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
  const manuallyStoppedRef = useRef(false);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Use the correct version depending on browser support
      const SpeechRecognitionConstructor = 
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionConstructor();
      
      // Configure recognition
      recognitionInstance.continuous = true; // Enable continuous listening
      recognitionInstance.interimResults = true; // Enable interim results for real-time feedback
      recognitionInstance.maxAlternatives = 1; // Only need one alternative
      recognitionInstance.lang = 'en-US';
      
      // Set up event handlers
      recognitionInstance.onstart = (event: Event) => {
        setIsListening(true);
        setError(null);
      };
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcription = event.results[current][0].transcript;
        
        // Update the transcript state for UI feedback
        setTranscript(transcription);
        
        // Check if this is a final result (not interim)
        const isFinal = !recognitionInstance.interimResults || 
                       current === event.results.length - 1;
        
        if (isFinal) {
          // Process command when the user has finished speaking
          processCommand(transcription);
          
          // Restart recognition after processing the command
          // This ensures continuous listening works properly
          if (recognitionInstance.continuous) {
            setTimeout(() => {
              try {
                recognitionInstance.stop();
                // Auto-restart after brief pause
                setTimeout(() => {
                  if (recognition) {
                    recognition.start();
                  }
                }, 300);
              } catch (e) {
                // Ignore errors when stopping
              }
            }, 1000);
          }
        }
      };
      
      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Only set certain errors - ignore no-speech errors which are common
        if (event.error !== 'no-speech') {
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please enable microphone permissions.');
          } else if (event.error === 'network') {
            setError('Network error occurred. Check your connection.');
          } else {
            setError(`Speech recognition error: ${event.error}`);
          }
        }
        setIsListening(false);
      };
      
      recognitionInstance.onend = (event: Event) => {
        setIsListening(false);
        
        // Auto-restart for continuous mode, but not if manually stopped
        if (recognitionInstance.continuous && !manuallyStoppedRef.current) {
          try {
            setTimeout(() => {
              if (recognition) {
                recognition.start();
                setIsListening(true);
              }
            }, 500);
          } catch (e) {
            console.error("Error restarting speech recognition:", e);
          }
        }
        
        // Reset manual stop flag
        manuallyStoppedRef.current = false;
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
        speak(`Processing command: ${actualCommand}`, {
          rate: 1.1,  // Slightly faster rate for acknowledgment
          onEnd: () => {
            // When done acknowledging, we're ready for the next interaction
            console.log('Voice feedback completed');
          }
        });
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
      // Set the flag to prevent auto-restart
      manuallyStoppedRef.current = true;
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

// Type definitions for SpeechRecognition API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal?: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start(): void;
  stop(): void;
  abort(): void;
}

// Add type definition for browsers that don't have it
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
