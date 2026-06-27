import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { incidentService } from "@/services/incident.service";
import { webhookService } from "@/services/webhookService";

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
  return useQuery({ queryKey: ["incidents"], queryFn: incidentService.list });
}

export function useIncident(incidentId?: number) {
  return useQuery({
    queryKey: ["incident", incidentId],
    queryFn: () => incidentService.get(incidentId as number),
    enabled: Boolean(incidentId)
  });
}

export function useIncidentTimeline(incidentId?: number) {
  return useQuery({
    queryKey: ["incident-timeline", incidentId],
    queryFn: () => incidentService.timeline(incidentId as number),
    enabled: Boolean(incidentId)
  });
}

export function useLogs() {
  return useQuery({ queryKey: ["logs"], queryFn: api.logs });
}

export function useWebhookLogs() {
  return useQuery({ queryKey: ["webhook-logs"], queryFn: webhookService.getWebhookLogs });
}

export function useWebhookLog(id?: number) {
  return useQuery({
    queryKey: ["webhook-log", id],
    queryFn: () => webhookService.getWebhookLog(id as number),
    enabled: Boolean(id)
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incidentService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["incidents"] })
  });
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incidentService.updateStatus,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", variables.incidentId] });
      queryClient.invalidateQueries({ queryKey: ["incident-timeline", variables.incidentId] });
    }
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incidentService.update,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", variables.incidentId] });
      queryClient.invalidateQueries({ queryKey: ["incident-timeline", variables.incidentId] });
    }
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incidentService.resolve,
    onSuccess: (_data, incidentId) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", incidentId] });
      queryClient.invalidateQueries({ queryKey: ["incident-timeline", incidentId] });
    }
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incidentService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["incidents"] })
  });
}
