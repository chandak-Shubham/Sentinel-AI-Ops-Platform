import { api } from "@/services/api";

export const incidentService = {
  list: api.incidents,
  get: api.incident,
  create: api.createIncident,
  update: api.updateIncident,
  updateStatus: api.updateIncidentStatus,
  resolve: api.resolveIncident,
  delete: api.deleteIncident,
  timeline: api.incidentTimeline
};
