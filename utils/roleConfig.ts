export const ROLE_CONFIG = {
  Administrator: {
    label: "Administrator",
    badgeClass: "bg-[var(--role-admin-bg)] text-[var(--role-admin-text)] border border-[var(--role-admin-border)]",
    avatarClass: "bg-rose-600",
  },
  "Project Manager": {
    label: "Project Manager",
    badgeClass: "bg-[var(--role-manager-bg)] text-[var(--role-manager-text)] border border-[var(--role-manager-border)]",
    avatarClass: "bg-indigo-600",
  },
  "Team Member": {
    label: "Team Member",
    badgeClass: "bg-[var(--role-member-bg)] text-[var(--role-member-text)] border border-[var(--role-member-border)]",
    avatarClass: "bg-emerald-600",
  },
} as const;

export function getRoleConfig(role?: string) {
  return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG["Team Member"];
}