import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";

export interface SessionProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return profile as SessionProfile;
}

export async function requireRoles(allowedRoles: UserRole[]) {
  const profile = await getSessionProfile();
  if (!profile) {
    return { error: "You must be logged in.", status: 401 as const, profile: null };
  }
  if (!allowedRoles.includes(profile.role)) {
    return { error: "You do not have permission for this action.", status: 403 as const, profile: null };
  }
  return { error: null, status: 200 as const, profile };
}
