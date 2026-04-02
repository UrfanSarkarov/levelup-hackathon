import { NextRequest, NextResponse } from "next/server";

function getCredentials() {
  return {
    adminUser: process.env.ADMIN_USER || "levelup-admin",
    adminPass: process.env.ADMIN_PASS || "LvlUp@WUF13#2026",
    sessionToken: process.env.SESSION_TOKEN || "lup-session-9f3k2m7x",
  };
}

export async function POST(request: NextRequest) {
  try {
    const { adminUser, adminPass, sessionToken } = getCredentials();
    const { username, password } = await request.json();

    if (username === adminUser && password === adminPass) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("lup_session", sessionToken, {
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
  const { sessionToken } = getCredentials();
  const token = request.cookies.get("lup_session")?.value;
  if (token === sessionToken) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("lup_session");
  return response;
}
