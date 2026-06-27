import { api } from "@/services/api";

export const dashboardService = {
  incidents: api.incidents,
  logs: api.logs
};
