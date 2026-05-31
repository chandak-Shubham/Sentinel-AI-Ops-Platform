import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export function useTeams() {
  return useQuery({ queryKey: ["teams"], queryFn: api.teams });
}

export function useRoles(teamId?: number) {
  return useQuery({
    queryKey: ["roles", teamId],
    queryFn: () => api.rolesByTeam(teamId as number),
    enabled: Boolean(teamId)
  });
}

export function useIncidents() {
  return useQuery({ queryKey: ["incidents"], queryFn: api.incidents });
}

export function useIncidentTimeline(incidentId?: number) {
  return useQuery({
    queryKey: ["incident-timeline", incidentId],
    queryFn: () => api.incidentTimeline(incidentId as number),
    enabled: Boolean(incidentId)
  });
}

export function useLogs() {
  return useQuery({ queryKey: ["logs"], queryFn: api.logs });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createIncident,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["incidents"] })
  });
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateIncidentStatus,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident-timeline", variables.incidentId] });
    }
  });
}
