import { UserRole } from "@/types";

export const ROLE_CONFIG = {
  Administrator: {
    label: "Administrator",
    badgeClass:
      "bg-[var(--role-admin-bg)] text-[var(--role-admin-text)] border border-[var(--role-admin-border)]",
    avatarClass: "bg-rose-600",
  },
  "Project Manager": {
    label: "Project Manager",
    badgeClass:
      "bg-[var(--role-manager-bg)] text-[var(--role-manager-text)] border border-[var(--role-manager-border)]",
    avatarClass: "bg-purple-600",
  },
  "Team Member": {
    label: "Team Member",
    badgeClass:
      "bg-[var(--role-member-bg)] text-[var(--role-member-text)] border border-[var(--role-member-border)]",
    avatarClass: "bg-indigo-600",
  },
} as const;

export function getRoleConfig(role?: string) {
  return (
    ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG["Team Member"]
  );
}

export function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

export function canManageTasks(role?: string) {
  return role === "Administrator" || role === "Project Manager";
}

export function canManageProjects(role?: string) {
  return role === "Administrator";
}

export function canManageUsers(role?: string) {
  return role === "Administrator";
}

export function normalizeRole(role?: string): UserRole {
  if (role === "Administrator" || role === "Project Manager" || role === "Team Member") {
    return role;
  }
  return "Team Member";
}

export function toSidebarRole(role?: string): "admin" | "manager" | "employee" {
  if (role === "Administrator") return "admin";
  if (role === "Project Manager") return "manager";
  return "employee";
}
