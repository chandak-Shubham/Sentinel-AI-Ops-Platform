import type {
  CreateIncidentPayload,
  CreateUserPayload,
  CreateUserResponse,
  Incident,
  IncidentTimelineEntry,
  LogEntry,
  LoginPayload,
  Role,
  Team,
  TokenResponse,
  UpdateIncidentPayload,
  UpdateIncidentStatusPayload
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const WS_URL = API_BASE_URL.replace(/^http/, "ws").replace(/\/$/, "") + "/ws";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("sentinel_access_token");
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail ?? body.message ?? detail;
    } catch {
      detail = response.statusText;
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  login: (payload: LoginPayload) =>
    apiRequest<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createUser: (payload: CreateUserPayload) =>
    apiRequest<CreateUserResponse>("/auth/create-user", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  teams: () => apiRequest<Team[]>("/teams"),
  rolesByTeam: (teamId: number) => apiRequest<Role[]>(`/roles/team/${teamId}`),
  incidents: () => apiRequest<Incident[]>("/incidents/"),
  incident: (incidentId: number) => apiRequest<Incident>(`/incidents/${incidentId}`),
  incidentTimeline: (incidentId: number) => apiRequest<IncidentTimelineEntry[]>(`/incidents/${incidentId}/timeline`),
  updateIncidentStatus: ({ incidentId, status }: UpdateIncidentStatusPayload) =>
    apiRequest<Incident>(`/incidents/${incidentId}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  updateIncident: ({ incidentId, data }: UpdateIncidentPayload) =>
    apiRequest<Incident>(`/incidents/${incidentId}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),
  resolveIncident: (incidentId: number) =>
    apiRequest<Incident>(`/incidents/${incidentId}/resolve`, {
      method: "PATCH"
    }),
  deleteIncident: (incidentId: number) =>
    apiRequest<{ message: string }>(`/incidents/${incidentId}`, {
      method: "DELETE"
    }),
  createIncident: (payload: CreateIncidentPayload) =>
    apiRequest<Incident>("/incidents/", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  logs: () => apiRequest<LogEntry[]>("/logs/")
};
