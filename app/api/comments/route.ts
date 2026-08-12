import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth/requireRole";

export async function GET(request: Request) {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("comments")
      .select(`*, user:profiles!user_id(id, name, email, role)`)
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch comments." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, content } = body;

    if (!taskId || !content?.trim()) {
      return NextResponse.json(
        { error: "Task and comment content are required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("comments")
      .insert([
        {
          task_id: taskId,
          user_id: profile.id,
          content: content.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, comment: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to add comment." },
      { status: 500 }
    );
  }
}
