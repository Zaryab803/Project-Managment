import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileName = "User";
  let profileRole: "admin" | "manager" | "employee" = "admin";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      profileName = profile.name || user.email?.split("@")[0] || "User";
      if (profile.role === "Project Manager") profileRole = "manager";
      else if (profile.role === "Team Member") profileRole = "employee";
      else profileRole = "admin";
    }
  }

  const userEmail = user?.email || "admin@nexus.io";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Fixed Left Sidebar */}
      <Sidebar role={profileRole} userName={profileName} userEmail={userEmail} />

      {/* Main Content Area with Internal Scrolling */}
      <div className="flex flex-col flex-1 h-full overflow-y-auto">
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}