import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRoles } from "@/lib/auth/requireRole";

export async function POST(request: Request) {
  try {
    const auth = await requireRoles(["Administrator"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const {
      name,
      description,
      status,
      priority,
      start_date,
      end_date,
      manager_id,
      tags,
      memberIds = [],
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    if (!manager_id) {
      return NextResponse.json({ error: "Project manager is required." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: newProject, error: projectError } = await supabaseAdmin
      .from("projects")
      .insert([
        {
          name: name.trim(),
          description: description || null,
          status: status || "Planning",
          priority: priority || "Medium",
          start_date: start_date || null,
          end_date: end_date || null,
          manager_id,
          tags: tags || [],
        },
      ])
      .select()
      .single();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 400 });
    }

    if (memberIds.length > 0) {
      const memberRows = memberIds.map((userId: string) => ({
        project_id: newProject.id,
        user_id: userId,
      }));

      const { error: memberError } = await supabaseAdmin
        .from("project_members")
        .insert(memberRows);

      if (memberError) {
        await supabaseAdmin.from("projects").delete().eq("id", newProject.id);
        return NextResponse.json({ error: memberError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, project: newProject });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create project." },
      { status: 500 }
    );
  }
}
