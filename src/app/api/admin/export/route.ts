import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

const SESSION_TOKEN = process.env.SESSION_TOKEN || "lup-session-9f3k2m7x";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get("lup_session")?.value;
  return token === SESSION_TOKEN;
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
        "İstiqamət": i === 0 ? (team.track ?? "") : "",
        "Status": i === 0 ? team.status : "",
        "Qeydiyyat tarixi": i === 0 ? new Date(team.created_at).toLocaleDateString("az-AZ") : "",
        "Üzv adı": m?.full_name ?? "",
        "E-poçt": m?.email ?? "",
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
      "E-poçt": m.email ?? "",
      "Telefon": m.phone ?? "",
      "Rol": m.role ?? "",
      "Universitet": m.university ?? "",
      "Komanda": team?.name ?? "",
      "İstiqamət": team?.track ?? "",
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
    "Komanda adı": r.team_name ?? "",
    "İstiqamət": r.track ?? "",
    "Status": r.status ?? "",
    "Tarix": new Date(r.created_at).toLocaleDateString("az-AZ"),
    "Kapitan": r.captain_name ?? "",
    "E-poçt": r.captain_email ?? "",
    "Üzv sayı": r.member_count ?? "",
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
      "İştirakçı": profile?.full_name ?? "",
      "E-poçt": profile?.email ?? "",
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
      "İstiqamət": team?.track ?? "",
      "Layihə adı": s.project_name ?? "",
      "Təsvir": s.description ?? "",
      "Demo URL": s.demo_url ?? "",
      "GitHub": s.github_url ?? "",
      "Göndərilmə tarixi": s.submitted_at ? new Date(s.submitted_at).toLocaleDateString("az-AZ") : "Göndərilməyib",
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportScores(hackathonId: string): Promise<any[]> {
  const supabase = getSupabase();
  const { data: scores } = await supabase
    .from("scores")
    .select("score, judge_assignments(teams(name), judging_rounds(name)), scoring_criteria(name), profiles(full_name)")
    .eq("judge_assignments.judging_rounds.hackathon_id", hackathonId);

  if (!scores || scores.length === 0) {
    return [{ "Məlumat": "Hələ qiymətləndirmə aparılmayıb" }];
  }

  return scores.map((s) => ({
    "Münsif": (s.profiles as unknown as { full_name: string })?.full_name ?? "",
    "Komanda": "",
    "Meyar": (s.scoring_criteria as unknown as { name: string })?.name ?? "",
    "Bal": s.score ?? 0,
  }));
}

const EXPORT_HANDLERS: Record<string, (hackathonId: string) => Promise<unknown[]>> = {
  teams: exportTeams,
  participants: exportParticipants,
  registrations: exportRegistrations,
  attendance: exportAttendance,
  submissions: exportSubmissions,
  scores: exportScores,
};

const SHEET_NAMES: Record<string, string> = {
  teams: "Komandalar",
  participants: "İştirakçılar",
  registrations: "Qeydiyyatlar",
  attendance: "Davamiyyət",
  submissions: "Təqdimatlar",
  scores: "Qiymətlər",
};

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hackathonId = await getHackathonId();
    if (!hackathonId) {
      return NextResponse.json({ error: "Aktiv hakaton tapılmadı" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "teams";

    const wb = XLSX.utils.book_new();

    if (type === "full_report") {
      for (const [key, handler] of Object.entries(EXPORT_HANDLERS)) {
        const rows = await handler(hackathonId);
        if (rows.length > 0) {
          const ws = XLSX.utils.json_to_sheet(rows);
          autoWidth(ws, rows);
          XLSX.utils.book_append_sheet(wb, ws, SHEET_NAMES[key] ?? key);
        }
      }
    } else {
      const handler = EXPORT_HANDLERS[type];
      if (!handler) {
        return NextResponse.json({ error: "Yanlış eksport tipi" }, { status: 400 });
      }
      const rows = await handler(hackathonId);
      const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ "Məlumat": "Məlumat tapılmadı" }]);
      autoWidth(ws, rows);
      XLSX.utils.book_append_sheet(wb, ws, SHEET_NAMES[type] ?? "Data");
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const fileName = type === "full_report" ? "LevelUP_Tam_Hesabat" : `LevelUP_${SHEET_NAMES[type] ?? type}`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Excel export error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function autoWidth(ws: XLSX.WorkSheet, rows: any[]) {
  if (rows.length === 0) return;
  const colWidths = Object.keys(rows[0]).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((r) => String(r[key] || "").length),
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  ws["!cols"] = colWidths;
}
