import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@/types";

export interface DashboardTask {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  projectName: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeRole: string | null;
  createdAt: string | null;
}

export interface DashboardProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  managerId: string | null;
  managerName: string | null;
  managerRole: string | null;
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  progress: number;
  userOpenTasks: number;
  members: { id: string; name: string; role: string }[];
}

export interface DashboardMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  activeTasks: number;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  inReviewTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  teamMembers: number;
  projectManagers: number;
}

export interface DashboardData {
  profileName: string;
  profileRole: UserRole;
  stats: DashboardStats;
  projects: DashboardProject[];
  tasks: DashboardTask[];
  upcomingDeadlines: DashboardTask[];
  activeTasks: DashboardTask[];
  teamMembers: DashboardMember[];
}

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "Completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

function daysUntil(dueDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDeadlineLabel(dueDate: string | null) {
  if (!dueDate) return null;
  const days = daysUntil(dueDate);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  return `${days}d`;
}

export async function getDashboardData(
  userId: string,
  role: UserRole
): Promise<DashboardData> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", userId)
    .single();

  const profileName = profile?.name || "User";
  const profileRole = (profile?.role as UserRole) || role;

  const { data: allProjects } = await supabase
    .from("projects")
    .select(`
      id, name, description, status, priority, manager_id,
      manager:profiles!manager_id(id, name, role),
      project_members(user:profiles!user_id(id, name, role))
    `);

  // Tasks are RLS-protected — use service role (same as /api/tasks)
  const supabaseAdmin = createAdminClient();
  const { data: allTasks } = await supabaseAdmin
    .from("tasks")
    .select(`
      id, title, description, project_id, status, priority, due_date, assignee_id, created_at,
      assignee:profiles!assignee_id(id, name, role)
    `);

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, name, email, role, department");

  const projectMap = new Map(
    (allProjects || []).map((p) => [p.id, p.name as string])
  );

  let visibleProjects: any[] = allProjects || [];
  if (profileRole === "Project Manager") {
    visibleProjects = visibleProjects.filter((p) => p.manager_id === userId);
  } else if (profileRole === "Team Member") {
    visibleProjects = visibleProjects.filter((p) =>
      p.project_members?.some((m: any) => m.user?.id === userId)
    );
  }

  const visibleProjectIds = new Set(visibleProjects.map((p) => p.id));

  let visibleTasks = (allTasks || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    projectId: t.project_id,
    projectName: projectMap.get(t.project_id) || "Unknown Project",
    status: t.status,
    priority: t.priority,
    dueDate: t.due_date,
    assigneeId: t.assignee_id,
    assigneeName: t.assignee?.name || null,
    assigneeRole: t.assignee?.role || null,
    createdAt: t.created_at || null,
  }));

  if (profileRole === "Project Manager") {
    visibleTasks = visibleTasks.filter((t) => visibleProjectIds.has(t.projectId));
  } else if (profileRole === "Team Member") {
    visibleTasks = visibleTasks.filter((t) => t.assigneeId === userId);
  }

  const openTasks = visibleTasks.filter((t) => t.status !== "Completed");
  const completedTasks = visibleTasks.filter((t) => t.status === "Completed");
  const overdueTasks = visibleTasks.filter((t) =>
    isOverdue(t.dueDate, t.status)
  );

  const projects: DashboardProject[] = visibleProjects.map((p: any) => {
    const projectTasks = (allTasks || []).filter((t: any) => t.project_id === p.id);
    const open = projectTasks.filter((t) => t.status !== "Completed").length;
    const completed = projectTasks.filter((t) => t.status === "Completed").length;
    const total = projectTasks.length;
    const userOpen = projectTasks.filter(
      (t) =>
        t.assignee_id === userId && t.status !== "Completed"
    ).length;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      priority: p.priority,
      managerId: p.manager_id,
      managerName: p.manager?.name || null,
      managerRole: p.manager?.role || "Project Manager",
      totalTasks: total,
      openTasks: open,
      completedTasks: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      userOpenTasks: userOpen,
      members: (p.project_members || [])
        .map((m: any) => m.user)
        .filter(Boolean),
    };
  });

  const upcomingDeadlines = [...openTasks]
    .filter((t) => t.dueDate)
    .sort(
      (a, b) =>
        new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    )
    .slice(0, 6);

  const activeTasks = [...openTasks]
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    })
    .slice(0, 8);

  const pmCount =
    allProfiles?.filter((p) => p.role === "Project Manager").length || 0;
  const memberCount =
    allProfiles?.filter((p) => p.role === "Team Member").length || 0;

  const teamMembers: DashboardMember[] = (allProfiles || [])
    .filter((p) => p.role !== "Administrator")
    .map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: p.role,
      department: p.department,
      activeTasks: (allTasks || []).filter(
        (t) => t.assignee_id === p.id && t.status !== "Completed"
      ).length,
    }));

  const stats: DashboardStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "Active").length,
    totalTasks: visibleTasks.length,
    completedTasks: completedTasks.length,
    openTasks: openTasks.length,
    overdueTasks: overdueTasks.length,
    pendingTasks: visibleTasks.filter(
      (t) => t.status === "To Do" || t.status === "In Progress"
    ).length,
    inReviewTasks: visibleTasks.filter((t) => t.status === "Review").length,
    inProgressTasks: visibleTasks.filter((t) => t.status === "In Progress")
      .length,
    todoTasks: visibleTasks.filter((t) => t.status === "To Do").length,
    teamMembers: (allProfiles || []).length,
    projectManagers: pmCount,
  };

  return {
    profileName,
    profileRole,
    stats,
    projects,
    tasks: visibleTasks,
    upcomingDeadlines,
    activeTasks,
    teamMembers,
  };
}
