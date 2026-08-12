/** Theme-safe priority badge classes for task cards */

export function getTaskPriorityBadgeClass(priority: string) {
  switch (priority) {
    case "Critical":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400";
    case "High":
    case "Urgent":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "Medium":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "Low":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export const TASK_BOARD_COLUMNS = [
  { status: "To Do" as const, label: "TO DO", dotClass: "bg-muted-foreground" },
  { status: "In Progress" as const, label: "IN PROGRESS", dotClass: "bg-blue-500" },
  { status: "Review" as const, label: "REVIEW", dotClass: "bg-violet-500" },
  { status: "Completed" as const, label: "COMPLETED", dotClass: "bg-emerald-500" },
];
