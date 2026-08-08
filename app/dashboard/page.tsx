import Link from "next/link";
import { Briefcase, CheckSquare, Clock, Users, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRoleConfig } from "@/utils/roleConfig";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileName = "User";
  let initials = "U";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    if (profile?.name) {
      profileName = profile.name;
      const parts = profileName.trim().split(" ");
      initials = parts.length > 1 
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
        : parts[0].substring(0, 2).toUpperCase();
    } else if (user.email) {
      initials = user.email.substring(0, 2).toUpperCase();
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Sticky Header with Dynamic User Initials */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b border-border/40 flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Administrator Dashboard</h1>
          <p className="text-sm text-muted-foreground">Thursday, August 6</p>
        </div>
        
        {/* Dynamic Initials Avatar */}
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-full bg-rose-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm"
            title={profileName}
          >
            {initials}
          </div>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Projects</p>
            <h3 className="text-3xl font-bold text-foreground mt-2">6</h3>
            <p className="text-xs text-muted-foreground mt-1">3 active</p>
          </div>
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Tasks</p>
            <h3 className="text-3xl font-bold text-foreground mt-2">17</h3>
            <p className="text-xs text-muted-foreground mt-1">3 done</p>
          </div>
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overdue Tasks</p>
            <h3 className="text-3xl font-bold text-rose-600 mt-2">3</h3>
            <p className="text-xs text-muted-foreground mt-1">needs attention</p>
          </div>
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Members</p>
            <h3 className="text-3xl font-bold text-foreground mt-2">8</h3>
            <p className="text-xs text-muted-foreground mt-1">2 PM • 5 members</p>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Project Overview & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Overview (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Project Overview</h2>
            <Link href="/dashboard/projects" className="text-xs font-medium text-indigo-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { name: "Infrastructure Audit & Hardening", progress: "0%", status: "Planning", assignee: "Priya Sharma" },
              { name: "Mobile App MVP", progress: "0%", status: "Planning", assignee: "Marcus Webb" },
              { name: "Brand Identity Refresh", progress: "25%", status: "Active", assignee: "Priya Sharma" },
              { name: "API Gateway Modernization", progress: "20%", status: "Active", assignee: "Marcus Webb" },
              { name: "Nexus Platform Redesign", progress: "17%", status: "Active", assignee: "Marcus Webb" },
            ].map((project, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border/40 bg-muted/20 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-foreground">{project.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{project.progress}</span>
                    <span>•</span>
                    <span>{project.assignee}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  project.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                }`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines (Takes 1 column) */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-foreground">Upcoming Deadlines</h2>

          <div className="space-y-4">
            {[
              { title: "Design GraphQL schema", date: "Aug 10", left: "5d left", author: "Sofia Reyes" },
              { title: "Logo redesign concepts", date: "Aug 10", left: "5d left", author: "Liam Torres" },
              { title: "Create new design system tokens", date: "Aug 15", left: "10d left", author: "Ethan Park" },
              { title: "Color palette definition", date: "Aug 15", left: "10d left", author: "Ethan Park" },
              { title: "Initial security audit scope", date: "Aug 15", left: "10d left", author: "Nadia Okonkwo" },
            ].map((task, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-none last:pb-0">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">{task.date}</p>
                  <p className="text-xs text-amber-600">{task.left}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Table: Team Overview */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Team Overview</h2>
          <Link href="/dashboard/users" className="text-xs font-medium text-indigo-600 hover:underline">
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
              {[
                { name: "Marcus Webb", email: "marcus@nexus.io", role: "Project Manager", dept: "Engineering", tasks: 0 },
                { name: "Priya Sharma", email: "priya@nexus.io", role: "Project Manager", dept: "Design", tasks: 0 },
                { name: "Jordan Lee", email: "jordan@nexus.io", role: "Team Member", dept: "Engineering", tasks: 3 },
                { name: "Sofia Reyes", email: "sofia@nexus.io", role: "Team Member", dept: "Engineering", tasks: 3 },
                { name: "Ethan Park", email: "ethan@nexus.io", role: "Team Member", dept: "Design", tasks: 2 },
              ].map((member, idx) => {
                const roleStyle = getRoleConfig(member.role);
                return (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      {/* Dynamic Role Badge Using Central Config */}
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleStyle.badgeClass}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{member.dept}</td>
                    <td className="py-3 px-4 text-right font-medium text-indigo-600">{member.tasks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}