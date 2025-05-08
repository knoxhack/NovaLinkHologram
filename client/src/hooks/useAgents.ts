import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Agent, AgentType, Alert } from "@shared/schema";

export function useAgents() {
  const queryClient = useQueryClient();
  
  // Query for fetching agents
  const { 
    data: agents,
    isLoading: isAgentsLoading,
    isError: isAgentsError,
    error: agentsError,
    refetch: refetchAgents
  } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });
  
  // Query for fetching agent types
  const {
    data: agentTypes,
    isLoading: isAgentTypesLoading,
    isError: isAgentTypesError,
    error: agentTypesError
  } = useQuery<AgentType[]>({
    queryKey: ['/api/agent-types'],
  });
  
  // Query for fetching alerts
  const {
    data: alerts,
    isLoading: isAlertsLoading,
    isError: isAlertsError,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 3000, // Refresh alerts more frequently
  });
  
  // Combined loading state
  const isLoading = isAgentsLoading || isAgentTypesLoading || isAlertsLoading;
  
  // Combined error state
  const isError = isAgentsError || isAgentTypesError || isAlertsError;
  const error = agentsError || agentTypesError || alertsError;
  
  // Function to refetch all data
  const refetchAllData = () => {
    refetchAgents();
    refetchAlerts();
    // Note: No need to refetch agent types as they rarely change
  };
  
  // Get active agent count
  const activeAgentCount = agents?.filter(agent => 
    agent.status === 'active' || agent.status === 'processing' || agent.status === 'awaiting_input'
  ).length || 0;
  
  // Get unresolved alert count
  const unresolvedAlertCount = alerts?.filter(alert => !alert.resolved).length || 0;
  
  // Check if any agent needs attention (has unresolved alerts)
  const agentsNeedingAttention = alerts
    ?.filter(alert => !alert.resolved)
    .map(alert => alert.agentId) || [];
  
  return {
    agents,
    agentTypes,
    alerts,
    isLoading,
    isError,
    error,
    refetchAgents,
    refetchAlerts,
    refetchAllData,
    activeAgentCount,
    unresolvedAlertCount,
    agentsNeedingAttention
  };
}
