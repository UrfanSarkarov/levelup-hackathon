"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MemberData {
  ad: string; soyad: string; elaqe: string; email: string; cv?: string;
  rol: string; universitet: string; ixtisas: string; kurs: string; is: string;
}
interface Registration {
  filename: string;
  komandaAdi: string;
  istiqamet: string;
  members: MemberData[];
  hakatonTecrube: string;
  texnolojiBacariq?: string;
  prototipAletler: string;
  layiheIdareetme: string;
  hakatonMelumat: string;
  layiheAdi: string;
  problem: string;
  ideya: string;
  trackAspekt: string;
  prototipFormati: string[];
  texnologiyalar: string;
  urbanTesir: string;
  ferq: string;
  davamliliq?: string;
  riskler?: string;
  madeInAz: string;
}

/* ─── Login Form ─── */
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/lup-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Xəta baş verdi");
      }
    } catch {
      setError("Şəbəkə xətası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#2EC4B6] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0D47A1]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#0D47A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Admin Panel</h1>
          <p className="text-sm text-[#718096] mt-1">Level UP Hackathon</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">İstifadəçi adı</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/30 focus:border-[#0D47A1] transition-all text-[#1A1A2E]"
              placeholder="İstifadəçi adınızı daxil edin" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Şifrə</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/30 focus:border-[#0D47A1] transition-all text-[#1A1A2E]"
                placeholder="Şifrənizi daxil edin" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#0D47A1] hover:bg-[#1565C0] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Yüklənir...</>
            ) : "Daxil ol"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Detail Component ─── */
function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-1">{label}</div>
      <p className="text-sm text-[#4A5568] whitespace-pre-wrap bg-[#F5F7FA] rounded-lg p-3">{value}</p>
    </div>
  );
}

/* ─── Mini Bar Chart ─── */
function TrackChart({ data }: { data: { name: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const colors = ["#0D47A1", "#2EC4B6", "#6BBF6B", "#F59E0B"];
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-[#1A1A2E] mb-4">İstiqamətlər üzrə paylanma</h3>
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={d.name}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#4A5568] truncate max-w-[180px]">{d.name}</span>
              <span className="font-bold text-[#1A1A2E]">{d.count}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(d.count / max) * 100}%`, backgroundColor: colors[i % colors.length] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Registration | null>(null);
  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState("all");
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"layihe" | "uzvler" | "tecrube">("layihe");

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then((d) => setRegistrations(d.registrations || []))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/lup-auth", { method: "DELETE" });
    onLogout();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `LevelUP_Qeydiyyatlar_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert("Export xətası baş verdi");
      }
    } catch {
      alert("Şəbəkə xətası");
    } finally {
      setExporting(false);
    }
  };

  const tracks = ["all", "Smart Mobility", "Smart & Circular Housing Resources", "AI-Driven Disaster Resilience", "Green Technology"];
  const trackCounts = tracks.slice(1).map((t) => ({
    name: t,
    count: registrations.filter((r) => r.istiqamet === t).length,
  }));

  const totalMembers = registrations.reduce((sum, r) => sum + (r.members?.length || 0), 0);
  const universiteler = new Set(registrations.flatMap((r) => (r.members || []).map((m) => m.universitet).filter(Boolean)));

  const filtered = registrations.filter((r) => {
    const matchSearch = r.komandaAdi?.toLowerCase().includes(search.toLowerCase()) ||
      r.layiheAdi?.toLowerCase().includes(search.toLowerCase()) ||
      r.members?.some((m) => `${m.ad} ${m.soyad}`.toLowerCase().includes(search.toLowerCase()));
    const matchTrack = filterTrack === "all" || r.istiqamet === filterTrack;
    return matchSearch && matchTrack;
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#0D47A1] text-sm font-medium hover:underline">← Sayta qayıt</Link>
            <div className="w-px h-6 bg-gray-200" />
            <div>
              <h1 className="text-lg font-bold text-[#1A1A2E]">Level UP Admin</h1>
              <p className="text-xs text-[#718096]">Qeydiyyat İdarəetmə Paneli</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Excel Export */}
            <button onClick={handleExport} disabled={exporting || registrations.length === 0}
              className="hidden sm:flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {exporting ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              )}
              Excel Export
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Çıxış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Overview stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0D47A1]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0D47A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0D47A1]">{registrations.length}</div>
                <div className="text-xs text-[#718096]">Komanda</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2EC4B6]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#2EC4B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#2EC4B6]">{totalMembers}</div>
                <div className="text-xs text-[#718096]">İştirakçı</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#6BBF6B]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#6BBF6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#6BBF6B]">{universiteler.size}</div>
                <div className="text-xs text-[#718096]">Universitet</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">4</div>
                <div className="text-xs text-[#718096]">İstiqamət</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart + Quick info row */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <TrackChart data={trackCounts} />
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#1A1A2E] mb-4">Sürətli Məlumat</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-[#718096]">Qeydiyyat son tarix</span>
                <span className="font-semibold text-[#1A1A2E]">25 Aprel 2026</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-[#718096]">Maks. komanda sayı</span>
                <span className="font-semibold text-[#1A1A2E]">15</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-[#718096]">Yer doluluğu</span>
                <span className={`font-semibold ${registrations.length >= 15 ? "text-red-500" : "text-green-600"}`}>{Math.round((registrations.length / 15) * 100)}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-[#718096]">Ort. komanda ölçüsü</span>
                <span className="font-semibold text-[#1A1A2E]">{registrations.length > 0 ? (totalMembers / registrations.length).toFixed(1) : "—"} nəfər</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#718096]">Hakaton təcrübəsi olan</span>
                <span className="font-semibold text-[#1A1A2E]">{registrations.filter((r) => r.hakatonTecrube === "Bəli" || (r.hakatonTecrube && r.hakatonTecrube.toLowerCase().includes("bəli"))).length} komanda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile export button */}
        <div className="sm:hidden mb-4">
          <button onClick={handleExport} disabled={exporting || registrations.length === 0}
            className="w-full flex items-center justify-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Excel-ə Export et
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Komanda, layihə və ya üzv adı ilə axtar..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20 focus:border-[#0D47A1]" />
          </div>
          <select value={filterTrack} onChange={(e) => setFilterTrack(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20 focus:border-[#0D47A1]">
            <option value="all">Bütün istiqamətlər ({registrations.length})</option>
            {tracks.slice(1).map((t) => <option key={t} value={t}>{t} ({registrations.filter((r) => r.istiqamet === t).length})</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#718096]">
            <svg className="w-8 h-8 animate-spin mx-auto mb-3 text-[#0D47A1]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Yüklənir...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Nəticə tapılmadı</h2>
            <p className="text-[#718096]">Hələ qeydiyyat yoxdur və ya axtarış nəticəsi boşdur.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-1 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              <div className="text-xs text-[#718096] mb-2 px-1">{filtered.length} nəticə göstərilir</div>
              {filtered.map((r, i) => (
                <button key={i} onClick={() => { setSelected(r); setActiveTab("layihe"); }}
                  className={`w-full text-left bg-white rounded-xl p-4 border transition-all hover:shadow-md ${selected?.filename === r.filename ? "border-[#0D47A1] ring-2 ring-[#0D47A1]/20 shadow-md" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-[#1A1A2E] truncate">{r.komandaAdi}</div>
                      <div className="text-xs text-[#0D47A1] font-medium mt-0.5 truncate">{r.istiqamet}</div>
                    </div>
                    <span className="flex-shrink-0 text-xs bg-[#F5F7FA] text-[#718096] px-2 py-1 rounded-full">{r.members?.length || 0} üzv</span>
                  </div>
                  <div className="text-xs text-[#718096] mt-2 truncate">📋 {r.layiheAdi}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.hakatonTecrube === "Bəli" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"}`}>
                      {r.hakatonTecrube === "Bəli" ? "Təcrübəli" : r.hakatonTecrube === "Xeyr" ? "Yeni" : "—"}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-2">
              {selected ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">
                  {/* Detail header */}
                  <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold">{selected.komandaAdi}</h2>
                        <span className="inline-block mt-2 text-xs bg-white/20 px-3 py-1 rounded-full">{selected.istiqamet}</span>
                        <div className="flex items-center gap-4 mt-3 text-xs text-white/70">
                          <span>{selected.members?.length || 0} üzv</span>
                          <span>·</span>
                          <span>{selected.hakatonTecrube === "Bəli" ? "Hakaton təcrübəsi var" : "İlk hakaton"}</span>
                          <span>·</span>
                          <span>{selected.hakatonMelumat}</span>
                        </div>
                      </div>
                      <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-100">
                    {([
                      { key: "layihe" as const, label: "Layihə", icon: "📋" },
                      { key: "uzvler" as const, label: "Üzvlər", icon: "👥" },
                      { key: "tecrube" as const, label: "Təcrübə", icon: "🎯" },
                    ]).map((tab) => (
                      <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 text-sm font-medium text-center transition-all ${activeTab === tab.key ? "text-[#0D47A1] border-b-2 border-[#0D47A1] bg-[#0D47A1]/5" : "text-[#718096] hover:text-[#1A1A2E]"}`}>
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-6 max-h-[55vh] overflow-y-auto">
                    {activeTab === "layihe" && (
                      <div className="space-y-4">
                        <div className="bg-[#0D47A1]/5 rounded-xl p-4 mb-4">
                          <h3 className="font-bold text-[#0D47A1] text-lg">{selected.layiheAdi}</h3>
                        </div>
                        <Detail label="Hədəflənən şəhər problemi" value={selected.problem} />
                        <Detail label="Layihə ideyası və məqsədi" value={selected.ideya} />
                        <Detail label="İstiqamət aspekti" value={selected.trackAspekt} />
                        {selected.prototipFormati?.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-[#718096] uppercase tracking-wide mb-2">Prototip formatı</div>
                            <div className="flex flex-wrap gap-2">
                              {selected.prototipFormati.map((p) => (
                                <span key={p} className="text-xs bg-[#0D47A1]/10 text-[#0D47A1] px-3 py-1.5 rounded-full font-medium">{p}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <Detail label="İstifadə ediləcək texnologiyalar" value={selected.texnologiyalar} />
                        <Detail label="Urban mühitə müsbət təsir" value={selected.urbanTesir} />
                        <Detail label="Mövcud həllərdən fərqi" value={selected.ferq} />
                        {selected.davamliliq && <Detail label="Davamlılıq planı" value={selected.davamliliq} />}
                        {selected.riskler && <Detail label="Risklər" value={selected.riskler} />}
                        <Detail label="Made in Azerbaijan" value={selected.madeInAz} />
                      </div>
                    )}

                    {activeTab === "uzvler" && (
                      <div className="space-y-3">
                        {selected.members?.map((m, i) => (
                          <div key={i} className="bg-[#F5F7FA] rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-8 h-8 rounded-full bg-[#0D47A1] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                              <div>
                                <span className="font-semibold text-[#1A1A2E]">{m.ad} {m.soyad}</span>
                                {i === 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Rəhbər</span>}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-[#4A5568]">
                              {m.rol && <div className="flex items-center gap-1"><strong className="text-[#718096]">Rol:</strong> {m.rol}</div>}
                              {m.universitet && <div className="flex items-center gap-1"><strong className="text-[#718096]">Univ:</strong> {m.universitet}</div>}
                              {m.ixtisas && <div className="flex items-center gap-1"><strong className="text-[#718096]">İxtisas:</strong> {m.ixtisas}</div>}
                              {m.kurs && <div className="flex items-center gap-1"><strong className="text-[#718096]">Kurs:</strong> {m.kurs}</div>}
                              {m.email && <div className="col-span-2"><strong className="text-[#718096]">Email:</strong> <a href={`mailto:${m.email}`} className="text-[#0D47A1] hover:underline">{m.email}</a></div>}
                              {m.elaqe && <div className="col-span-2"><strong className="text-[#718096]">Tel:</strong> <a href={`tel:${m.elaqe}`} className="text-[#0D47A1] hover:underline">{m.elaqe}</a></div>}
                              {m.cv && <div className="col-span-2"><strong className="text-[#718096]">CV:</strong> <a href={m.cv} target="_blank" rel="noopener noreferrer" className="text-[#0D47A1] hover:underline break-all">{m.cv}</a></div>}
                              {m.is && <div className="col-span-2"><strong className="text-[#718096]">İş:</strong> {m.is}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "tecrube" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className={`rounded-xl p-4 text-center ${selected.hakatonTecrube === "Bəli" ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
                            <div className="text-2xl mb-1">{selected.hakatonTecrube === "Bəli" ? "✅" : "🆕"}</div>
                            <div className="text-xs font-medium text-[#1A1A2E]">Hakaton təcrübəsi</div>
                            <div className="text-sm font-bold mt-1">{selected.hakatonTecrube}</div>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                            <div className="text-2xl mb-1">📡</div>
                            <div className="text-xs font-medium text-[#1A1A2E]">Məlumat mənbəyi</div>
                            <div className="text-sm font-bold mt-1">{selected.hakatonMelumat}</div>
                          </div>
                        </div>
                        {selected.texnolojiBacariq && <Detail label="Texnoloji bacarıqlar" value={selected.texnolojiBacariq} />}
                        <Detail label="Prototip alətləri" value={selected.prototipAletler} />
                        <Detail label="Layihə idarəetmə" value={selected.layiheIdareetme} />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                  <div className="text-5xl mb-4">👈</div>
                  <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">Komanda seçin</h3>
                  <p className="text-[#718096]">Detalları görmək üçün sol tərəfdən bir komanda seçin.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function SecureAdminPage() {
  const [authState, setAuthState] = useState<"loading" | "login" | "dashboard">("loading");

  useEffect(() => {
    fetch("/api/lup-auth")
      .then((r) => {
        if (r.ok) setAuthState("dashboard");
        else setAuthState("login");
      })
      .catch(() => setAuthState("login"));
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D47A1] to-[#2EC4B6] flex items-center justify-center">
        <div className="text-white text-center">
          <svg className="w-8 h-8 animate-spin mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Yüklənir...
        </div>
      </div>
    );
  }

  if (authState === "login") {
    return <LoginForm onSuccess={() => setAuthState("dashboard")} />;
  }

  return <Dashboard onLogout={() => setAuthState("login")} />;
}
