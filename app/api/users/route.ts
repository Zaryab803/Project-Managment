import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, department, phone } = body;
    console.log(email);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // This will print right in your terminal so we can see if they are missing
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("CRITICAL: Missing Supabase environment variables in API route!");
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase URL or Service Role Key." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: authData.user.id,
        name,
        email,
        role,
        department,
        phone,
        joined_at: new Date().toISOString(),
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}