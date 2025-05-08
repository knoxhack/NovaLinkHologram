import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format uptime from seconds to human-readable format
export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// Format timestamp to time string
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

// Format memory usage
export function formatMemoryUsage(megabytes: number): string {
  if (megabytes < 1024) return `${megabytes} MB`;
  return `${(megabytes / 1024).toFixed(1)} GB`;
}

// Map status to color
export function statusToColor(status: string): string {
  const statusColorMap: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    idle: "bg-blue-500/20 text-blue-400",
    processing: "bg-orange-500/20 text-orange-400",
    awaiting_input: "bg-destructive/20 text-destructive",
    stopped: "bg-gray-500/20 text-gray-400",
    error: "bg-red-500/20 text-red-400"
  };
  
  return statusColorMap[status] || "bg-gray-500/20 text-gray-400";
}

// Format status text for display
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Create WebSocket connection based on environment
export function createWebSocketConnection(): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  return new WebSocket(wsUrl);
}

// Helper to get text-to-speech functionality
export function speak(text: string): void {
  // Use the Web Speech API for text-to-speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Try to get a female voice if available
  const voices = speechSynthesis.getVoices();
  const femaleVoice = voices.find(voice => 
    voice.name.toLowerCase().includes('female') ||
    voice.name.toLowerCase().includes('samantha')
  );
  
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}
