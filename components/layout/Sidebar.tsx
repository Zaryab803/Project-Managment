"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, CheckSquare, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface SidebarProps {
  role: "admin" | "manager" | "employee";
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
    { name: "My Profile", href: "/dashboard/profile", icon: User },
  ],
};

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthStore();
  const navigation = roleMenus[role] || roleMenus.admin;

  const roleLabels = {
    admin: "ADMINISTRATOR",
    manager: "PROJECT MANAGER",
    employee: "TEAM MEMBER",
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[var(--sidebar-bg)] text-white flex flex-col justify-between border-r border-border/15">
      <div>
        {/* App Logo */}
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
            N
          </div>
          <div>
            <h1 className="font-bold tracking-wide text-lg">Nexus</h1>
            <p className="text-xs text-slate-400 uppercase tracking-wider">{roleLabels[role]}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1 mt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Details */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center font-semibold text-xs">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}