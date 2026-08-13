"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { DashboardData } from "@/lib/dashboard/getDashboardData";
import FadeIn from "@/components/motion/FadeIn";
import {
  getCompletionRate,
  getProjectProgressChartData,
  getProjectStatusChartData,
  getTaskPriorityChartData,
  getTaskStatusChartData,
  getTeamWorkloadChartData,
  getWeeklyTaskActivityData,
} from "@/lib/dashboard/chartData";

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border/50 bg-card p-5 shadow-sm ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color || "currentColor" }}
          />
          {entry.name}:{" "}
          <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

interface DashboardAnalyticsProps {
  data: DashboardData;
}

export default function DashboardAnalytics({ data }: DashboardAnalyticsProps) {
  const isAdmin = data.profileRole === "Administrator";
  const isManager = data.profileRole === "Project Manager";

  const statusData = getTaskStatusChartData(data.tasks);
  const priorityData = getTaskPriorityChartData(data.tasks);
  const projectStatusData = getProjectStatusChartData(data.projects);
  const projectProgressData = getProjectProgressChartData(data.projects);
  const teamWorkloadData = getTeamWorkloadChartData(data.teamMembers);
  const weeklyData = getWeeklyTaskActivityData(data.tasks);
  const completionRate = getCompletionRate(data.stats);

  const hasTasks = data.tasks.length > 0;
  const hasProjects = data.projects.length > 0;

  return (
    <FadeIn className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-semibold text-foreground">Analytics Overview</h2>
          <p className="text-sm text-muted-foreground">
            Visual insights from your workspace data
          </p>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Completion Rate
          </p>
          <p
            className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            {completionRate}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Task Status Distribution"
          subtitle="Breakdown by workflow stage"
        >
          {!hasTasks || statusData.every((item) => item.value === 0) ? (
            <EmptyChart message="No task data to display yet." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={3}
                  stroke="transparent"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Task Priority Breakdown"
          subtitle="Open and completed tasks by priority"
        >
          {priorityData.length === 0 ? (
            <EmptyChart message="No priority data available." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.35} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Tasks" radius={[8, 8, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {(isAdmin || isManager) && (
          <ChartCard
            title="Project Progress"
            subtitle="Top projects by task volume"
          >
            {!hasProjects || projectProgressData.length === 0 ? (
              <EmptyChart message="No project progress data yet." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={projectProgressData}
                  layout="vertical"
                  barSize={18}
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.35} horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0]?.payload as {
                        progress: number;
                        openTasks: number;
                        totalTasks: number;
                      };
                      return (
                        <div className="rounded-xl border border-border/60 bg-card px-3 py-2 text-xs shadow-lg">
                          <p className="mb-1 font-medium text-foreground">{label}</p>
                          <p className="text-muted-foreground">
                            Progress:{" "}
                            <span className="font-semibold text-foreground">
                              {item.progress}%
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Tasks:{" "}
                            <span className="font-semibold text-foreground">
                              {item.totalTasks - item.openTasks}/{item.totalTasks}
                            </span>{" "}
                            done
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="progress"
                    name="Progress %"
                    fill="#6366f1"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        )}

        {isAdmin ? (
          <ChartCard
            title="Team Workload"
            subtitle="Active tasks per team member"
          >
            {teamWorkloadData.length === 0 ? (
              <EmptyChart message="No team workload data yet." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={teamWorkloadData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.35} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="activeTasks"
                    name="Active Tasks"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        ) : (
          <ChartCard
            title="Project Status"
            subtitle="Distribution of project states"
          >
            {projectStatusData.length === 0 ? (
              <EmptyChart message="No project status data yet." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={projectStatusData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.35} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Projects" radius={[8, 8, 0, 0]}>
                    {projectStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        )}
      </div>

      <ChartCard
        title="Weekly Task Activity"
        subtitle="Tasks created vs completed over the last 6 weeks"
        className="w-full"
      >
        {!hasTasks ? (
          <EmptyChart message="No activity data to show yet." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.35} />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="#6366f1"
                fill="url(#createdGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#10b981"
                fill="url(#completedGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </FadeIn>
  );
}
