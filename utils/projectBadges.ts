/** Theme-safe status/priority badge classes for project cards */

export function getProjectStatusBadgeClass(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
    case "Completed":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20";
    case "On Hold":
      return "bg-muted text-muted-foreground border border-border/60";
    default:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
  }
}

export function getProjectPriorityBadgeClass(priority: string) {
  switch (priority) {
    case "Critical":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20";
    case "High":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20";
    case "Low":
      return "bg-muted text-muted-foreground border border-border/60";
    default:
      return "bg-muted text-muted-foreground border border-border/60";
  }
}

export function getDashboardStatusBadgeClass(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "Completed":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    default:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
  }
}

export function getDashboardPriorityBadgeClass(priority: string) {
  switch (priority) {
    case "Critical":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400";
    case "High":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}
