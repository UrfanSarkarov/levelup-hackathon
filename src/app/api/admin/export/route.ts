import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function getHackathonId(): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("hackathons")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data?.id ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return "Melumat tapilmadi";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(","));
  }
  return "\uFEFF" + lines.join("\n"); // BOM for Excel UTF-8
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportTeams(hackathonId: string): Promise<any[]> {
  const supabase = getSupabase();
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, track, status, created_at, team_members(full_name, email, role, university)")
    .eq("hackathon_id", hackathonId)
    .order("created_at", { ascending: false });

  if (!teams) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = [];
  for (const team of teams) {
    const members = (team.team_members as { full_name: string; email: string; role: string; university: string }[]) ?? [];
    for (let i = 0; i < Math.max(members.length, 1); i++) {
      const m = members[i];
      rows.push({
        "Komanda": i === 0 ? team.name : "",
        "Istiqamet": i === 0 ? (team.track ?? "") : "",
        "Status": i === 0 ? team.status : "",
        "Qeydiyyat tarixi": i === 0 ? new Date(team.created_at).toLocaleDateString("az-AZ") : "",
        "Uzv adi": m?.full_name ?? "",
        "E-poct": m?.email ?? "",
        "Rol": m?.role ?? "",
        "Universitet": m?.university ?? "",
      });
    }
  }
  return rows;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportParticipants(hackathonId: string): Promise<any[]> {
  const supabase = getSupabase();
  const { data: members } = await supabase
    .from("team_members")
    .select("full_name, email, role, university, phone, teams!inner(name, track, hackathon_id)")
    .eq("teams.hackathon_id", hackathonId);

  if (!members) return [];

  return members.map((m) => {
    const team = m.teams as unknown as { name: string; track: string };
    return {
      "Ad": m.full_name ?? "",
      "E-poct": m.email ?? "",
      "Telefon": m.phone ?? "",
      "Rol": m.role ?? "",
      "Universitet": m.university ?? "",
      "Komanda": team?.name ?? "",
      "Istiqamet": team?.track ?? "",
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportRegistrations(hackathonId: string): Promise<any[]> {
  const supabase = getSupabase();
  const { data: regs } = await supabase
    .from("registrations")
    .select("*")
    .eq("hackathon_id", hackathonId)
    .order("created_at", { ascending: false });

  if (!regs) return [];

  return regs.map((r) => ({
    "Komanda adi": r.team_name ?? "",
    "Istiqamet": r.track ?? "",
    "Status": r.status ?? "",
    "Tarix": new Date(r.created_at).toLocaleDateString("az-AZ"),
    "Kapitan": r.captain_name ?? "",
    "E-poct": r.captain_email ?? "",
    "Uzv sayi": r.member_count ?? "",
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportAttendance(hackathonId: string): Promise<any[]> {
  const supabase = getSupabase();
  const { data: bookings } = await supabase
    .from("session_bookings")
    .select("created_at, sessions!inner(title, session_type, session_date, hackathon_id), profiles(full_name, email)")
    .eq("sessions.hackathon_id", hackathonId);

  if (!bookings) return [];

  return bookings.map((b) => {
    const session = b.sessions as unknown as { title: string; session_type: string; session_date: string };
    const profile = b.profiles as unknown as { full_name: string; email: string } | null;
    return {
      "Sessiya": session?.title ?? "",
      "Tip": session?.session_type ?? "",
      "Tarix": session?.session_date ?? "",
      "Istirakci": profile?.full_name ?? "",
      "E-poct": profile?.email ?? "",
      "Qeydiyyat tarixi": new Date(b.created_at).toLocaleDateString("az-AZ"),
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportSubmissions(hackathonId: string): Promise<any[]> {
  const supabase = getSupabase();
  const { data: subs } = await supabase
    .from("submissions")
    .select("*, teams(name, track)")
    .eq("hackathon_id", hackathonId);

  if (!subs) return [];

  return subs.map((s) => {
    const team = s.teams as unknown as { name: string; track: string };
    return {
      "Komanda": team?.name ?? "",
      "Istiqamet": team?.track ?? "",
      "Layihe adi": s.title ?? "",
      "Tesvir": s.description ?? "",
      "Demo URL": s.demo_url ?? "",
      "Repo URL": s.repo_url ?? "",
      "Gonderilme tarixi": s.submitted_at ? new Date(s.submitted_at).toLocaleDateString("az-AZ") : "Gonderilmeyib",
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportScores(hackathonId: string): Promise<any[]> {
  const supabase = getSupabase();

  // Get judging round
  const { data: round } = await supabase
    .from("judging_rounds")
    .select("id")
    .order("is_active", { ascending: false })
    .order("round_number", { ascending: false })
    .limit(1)
    .single();

  if (!round) return [{ "Melumat": "Qiymetlendirme raund tapilmadi" }];

  const { data: assignments } = await supabase
    .from("judge_assignments")
    .select("judge_id, team_id, is_completed")
    .eq("round_id", round.id);

  if (!assignments || assignments.length === 0) return [{ "Melumat": "Teyin olunma yoxdur" }];

  const { data: scores } = await supabase
    .from("scores")
    .select("judge_id, team_id, criterion_id, score")
    .eq("round_id", round.id);

  // Get profiles and teams
  const judgeIds = [...new Set(assignments.map(a => a.judge_id))];
  const teamIds = [...new Set(assignments.map(a => a.team_id))];

  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", judgeIds);
  const { data: teams } = await supabase.from("teams").select("id, name, track").in("id", teamIds);

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p.full_name]));
  const teamMap = new Map((teams ?? []).map(t => [t.id, { name: t.name, track: t.track }]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = [];
  for (const a of assignments) {
    const judgeScores = (scores ?? []).filter(s => s.judge_id === a.judge_id && s.team_id === a.team_id);
    const total = judgeScores.reduce((sum, s) => sum + s.score, 0);
    const team = teamMap.get(a.team_id);
    rows.push({
      "Munsif": profileMap.get(a.judge_id) ?? "",
      "Komanda": team?.name ?? "",
      "Istiqamet": team?.track ?? "",
      "Umumi bal": total,
      "Tamamlanib": a.is_completed ? "Beli" : "Xeyr",
    });
  }

  rows.sort((a, b) => b["Umumi bal"] - a["Umumi bal"]);
  return rows;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EXPORT_HANDLERS: Record<string, (hackathonId: string) => Promise<Record<string, any>[]>> = {
  teams: exportTeams,
  participants: exportParticipants,
  registrations: exportRegistrations,
  attendance: exportAttendance,
  submissions: exportSubmissions,
  scores: exportScores,
};

const FILE_NAMES: Record<string, string> = {
  teams: "Komandalar",
  participants: "Istirakcilar",
  registrations: "Qeydiyyatlar",
  attendance: "Davamiyyet",
  submissions: "Teqdimatlar",
  scores: "Qiymetler",
};

export async function GET(request: NextRequest) {
  try {
    const hackathonId = await getHackathonId();
    if (!hackathonId) {
      return NextResponse.json({ error: "Aktiv hakaton tapilmadi" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "teams";

    if (type === "full_report") {
      // For full report, combine all into one CSV
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allRows: any[] = [];
      for (const [key, handler] of Object.entries(EXPORT_HANDLERS)) {
        const rows = await handler(hackathonId);
        if (rows.length > 0) {
          allRows.push({ "---": `=== ${FILE_NAMES[key] ?? key} ===` });
          allRows.push(...rows);
          allRows.push({});
        }
      }
      const csv = toCsv(allRows.length > 0 ? allRows : [{ "Melumat": "Melumat tapilmadi" }]);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="LevelUP_Tam_Hesabat_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const handler = EXPORT_HANDLERS[type];
    if (!handler) {
      return NextResponse.json({ error: "Yanlis eksport tipi" }, { status: 400 });
    }

    const rows = await handler(hackathonId);
    const csv = toCsv(rows.length > 0 ? rows : [{ "Melumat": "Melumat tapilmadi" }]);
    const fileName = `LevelUP_${FILE_NAMES[type] ?? type}_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Server xetasi: " + (err instanceof Error ? err.message : "Unknown") }, { status: 500 });
  }
}
