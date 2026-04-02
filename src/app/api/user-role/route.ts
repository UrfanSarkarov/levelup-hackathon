import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ role: "team_member" });
  }

  const supabase = getSupabase();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  // Priority: super_admin > trainer > mentor > jury > team_member
  const priority = ["super_admin", "trainer", "mentor", "jury", "team_member"];
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  const bestRole = priority.find((p) => roles.includes(p)) ?? "team_member";

  return NextResponse.json({ role: bestRole });
}
