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
    const data = await request.json();

    // Validation
    if (!data.komandaAdi || !data.istiqamet) {
      return NextResponse.json(
        { error: "Komanda adı və istiqamət tələb olunur" },
        { status: 400 },
      );
    }

    if (!data.members || data.members.length < 3) {
      return NextResponse.json(
        { error: "Minimum 3 komanda üzvü tələb olunur" },
        { status: 400 },
      );
    }

    if (!data.raziliq) {
      return NextResponse.json(
        { error: "İştirak şərtləri qəbul edilməlidir" },
        { status: 400 },
      );
    }

    // Get the active hackathon
    const { data: hackathon, error: hErr } = await supabase
      .from("hackathons")
      .select("id, current_phase")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (hErr || !hackathon) {
      return NextResponse.json(
        { error: "Aktiv hakaton tapılmadı" },
        { status: 404 },
      );
    }

    if (hackathon.current_phase !== "registration_open") {
      return NextResponse.json(
        { error: "Qeydiyyat hazırda bağlıdır" },
        { status: 400 },
      );
    }

    // Check duplicate team name
    const { data: existing } = await supabase
      .from("teams")
      .select("id")
      .eq("hackathon_id", hackathon.id)
      .eq("name", data.komandaAdi)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Bu adda komanda artıq mövcuddur" },
        { status: 400 },
      );
    }

    // Create team
    const { data: team, error: tErr } = await supabase
      .from("teams")
      .insert({
        hackathon_id: hackathon.id,
        name: data.komandaAdi,
        track: data.istiqamet,
        description: data.ideya || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (tErr || !team) {
      return NextResponse.json(
        { error: "Komanda yaradılarkən xəta: " + (tErr?.message ?? "Bilinməyən xəta") },
        { status: 500 },
      );
    }

    // Add team members
    const members = data.members.map((m: { ad: string; soyad: string; email: string; elaqe: string; universitet: string; rol: string }, idx: number) => ({
      team_id: team.id,
      full_name: `${m.ad} ${m.soyad}`.trim(),
      email: m.email,
      phone: m.elaqe || null,
      university: m.universitet || null,
      role: idx === 0 ? "leader" : "member",
    }));

    const { error: mErr } = await supabase
      .from("team_members")
      .insert(members);

    if (mErr) {
      // Cleanup: delete team if members failed
      await supabase.from("teams").delete().eq("id", team.id);
      return NextResponse.json(
        { error: "Üzvlər əlavə edilərkən xəta: " + mErr.message },
        { status: 500 },
      );
    }

    // Create registration record with full form data
    const { error: rErr } = await supabase
      .from("registrations")
      .insert({
        hackathon_id: hackathon.id,
        team_id: team.id,
        form_data: data,
        submitted_at: new Date().toISOString(),
      });

    if (rErr) {
      console.error("Registration insert error:", rErr.message);
    }

    return NextResponse.json(
      { message: "Qeydiyyat uğurla tamamlandı", teamId: team.id },
      { status: 201 },
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Server xətası baş verdi" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const supabase = getSupabase();
  try {
    const { data: hackathon } = await supabase
      .from("hackathons")
      .select("current_phase, registration_end")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      status: hackathon?.current_phase === "registration_open" ? "active" : "closed",
      deadline: hackathon?.registration_end ?? "2026-04-25T23:59:59",
      message: hackathon?.current_phase === "registration_open"
        ? "Qeydiyyat aktivdir"
        : "Qeydiyyat bağlıdır",
    });
  } catch {
    return NextResponse.json({
      status: "active",
      deadline: "2026-04-25T23:59:59",
      message: "Qeydiyyat aktivdir",
    });
  }
}
