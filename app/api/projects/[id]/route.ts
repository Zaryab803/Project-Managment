import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRoles } from "@/lib/auth/requireRole";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRoles(["Administrator"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { memberIds, ...projectData } = body;

    if (projectData.manager_id !== undefined && !projectData.manager_id) {
      return NextResponse.json({ error: "Project manager is required." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(projectData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (Array.isArray(memberIds)) {
      await supabaseAdmin.from("project_members").delete().eq("project_id", id);

      if (memberIds.length > 0) {
        const memberRows = memberIds.map((userId: string) => ({
          project_id: id,
          user_id: userId,
        }));

        const { error: memberError } = await supabaseAdmin
          .from("project_members")
          .insert(memberRows);

        if (memberError) {
          return NextResponse.json({ error: memberError.message }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ success: true, project: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update project." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRoles(["Administrator"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    await supabaseAdmin.from("tasks").delete().eq("project_id", id);
    await supabaseAdmin.from("project_members").delete().eq("project_id", id);

    const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete project." },
      { status: 500 }
    );
  }
}
