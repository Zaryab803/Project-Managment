import Link from "next/link";
import {
  Briefcase,
  CheckSquare,
  Clock,
  Users,
  ArrowUpRight,
  FolderKanban,
  Eye,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import PageHeader from "@/components/layout/PageHeader";
import { getRoleConfig } from "@/utils/roleConfig";
import {
  DashboardData,
  getDeadlineLabel,
} from "@/lib/dashboard/getDashboardData";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import AnimatedSection, { AnimatedItem } from "@/components/motion/AnimatedSection";

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

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "Active";
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
          : status === "Completed"
            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
      }`}
    >
      {isActive ? "● " : ""}
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Critical: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
    High: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    Medium: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
    Low: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[priority] || styles.Low}`}
    >
      {priority}
    </span>
  );
}

export default function AdminDashboard({ data }: { data: DashboardData }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <PageHeader
        title="Administrator Dashboard"
        subtitle={today}
        actions={
          <UserAvatar
            name={data.profileName}
            role={data.profileRole}
            size="md"
          />
        }
      />

      <div className="space-y-6">

      <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedItem>
        <StatCard
          label="Total Projects"
          value={data.stats.totalProjects}
          sub={`${data.stats.activeProjects} active`}
          icon={<Briefcase className="w-5 h-5" />}
          iconClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        />
        </AnimatedItem>
        <AnimatedItem>
        <StatCard
          label="Total Tasks"
          value={data.stats.totalTasks}
          sub={`${data.stats.completedTasks} done`}
          icon={<CheckSquare className="w-5 h-5" />}
          iconClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        </AnimatedItem>
        <AnimatedItem>
        <StatCard
          label="Overdue Tasks"
          value={data.stats.overdueTasks}
          sub="needs attention"
          icon={<Clock className="w-5 h-5" />}
          iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
          valueClass="text-rose-600"
        />
        </AnimatedItem>
        <AnimatedItem>
        <StatCard
          label="Team Members"
          value={data.stats.teamMembers}
          sub={`${data.stats.projectManagers} PM · ${data.teamMembers.filter((m) => m.role === "Team Member").length} members`}
          icon={<Users className="w-5 h-5" />}
          iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        </AnimatedItem>
      </AnimatedSection>

      <AnimatedSection>
      <DashboardAnalytics data={data} />
      </AnimatedSection>

      <AnimatedSection className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Project Overview</h2>
            <Link
              href="/dashboard/projects"
              className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {data.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No projects yet. Create your first project.
            </p>
          ) : (
            <div className="space-y-3">
              {data.projects.slice(0, 6).map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="p-4 rounded-xl border border-border/40 bg-muted/20 flex items-center justify-between hover:border-indigo-500/40 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {project.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{project.progress}%</span>
                      <span>·</span>
                      <span>{project.openTasks} open tasks</span>
                      <span>·</span>
                      <div className="flex items-center gap-1.5">
                        <UserAvatar
                          name={project.managerName || ""}
                          role={project.managerRole || "Project Manager"}
                          size="xs"
                        />
                        {project.managerName && <span>{project.managerName}</span>}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={project.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-foreground">Upcoming Deadlines</h2>
          {data.upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No upcoming deadlines.
            </p>
          ) : (
            <div className="space-y-4">
              {data.upcomingDeadlines.map((task) => {
                const label = getDeadlineLabel(task.dueDate);
                const isUrgent =
                  task.dueDate &&
                  (() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const due = new Date(task.dueDate);
                    due.setHours(0, 0, 0, 0);
                    const days = Math.ceil(
                      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return days <= 3;
                  })();
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between border-b border-border/40 pb-3 last:border-none last:pb-0"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2">
                        {task.assigneeName && (
                          <>
                            <UserAvatar
                              name={task.assigneeName}
                              role={task.assigneeRole || "Team Member"}
                              size="xs"
                            />
                            <p className="text-xs text-muted-foreground">
                              {task.assigneeName}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs font-medium text-foreground">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </p>
                      <p
                        className={`text-xs ${isUrgent ? "text-rose-500" : "text-muted-foreground"}`}
                      >
                        {label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection>
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Team Overview</h2>
          <Link
            href="/dashboard/users"
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            Manage users
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase bg-muted/30">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Active Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {data.teamMembers.map((member) => {
                const roleStyle = getRoleConfig(member.role);
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={member.name}
                          role={member.role}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleStyle.badgeClass}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {member.department || "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-indigo-600">
                      {member.activeTasks}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </AnimatedSection>
      </div>
    </div>
  );
}
