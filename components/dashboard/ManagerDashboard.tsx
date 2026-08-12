import Link from "next/link";
import {
  FolderKanban,
  CheckSquare,
  Clock,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import PageHeader from "@/components/layout/PageHeader";
import {
  DashboardData,
  getDeadlineLabel,
} from "@/lib/dashboard/getDashboardData";
import {
  getDashboardPriorityBadgeClass,
  getDashboardStatusBadgeClass,
} from "@/utils/projectBadges";

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

export default function ManagerDashboard({ data }: { data: DashboardData }) {
  const firstName = data.profileName.split(" ")[0];

  return (
    <div>
      <PageHeader
        title="Project Manager Dashboard"
        subtitle={`Managing ${data.stats.totalProjects} project${data.stats.totalProjects !== 1 ? "s" : ""}`}
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
          label="My Projects"
          value={data.stats.totalProjects}
          sub={`${data.stats.activeProjects} active`}
          icon={<FolderKanban className="w-5 h-5" />}
          iconClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label="Total Tasks"
          value={data.stats.totalTasks}
          sub={`${data.stats.completedTasks} done`}
          icon={<CheckSquare className="w-5 h-5" />}
          iconClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="Pending"
          value={data.stats.pendingTasks}
          sub="to do + in progress"
          icon={<Clock className="w-5 h-5" />}
          iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="In Review"
          value={data.stats.inReviewTasks}
          sub="awaiting approval"
          icon={<Eye className="w-5 h-5" />}
          iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Assigned Projects</h2>
            <Link
              href="/dashboard/projects"
              className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {data.projects.length === 0 ? (
            <div className="bg-card border border-border/50 rounded-2xl p-8 text-center text-sm text-muted-foreground">
              No projects assigned to you yet.
            </div>
          ) : (
            <div className="space-y-4">
              {data.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="block rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-[border-color,box-shadow] hover:border-indigo-500/40 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3
                        className="text-lg font-bold text-foreground"
                        style={{ fontFamily: "Outfit, sans-serif" }}
                      >
                        {project.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getDashboardStatusBadgeClass(project.status)}`}
                      >
                        {project.status === "Active" ? "● " : ""}
                        {project.status}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getDashboardPriorityBadgeClass(project.priority)}`}
                      >
                        {project.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {project.completedTasks}/{project.totalTasks} tasks
                          done
                        </span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {project.openTasks} open task
                        {project.openTasks !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 4).map((m) => (
                        <UserAvatar
                          key={m.id}
                          name={m.name}
                          role={m.role}
                          size="sm"
                          className="border-2 border-card"
                        />
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-foreground">
              Upcoming Deadlines
            </h2>
            {data.upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming deadlines.
              </p>
            ) : (
              <div className="space-y-4">
                {data.upcomingDeadlines.map((task) => (
                  <Link
                    key={task.id}
                    href={`/dashboard/tasks/${task.id}`}
                    className="block border-b border-border/40 pb-3 last:border-none last:pb-0 hover:opacity-80"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-2">
                        {task.assigneeName && (
                          <>
                            <UserAvatar
                              name={task.assigneeName}
                              role={task.assigneeRole || "Team Member"}
                              size="xs"
                            />
                            <span className="text-xs text-muted-foreground">
                              {task.assigneeName}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-xs font-medium text-rose-500">
                        {getDeadlineLabel(task.dueDate)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-foreground">Task Breakdown</h2>
            <div className="space-y-3">
              {[
                { label: "To Do", count: data.stats.todoTasks, color: "bg-slate-400" },
                {
                  label: "In Progress",
                  count: data.stats.inProgressTasks,
                  color: "bg-indigo-600",
                },
                {
                  label: "In Review",
                  count: data.stats.inReviewTasks,
                  color: "bg-purple-600",
                },
                {
                  label: "Completed",
                  count: data.stats.completedTasks,
                  color: "bg-emerald-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
