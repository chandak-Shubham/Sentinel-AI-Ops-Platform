export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | string;
export type LogLevel = "INFO" | "WARNING" | "ERROR" | "CRITICAL" | string;

export interface Team {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  team_id: number;
  role_id: number | null;
}

export interface CreateUserResponse {
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Incident {
  id: number;
  title: string;
  description?: string | null;
  severity: Severity;
  status: IncidentStatus;
  source?: string | null;
  created_by?: number | null;
  assigned_to?: number | null;
  team_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  resolved_at?: string | null;
}

export interface IncidentTimelineEntry {
  id: number;
  incident_id: number;
  action_type: string;
  message?: string | null;
  performed_by?: number | null;
  created_at?: string | null;
}

export interface UpdateIncidentStatusPayload {
  incidentId: number;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
}

export type IncidentRealtimeEvent =
  | {
      event: "incident_created";
      incident_id: number;
      title?: string;
      severity?: Severity;
      status?: IncidentStatus;
      team_id?: number | null;
    }
  | {
      event: "incident_status_changed";
      incident_id: number;
      old_status?: IncidentStatus;
      new_status?: IncidentStatus;
    };

export interface CreateIncidentPayload {
  title: string;
  description: string;
  severity: Severity;
  team_id: number;
}

export interface LogEntry {
  id: number;
  service_name: string;
  source?: string | null;
  event_type: string;
  log_level: LogLevel;
  message: string;
  incident_id?: number | null;
  created_at?: string | null;
}

export interface JwtProfile {
  user_id?: number;
  email?: string;
  role?: string;
  exp?: number;
}
