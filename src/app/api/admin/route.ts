import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";

const SESSION_TOKEN = process.env.SESSION_TOKEN || "lup-session-9f3k2m7x";

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get("lup_session")?.value;
  return token === SESSION_TOKEN;
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dataDir = path.join(process.cwd(), "data", "registrations");

    let files: string[];
    try {
      files = await readdir(dataDir);
    } catch {
      return NextResponse.json({ registrations: [], count: 0 });
    }

    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const registrations = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await readFile(path.join(dataDir, file), "utf-8");
        return { filename: file, ...JSON.parse(content) };
      })
    );

    registrations.sort((a, b) => {
      const dateA = a.filename.split("_").pop()?.replace(".json", "") || "";
      const dateB = b.filename.split("_").pop()?.replace(".json", "") || "";
      return dateB.localeCompare(dateA);
    });

    return NextResponse.json({ registrations, count: registrations.length });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
