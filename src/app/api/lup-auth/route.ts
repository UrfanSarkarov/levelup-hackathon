import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_USER || "levelup-admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "LvlUp@WUF13#2026";
const SESSION_TOKEN = process.env.SESSION_TOKEN || "lup-session-9f3k2m7x";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("lup_session", SESSION_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8, // 8 hours
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ success: false, error: "Yanlış istifadəçi adı və ya şifrə" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "Server xətası" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("lup_session")?.value;
  if (token === SESSION_TOKEN) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("lup_session");
  return response;
}
