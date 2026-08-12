import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile, requireRoles } from "@/lib/auth/requireRole";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }

    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select(`*, assignee:profiles!assignee_id(id, name, email, role)`)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ task: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch task." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRoles(["Administrator", "Project Manager"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.assigneeId !== undefined && !body.assigneeId) {
      return NextResponse.json({ error: "Assignee is required." }, { status: 400 });
    }

    const dbPayload: Record<string, unknown> = {};
    if (body.title !== undefined) dbPayload.title = body.title;
    if (body.description !== undefined) dbPayload.description = body.description;
    if (body.status !== undefined) dbPayload.status = body.status;
    if (body.priority !== undefined) dbPayload.priority = body.priority;
    if (body.dueDate !== undefined) dbPayload.due_date = body.dueDate;
    if (body.assigneeId !== undefined) dbPayload.assignee_id = body.assigneeId;

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRoles(["Administrator", "Project Manager"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete task." },
      { status: 500 }
    );
  }
}
