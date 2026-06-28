import type { JwtProfile } from "@/types/api";

function role(profile?: JwtProfile | null) {
  return (profile?.role ?? "").toLowerCase();
}

export function isAdmin(profile?: JwtProfile | null) {
  return role(profile) === "system admin";
}

export function isTeamLead(profile?: JwtProfile | null) {
  return role(profile) === "team lead";
}

export function isIntern(profile?: JwtProfile | null) {
  return role(profile) === "intern";
}

export function canCreateUsers(profile?: JwtProfile | null) {
  return isAdmin(profile);
}

export function canViewLogs(profile?: JwtProfile | null) {
  return isAdmin(profile) || isTeamLead(profile);
}

export function canMutateIncidents(profile?: JwtProfile | null) {
  return Boolean(profile) && !isIntern(profile);
}

export function canDeleteIncidents(profile?: JwtProfile | null) {
  return isAdmin(profile) || isTeamLead(profile);
}
