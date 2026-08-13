import { DashboardData, DashboardTask } from "./getDashboardData";

export const CHART_COLORS = {
  status: {
    "To Do": "#94a3b8",
    "In Progress": "#6366f1",
    Review: "#a855f7",
    Completed: "#10b981",
  },
  priority: {
    Low: "#94a3b8",
    Medium: "#3b82f6",
    High: "#f59e0b",
    Critical: "#ef4444",
    Urgent: "#f97316",
  },
  project: {
    Active: "#10b981",
    Planning: "#f59e0b",
    Completed: "#3b82f6",
    "On Hold": "#94a3b8",
  },
} as const;

export function getTaskStatusChartData(tasks: DashboardTask[]) {
  const statuses = ["To Do", "In Progress", "Review", "Completed"] as const;

  return statuses.map((status) => ({
    name: status,
    value: tasks.filter((task) => task.status === status).length,
    fill: CHART_COLORS.status[status],
  }));
}

export function getTaskPriorityChartData(tasks: DashboardTask[]) {
  const priorities = ["Low", "Medium", "High", "Critical", "Urgent"] as const;

  return priorities
    .map((priority) => ({
      name: priority,
      count: tasks.filter((task) => task.priority === priority).length,
      fill: CHART_COLORS.priority[priority],
    }))
    .filter((item) => item.count > 0);
}

export function getProjectStatusChartData(projects: DashboardData["projects"]) {
  const statuses = ["Active", "Planning", "Completed", "On Hold"] as const;

  return statuses
    .map((status) => ({
      name: status,
      count: projects.filter((project) => project.status === status).length,
      fill: CHART_COLORS.project[status],
    }))
    .filter((item) => item.count > 0);
}

export function getProjectProgressChartData(projects: DashboardData["projects"]) {
  return [...projects]
    .sort((a, b) => b.totalTasks - a.totalTasks)
    .slice(0, 6)
    .map((project) => ({
      name:
        project.name.length > 18
          ? `${project.name.slice(0, 18)}…`
          : project.name,
      progress: project.progress,
      openTasks: project.openTasks,
      totalTasks: project.totalTasks,
    }));
}

export function getTeamWorkloadChartData(members: DashboardData["teamMembers"]) {
  return [...members]
    .filter((member) => member.role === "Team Member")
    .sort((a, b) => b.activeTasks - a.activeTasks)
    .slice(0, 6)
    .map((member) => ({
      name: member.name.split(" ")[0],
      activeTasks: member.activeTasks,
    }));
}

export function getWeeklyTaskActivityData(tasks: DashboardTask[]) {
  const weeks = 6;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets: { name: string; created: number; completed: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const label = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const created = tasks.filter((task) => {
      if (!task.createdAt) return false;
      const createdDate = new Date(task.createdAt);
      return createdDate >= weekStart && createdDate < weekEnd;
    }).length;

    const completed = tasks.filter((task) => {
      if (task.status !== "Completed" || !task.createdAt) return false;
      const createdDate = new Date(task.createdAt);
      return createdDate >= weekStart && createdDate < weekEnd;
    }).length;

    buckets.push({ name: label, created, completed });
  }

  return buckets;
}

export function getCompletionRate(stats: DashboardData["stats"]) {
  if (stats.totalTasks === 0) return 0;
  return Math.round((stats.completedTasks / stats.totalTasks) * 100);
}
