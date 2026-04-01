import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";

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
      files = [];
    }

    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registrations: any[] = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await readFile(path.join(dataDir, file), "utf-8");
        return JSON.parse(content);
      })
    );

    // Build flat rows for Excel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = [];

    for (const reg of registrations) {
      const members = reg.members || [];
      const maxMembers = Math.max(members.length, 1);

      for (let i = 0; i < maxMembers; i++) {
        const m = members[i] || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row: any = {};

        if (i === 0) {
          row["Komanda adı"] = reg.komandaAdi || "";
          row["İstiqamət"] = reg.istiqamet || "";
          row["Layihə adı"] = reg.layiheAdi || "";
          row["Problem"] = reg.problem || "";
          row["İdeya"] = reg.ideya || "";
          row["İstiqamət aspekti"] = reg.trackAspekt || "";
          row["Prototip formatı"] = (reg.prototipFormati || []).join(", ");
          row["Texnologiyalar"] = reg.texnologiyalar || "";
          row["Urban təsir"] = reg.urbanTesir || "";
          row["Fərq"] = reg.ferq || "";
          row["Made in Azerbaijan"] = reg.madeInAz || "";
          row["Hakaton təcrübəsi"] = reg.hakatonTecrube || "";
          row["Prototip alətləri"] = reg.prototipAletler || "";
          row["Layihə idarəetmə"] = reg.layiheIdareetme || "";
          row["Məlumat mənbəyi"] = reg.hakatonMelumat || "";
        } else {
          row["Komanda adı"] = "";
          row["İstiqamət"] = "";
          row["Layihə adı"] = "";
          row["Problem"] = "";
          row["İdeya"] = "";
          row["İstiqamət aspekti"] = "";
          row["Prototip formatı"] = "";
          row["Texnologiyalar"] = "";
          row["Urban təsir"] = "";
          row["Fərq"] = "";
          row["Made in Azerbaijan"] = "";
          row["Hakaton təcrübəsi"] = "";
          row["Prototip alətləri"] = "";
          row["Layihə idarəetmə"] = "";
          row["Məlumat mənbəyi"] = "";
        }

        row["Üzv #"] = i + 1;
        row["Ad"] = m.ad || "";
        row["Soyad"] = m.soyad || "";
        row["Əlaqə nömrəsi"] = m.elaqe || "";
        row["E-poçt"] = m.email || "";
        row["Rol"] = m.rol || "";
        row["Universitet"] = m.universitet || "";
        row["İxtisas"] = m.ixtisas || "";
        row["Kurs"] = m.kurs || "";
        row["İş yeri"] = m.is || "";

        rows.push(row);
      }
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-width columns
    const colWidths = Object.keys(rows[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...rows.map((r) => String(r[key] || "").length)
      );
      return { wch: Math.min(maxLen + 2, 50) };
    });
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Qeydiyyatlar");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="LevelUP_Qeydiyyatlar_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Excel export error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
