"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  User,
  LogOut,
  ListTodo,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import UserAvatar from "@/components/ui/UserAvatar";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface SidebarProps {
  role: "admin" | "manager" | "employee" | string;
  userRole: string;
  userName: string;
  userEmail: string;
}

const roleMenus = {
  admin: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/dashboard/users", icon: Users },
    { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
  ],
  manager: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Projects", href: "/dashboard/projects", icon: FolderKanban },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
  ],
  employee: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Projects", href: "/dashboard/projects", icon: FolderKanban },
    { name: "My Tasks", href: "/dashboard", icon: ListTodo },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
  ],
};

export default function Sidebar({
  role,
  userRole,
  userName,
  userEmail,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthStore();

  const roleLower = (role || "").toLowerCase();
  const menuKey =
    roleLower === "administrator" || roleLower === "administor"
      ? "admin"
      : roleLower;
  const navigation =
    roleMenus[menuKey as keyof typeof roleMenus] || roleMenus.admin;

  const roleLabels: Record<string, string> = {
    admin: "ADMINISTRATOR",
    administrator: "ADMINISTRATOR",
    administor: "ADMINISTRATOR",
    manager: "PROJECT MANAGER",
    employee: "TEAM MEMBER",
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="flex w-64 flex-col justify-between border-r border-sidebar-border bg-sidebar-bg text-sidebar-foreground">
      <div>
        <div className="flex items-center justify-between gap-2 p-6">
          <div className="flex min-w-0 items-center space-x-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md">
              N
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-wide text-sidebar-foreground">
                Nexus
              </h1>
              <p className="truncate text-xs uppercase tracking-wider text-sidebar-muted">
                {roleLabels[roleLower] || role}
              </p>
            </div>
          </div>
          <ThemeToggle variant="sidebar" />
        </div>

        <nav className="mt-4 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center space-x-3">
          <UserAvatar name={userName} role={userRole} size="md" />
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {userName}
            </p>
            <p className="truncate text-xs text-sidebar-muted">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
