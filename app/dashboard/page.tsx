import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard/getDashboardData";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import MemberDashboard from "@/components/dashboard/MemberDashboard";
import { UserRole } from "@/types";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole) || "Team Member";
  const data = await getDashboardData(user.id, role);

  if (role === "Administrator") {
    return <AdminDashboard data={data} />;
  }

  if (role === "Project Manager") {
    return <ManagerDashboard data={data} />;
  }

  return <MemberDashboard data={data} />;
}
