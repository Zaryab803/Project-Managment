import Link from "next/link";
import {
  ClipboardList,
  Zap,
  Eye,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import PageHeader from "@/components/layout/PageHeader";
import {
  DashboardData,
  getDeadlineLabel,
} from "@/lib/dashboard/getDashboardData";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";

function StatCard({
  label,
  value,
  sub,
  icon,
  iconClass,
  valueClass,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm flex justify-between items-start">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <h3
          className={`text-3xl font-bold mt-2 ${valueClass || "text-foreground"}`}
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          {value}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
      <div className={`p-2.5 rounded-xl ${iconClass}`}>{icon}</div>
    </div>
  );
}

function TaskStatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "To Do": "bg-muted text-muted-foreground",
    "In Progress": "bg-blue-500/10 text-blue-600",
    Review: "bg-purple-500/10 text-purple-600",
    Completed: "bg-emerald-500/10 text-emerald-600",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles["To Do"]}`}
    >
      {status}
    </span>
  );
}

function PriorityTag({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Critical: "text-rose-500",
    High: "text-amber-600",
    Medium: "text-blue-600",
    Low: "text-muted-foreground",
  };
  return (
    <span className={`text-xs font-medium ${styles[priority] || styles.Low}`}>
      {priority}
    </span>
  );
}

export default function MemberDashboard({ data }: { data: DashboardData }) {
  const firstName = data.profileName.split(" ")[0];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's what's on your plate today"
        actions={
          <UserAvatar
            name={data.profileName}
            role={data.profileRole}
            size="md"
          />
        }
      />

      <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Tasks"
          value={data.stats.totalTasks}
          sub={`${data.stats.completedTasks} done`}
          icon={<ClipboardList className="w-5 h-5" />}
          iconClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label="In Progress"
          value={data.stats.inProgressTasks}
          sub="currently working"
          icon={<Zap className="w-5 h-5" />}
          iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="In Review"
          value={data.stats.inReviewTasks}
          sub="awaiting feedback"
          icon={<Eye className="w-5 h-5" />}
          iconClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="Overdue"
          value={data.stats.overdueTasks}
          sub="needs attention"
          icon={<Clock className="w-5 h-5" />}
          iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
          valueClass="text-rose-600"
        />
      </div>

      <DashboardAnalytics data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-foreground">My Active Tasks</h2>
          {data.activeTasks.length === 0 ? (
            <div className="bg-card border border-border/50 rounded-2xl p-8 text-center text-sm text-muted-foreground">
              No active tasks assigned to you.
            </div>
          ) : (
            <div className="space-y-3">
              {data.activeTasks.map((task) => {
                const overdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== "Completed";
                return (
                  <Link
                    key={task.id}
                    href={`/dashboard/tasks/${task.id}`}
                    className="block bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">
                          {task.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {task.projectName}
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <PriorityTag priority={task.priority} />
                          {task.dueDate && (
                            <span
                              className={`text-xs ${overdue ? "text-rose-500 font-medium" : "text-muted-foreground"}`}
                            >
                              {overdue
                                ? `Overdue — Due ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                : `Due ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <TaskStatusPill status={task.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">My Projects</h2>
              <Link
                href="/dashboard/projects"
                className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            {data.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No projects assigned.
              </p>
            ) : (
              <div className="space-y-4">
                {data.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="block space-y-2 hover:opacity-80"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {project.name}
                      </p>
                      <UserAvatar
                        name={project.managerName || "Manager"}
                        role={project.managerRole || "Project Manager"}
                        size="xs"
                      />
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {project.userOpenTasks} of your tasks open
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-foreground">
              Upcoming Deadlines
            </h2>
            {data.upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming deadlines.
              </p>
            ) : (
              <div className="space-y-3">
                {data.upcomingDeadlines.slice(0, 4).map((task) => (
                  <Link
                    key={task.id}
                    href={`/dashboard/tasks/${task.id}`}
                    className="flex items-center justify-between hover:opacity-80"
                  >
                    <p className="text-sm text-foreground truncate flex-1">
                      {task.title}
                    </p>
                    <span className="text-xs font-medium text-muted-foreground ml-3">
                      {getDeadlineLabel(task.dueDate)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
