import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile, requireRoles } from "@/lib/auth/requireRole";

export async function GET(request: Request) {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const projectIds = searchParams.get("projectIds");
    const statsOnly = searchParams.get("stats") === "true";

    const supabaseAdmin = createAdminClient();

    if (projectIds) {
      const ids = projectIds.split(",").filter(Boolean);
      const { data, error } = await supabaseAdmin
        .from("tasks")
        .select("project_id, status, assignee_id")
        .in("project_id", ids);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ tasks: data || [] });
    }

    let query = supabaseAdmin
      .from("tasks")
      .select(
        statsOnly
          ? "project_id, status, assignee_id"
          : `*, assignee:profiles!assignee_id(id, name, email, role)`
      )
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ tasks: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch tasks." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireRoles(["Administrator", "Project Manager"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const {
      projectId,
      title,
      description,
      assigneeId,
      priority,
      status,
      dueDate,
    } = body;

    if (!projectId || !title?.trim()) {
      return NextResponse.json(
        { error: "Project and task title are required." },
        { status: 400 }
      );
    }

    if (!assigneeId) {
      return NextResponse.json({ error: "Assignee is required." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert([
        {
          project_id: projectId,
          title: title.trim(),
          description: description?.trim() || null,
          assignee_id: assigneeId,
          priority: priority || "Medium",
          status: status || "To Do",
          due_date: dueDate || null,
          created_by: auth.profile!.id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create task." },
      { status: 500 }
    );
  }
}
