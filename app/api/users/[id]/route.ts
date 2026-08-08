import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params; 
    const body = await request.json();
    const { password, name, role, department, phone, email } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing server configuration" }, { status: 500 });
    }

    const supabaseAdmin = createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    });

    if (password && password.trim() !== "") {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password }
      );
      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ name, email, role, department, phone })
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params; // 👈 Await params here

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing server configuration" }, { status: 500 });
    }

    const supabaseAdmin = createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    });

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}