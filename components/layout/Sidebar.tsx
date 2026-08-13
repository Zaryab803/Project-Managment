"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
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
import NexusLogo from "@/components/ui/NexusLogo";
import { easeTransition, staggerContainerFast } from "@/lib/motion";

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

  const reduceMotion = useReducedMotion();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <motion.aside
      initial={reduceMotion ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...easeTransition, duration: 0.5 }}
      className="flex w-64 flex-col justify-between border-r border-sidebar-border bg-sidebar-bg text-sidebar-foreground"
    >
      <div>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...easeTransition, delay: 0.1 }}
          className="flex items-center justify-between gap-2 p-6"
        >
          <div className="flex min-w-0 items-center space-x-3">
            <NexusLogo size="md" />
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
        </motion.div>

        <motion.nav
          initial="hidden"
          animate="visible"
          variants={reduceMotion ? undefined : staggerContainerFast}
          className="mt-4 space-y-1 px-4"
        >
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, x: -12 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { ...easeTransition, delay: index * 0.04 },
                        },
                      }
                }
              >
                <Link
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
              </motion.div>
            );
          })}
        </motion.nav>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...easeTransition, delay: 0.25 }}
        className="border-t border-sidebar-border p-4"
      >
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
      </motion.div>
    </motion.aside>
  );
}
