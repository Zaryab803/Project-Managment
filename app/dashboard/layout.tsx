import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import PageTransition from "@/components/motion/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { toSidebarRole } from "@/utils/roleConfig";
import { UserRole } from "@/types";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileName = "User";
  let profileRole: UserRole = "Administrator";
  let sidebarRole: "admin" | "manager" | "employee" = "admin";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      profileName = profile.name || user.email?.split("@")[0] || "User";
      profileRole = (profile.role as UserRole) || "Team Member";
      sidebarRole = toSidebarRole(profileRole);
    }
  }

  const userEmail = user?.email || "admin@nexus.io";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        role={sidebarRole}
        userRole={profileRole}
        userName={profileName}
        userEmail={userEmail}
      />

      {/* Main Content Area with Internal Scrolling */}
      <div className="flex flex-col flex-1 h-full overflow-y-auto">
        <main className="p-8 flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}