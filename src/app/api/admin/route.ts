import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSessionToken() {
  return process.env.SESSION_TOKEN || "lup-session-9f3k2m7x";
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get("lup_session")?.value;
  return token === getSessionToken();
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    // Get active hackathon
    const { data: hackathon } = await supabase
      .from("hackathons")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!hackathon) {
      return NextResponse.json({ registrations: [], count: 0 });
    }

    // Get all registrations with form_data
    const { data: registrations } = await supabase
      .from("registrations")
      .select("id, team_id, form_data, submitted_at, teams(name, track, status)")
      .eq("hackathon_id", hackathon.id)
      .order("submitted_at", { ascending: false });

    const formatted = (registrations ?? []).map((r) => {
      const formData = (r.form_data as Record<string, unknown>) ?? {};
      const team = Array.isArray(r.teams) ? r.teams[0] : r.teams;
      return {
        id: r.id,
        teamId: r.team_id,
        komandaAdi: (team as { name?: string })?.name ?? formData.komandaAdi ?? "—",
        istiqamet: (team as { track?: string })?.track ?? formData.istiqamet ?? "—",
        status: (team as { status?: string })?.status ?? "pending",
        members: formData.members ?? [],
        ideya: formData.ideya ?? "",
        submittedAt: r.submitted_at,
        ...formData,
      };
    });

    return NextResponse.json({ registrations: formatted, count: formatted.length });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
