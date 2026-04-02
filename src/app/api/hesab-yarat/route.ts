import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const { teamId, email, password, fullName } = await request.json();

    if (!teamId || !email || !password || !fullName) {
      return NextResponse.json(
        { error: "Bütün sahələr tələb olunur" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parol minimum 6 simvol olmalıdır" },
        { status: 400 },
      );
    }

    // Verify team exists and this email is the leader
    const { data: member, error: mErr } = await supabase
      .from("team_members")
      .select("id, role, email")
      .eq("team_id", teamId)
      .eq("email", email)
      .single();

    if (mErr || !member) {
      return NextResponse.json(
        { error: "Bu e-poçt ilə komanda üzvü tapılmadı" },
        { status: 404 },
      );
    }

    // Check if this email already has a Supabase Auth account
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const alreadyExists = existingUsers?.users?.find(u => u.email === email);
    if (alreadyExists) {
      // Link existing user to team member
      await supabase
        .from("team_members")
        .update({ user_id: alreadyExists.id })
        .eq("id", member.id);

      return NextResponse.json(
        { error: "Bu e-poçt artıq qeydiyyatdan keçib. Giriş səhifəsindən daxil ola bilərsiniz." },
        { status: 409 },
      );
    }

    // Create Supabase Auth user (email_confirm: true to skip email verification)
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authErr || !authData.user) {
      return NextResponse.json(
        { error: "Hesab yaradılarkən xəta: " + (authErr?.message ?? "Bilinməyən xəta") },
        { status: 500 },
      );
    }

    const userId = authData.user.id;

    // Create profile
    const { error: profileErr } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name: fullName,
      });

    if (profileErr) {
      console.error("Profile creation error:", profileErr.message);
    }

    // Add team_member role
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "team_member",
      });

    if (roleErr) {
      console.error("Role assignment error:", roleErr.message);
    }

    // Link user to team_members record
    const { error: linkErr } = await supabase
      .from("team_members")
      .update({ user_id: userId })
      .eq("id", member.id);

    if (linkErr) {
      console.error("Team member link error:", linkErr.message);
    }

    return NextResponse.json(
      { message: "Hesab uğurla yaradıldı", userId },
      { status: 201 },
    );
  } catch (err) {
    console.error("Account creation error:", err);
    return NextResponse.json(
      { error: "Server xətası baş verdi" },
      { status: 500 },
    );
  }
}
