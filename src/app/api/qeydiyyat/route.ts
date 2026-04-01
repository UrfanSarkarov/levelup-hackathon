import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Basic validation
    if (!data.komandaAdi || !data.istiqamet) {
      return NextResponse.json(
        { error: "Komanda adı və istiqamət tələb olunur" },
        { status: 400 }
      );
    }

    if (!data.members || data.members.length < 3) {
      return NextResponse.json(
        { error: "Minimum 3 komanda üzvü tələb olunur" },
        { status: 400 }
      );
    }

    // Check consent
    if (!data.raziliq) {
      return NextResponse.json(
        { error: "İştirak şərtləri qəbul edilməlidir" },
        { status: 400 }
      );
    }

    // Save to file (in production, use a database)
    const dataDir = path.join(process.cwd(), "data", "registrations");
    await mkdir(dataDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${data.komandaAdi.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}.json`;
    const filepath = path.join(dataDir, filename);

    await writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json(
      { message: "Qeydiyyat uğurla tamamlandı", id: filename },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Server xətası baş verdi" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    deadline: "2026-04-25T23:59:59",
    message: "Qeydiyyat aktivdir",
  });
}
