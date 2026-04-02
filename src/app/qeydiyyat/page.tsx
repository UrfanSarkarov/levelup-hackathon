"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface MemberData {
  ad: string; soyad: string; elaqe: string; email: string;
  rol: string; universitet: string; ixtisas: string; kurs: string; is: string;
}
interface FormData {
  komandaAdi: string; istiqamet: string; members: MemberData[];
  hakatonTecrube: string; prototipAletler: string;
  layiheIdareetme: string; hakatonMelumat: string; layiheAdi: string;
  problem: string; ideya: string; trackAspekt: string; prototipFormati: string[];
  texnologiyalar: string; urbanTesir: string; ferq: string; madeInAz: string;
  raziliq: boolean;
}

const emptyMember = (): MemberData => ({ ad: "", soyad: "", elaqe: "", email: "", rol: "", universitet: "", ixtisas: "", kurs: "", is: "" });
const initialForm: FormData = {
  komandaAdi: "", istiqamet: "", members: [emptyMember(), emptyMember(), emptyMember()],
  hakatonTecrube: "", prototipAletler: "", layiheIdareetme: "", hakatonMelumat: "",
  layiheAdi: "", problem: "", ideya: "", trackAspekt: "", prototipFormati: [], texnologiyalar: "",
  urbanTesir: "", ferq: "", madeInAz: "",
  raziliq: false,
};

const istiqametler = ["Smart Mobility", "Smart & Circular Housing Resources", "AI-Driven Disaster Resilience", "Green Technology"];
const kurslar = ["1-ci kurs", "2-ci kurs", "3-cü kurs", "4-cü kurs", "5-ci kurs", "6-cı kurs"];
const prototipSecimler = ["Mobil tətbiq prototipi", "Veb platforması", "IoT cihaz/sensor prototipi", "AI/ML modeli", "Dashboard/Vizualizasiya aləti", "Hardware prototipi", "Digər"];
const melumatMenbeler = ["Sosial media", "Universitetdəki infosessiya", "WUF13 Roadshow", "Dost tövsiyəsi", "Digər"];

function SectionTitle({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0D47A1]/10 text-[#0D47A1] font-bold flex items-center justify-center text-lg">{step}</span>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E]">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-[#718096] pl-[52px]">{subtitle}</p>}
    </div>
  );
}

function InputField({ label, required, type = "text", value, onChange, placeholder, hint, pattern, inputMode }: {
  label: string; required?: boolean; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; pattern?: string; inputMode?: "text" | "tel" | "email" | "numeric";
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} pattern={pattern} inputMode={inputMode}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A2E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/30 focus:border-[#0D47A1] transition-all" />
      {hint && <p className="text-xs text-[#718096] mt-1">{hint}</p>}
    </div>
  );
}

function TextArea({ label, required, value, onChange, placeholder, hint, maxLength }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} maxLength={maxLength} rows={4}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A2E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/30 focus:border-[#0D47A1] transition-all resize-y" />
      <div className="flex justify-between mt-1">
        {hint && <p className="text-xs text-[#718096]">{hint}</p>}
        {maxLength && <p className="text-xs text-[#718096] ml-auto">{value.length}/{maxLength}</p>}
      </div>
    </div>
  );
}

function SelectField({ label, required, value, onChange, options, placeholder }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/30 focus:border-[#0D47A1] transition-all">
        <option value="">{placeholder || "Seçin..."}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function MemberForm({ index, data, onChange, isRequired, isLeader }: {
  index: number; data: MemberData; onChange: (field: keyof MemberData, value: string) => void; isRequired: boolean; isLeader: boolean;
}) {
  const label = isLeader ? "Komanda Rəhbəri (İştirakçı 1)" : `İştirakçı ${index + 1}${index >= 3 ? " (İsteğe bağlı)" : ""}`;
  return (
    <div className="light-card p-6">
      <h3 className="text-lg font-semibold text-[#0D47A1] mb-5 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-[#0D47A1]/10 flex items-center justify-center text-sm font-bold">{index + 1}</span>
        {label}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <InputField label="Ad" required={isRequired} value={data.ad} onChange={(v) => onChange("ad", v)} />
        <InputField label="Soyad" required={isRequired} value={data.soyad} onChange={(v) => onChange("soyad", v)} />
        <InputField label="Əlaqə nömrəsi" required={isRequired} value={data.elaqe} onChange={(v) => onChange("elaqe", v)} type="tel" inputMode="tel" placeholder="+994 XX XXX XX XX" pattern="[+]?[0-9\s\-]{7,18}" hint="Yalnız telefon nömrəsi daxil edin" />
        <InputField label="E-poçt adresi" required={isRequired} value={data.email} onChange={(v) => onChange("email", v)} type="email" inputMode="email" placeholder="numune@email.com" hint="Yalnız e-poçt adresi daxil edin" />
        <InputField label="Komandadakı rolu/vəzifəsi" required={isRequired} value={data.rol} onChange={(v) => onChange("rol", v)} hint="Məs: Frontend Developer, UI/UX Designer, Project Manager" />
        <InputField label="Təhsil aldığınız universitet" required={isRequired} value={data.universitet} onChange={(v) => onChange("universitet", v)} />
        <InputField label="İxtisas" required={index < 3} value={data.ixtisas} onChange={(v) => onChange("ixtisas", v)} />
        <SelectField label="Kurs" required={isRequired} value={data.kurs} onChange={(v) => onChange("kurs", v)} options={kurslar} placeholder="Kurs seçin..." />
        <div className="sm:col-span-2">
          <InputField label="İşləyirsinizsə, müəssisənin adı və vəzifəniz" value={data.is} onChange={(v) => onChange("is", v)} />
        </div>
      </div>
    </div>
  );
}

/* ── Terms Modal ── */
function TermsModal({ open, onClose, onAccept }: { open: boolean; onClose: () => void; onAccept: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-fade-in-up">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#1A1A2E]">İştirak Şərtləri və Razılıq</h3>
          <p className="text-sm text-[#718096] mt-1">Aşağıdakı şərtləri diqqətlə oxuyun</p>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-[#4A5568] leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="text-[#0D47A1] font-bold mt-0.5">1.</span>
            <p>Mən, Level UP Hackathon-un bütün qaydalarını, etika və etiket normalarını oxudum və qəbul edirəm. Hakaton müddətində təşkilat komitəsinin qərarlarına hörmətlə yanaşacağıma söz verirəm.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#0D47A1] font-bold mt-0.5">2.</span>
            <p>Mən, hakaton nəticələrinə qarşı media və sosial şəbəkələrdə mənfi PR kampaniyası aparmayacağıma söz verirəm. Müsabiqə nəticələrini hörmətlə qəbul edəcəyəm.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#0D47A1] font-bold mt-0.5">3.</span>
            <p>Mən, hakaton zamanı çəkilən foto, video materialların PR və kommunikasiya məqsədilə istifadə edilməsinə razılıq verirəm. Bu materiallarda komanda və layihəm təmsil oluna bilər.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#0D47A1] font-bold mt-0.5">4.</span>
            <p>Mən, digər komandaların ideyaları barədə məxfilik prinsipinə riayət edəcəyimi təsdiq edirəm. Hakaton zamanı eşitdiyim və ya gördüyüm layihə ideyalarını kənar şəxslərlə paylaşmayacağam.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#0D47A1] font-bold mt-0.5">5.</span>
            <p>Mən, şəxsi məlumatlarımın yalnız tədbirin idarə edilməsi üçün emal ediləcəyini qəbul edirəm. Məlumatlarım üçüncü tərəflərlə paylaşılmayacaq və yalnız Level UP Hackathon məqsədləri üçün istifadə olunacaq.</p>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 border border-gray-200 text-[#4A5568] font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all">
            İmtina edirəm
          </button>
          <button type="button" onClick={onAccept}
            className="flex-1 bg-[#0D47A1] hover:bg-[#1565C0] text-white font-semibold py-3 rounded-xl transition-all">
            Qəbul edirəm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QeydiyyatPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSubmitting, setAccountSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountForm, setAccountForm] = useState({ password: "", confirmPassword: "" });
  const totalSteps = 3;

  const updateMember = (index: number, field: keyof MemberData, value: string) => {
    const m = [...form.members]; m[index] = { ...m[index], [field]: value }; setForm({ ...form, members: m });
  };
  const addMember = () => { if (form.members.length < 5) setForm({ ...form, members: [...form.members, emptyMember()] }); };
  const removeMember = (i: number) => { if (form.members.length > 3 && i >= 3) setForm({ ...form, members: form.members.filter((_, j) => j !== i) }); };
  const togglePrototip = (v: string) => {
    const c = form.prototipFormati;
    setForm({ ...form, prototipFormati: c.includes(v) ? c.filter((x) => x !== v) : [...c, v] });
  };
  const handleSubmit = async () => {
    if (!form.raziliq) {
      setShowTerms(true);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/qeydiyyat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        setTeamId(data.teamId);
        setSubmitted(true);
      } else {
        alert(data.error || "Xəta baş verdi.");
      }
    } catch { alert("Şəbəkə xətası."); } finally { setSubmitting(false); }
  };

  const handleCreateAccount = async () => {
    setAccountError("");
    if (accountForm.password.length < 6) {
      setAccountError("Parol minimum 6 simvol olmalıdır");
      return;
    }
    if (accountForm.password !== accountForm.confirmPassword) {
      setAccountError("Parollar uyğun gəlmir");
      return;
    }
    setAccountSubmitting(true);
    try {
      const captain = form.members[0];
      const res = await fetch("/api/hesab-yarat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          email: captain.email,
          password: accountForm.password,
          fullName: `${captain.ad} ${captain.soyad}`.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAccountCreated(true);
      } else {
        setAccountError(data.error || "Hesab yaradılarkən xəta baş verdi");
      }
    } catch {
      setAccountError("Şəbəkə xətası");
    } finally {
      setAccountSubmitting(false);
    }
  };

  // Final success — account created
  if (accountCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F5F7FA]">
        <div className="light-card p-10 sm:p-16 text-center max-w-lg mx-auto">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] mb-4">Hər şey hazırdır!</h1>
          <p className="text-[#4A5568] mb-3">Qeydiyyatınız və hesabınız uğurla yaradıldı.</p>
          <div className="bg-[#0D47A1]/5 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-[#4A5568] mb-1">Giriş məlumatlarınız:</p>
            <p className="text-[#1A1A2E] font-medium">E-poçt: <span className="text-[#0D47A1]">{form.members[0].email}</span></p>
            <p className="text-[#1A1A2E] font-medium">Parol: <span className="text-[#718096]">sizin təyin etdiyiniz parol</span></p>
          </div>
          <p className="text-sm text-[#718096] mb-8">Nəticələr 2 May 2026-dək e-poçt vasitəsilə bildiriləcək.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/giris" className="inline-block bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold px-8 py-3 rounded-xl transition-all">
              Daxil ol
            </Link>
            <Link href="/" className="inline-block border border-gray-300 hover:bg-gray-50 text-[#4A5568] font-bold px-8 py-3 rounded-xl transition-all">
              Ana səhifəyə qayıt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Step: Create account after registration
  if (submitted) {
    const captain = form.members[0];
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F5F7FA]">
        <div className="light-card p-8 sm:p-12 max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">Qeydiyyat tamamlandı!</h1>
            <p className="text-[#718096]">İndi komanda hesabınızı yaradın</p>
          </div>

          <div className="bg-[#F5F7FA] rounded-xl p-4 mb-6">
            <p className="text-xs text-[#718096] uppercase tracking-wide mb-2">Komanda</p>
            <p className="font-semibold text-[#1A1A2E]">{form.komandaAdi}</p>
            <p className="text-sm text-[#718096] mt-1">Kapitan: {captain.ad} {captain.soyad}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">E-poçt (istifadəçi adı)</label>
              <input
                type="email"
                value={captain.email}
                disabled
                className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-[#718096] cursor-not-allowed"
              />
              <p className="text-xs text-[#718096] mt-1">Qeydiyyat zamanı daxil etdiyiniz e-poçt</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Parol <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                  placeholder="Minimum 6 simvol"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A2E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/30 focus:border-[#0D47A1] transition-all pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#1A1A2E] text-sm">
                  {showPassword ? "Gizlə" : "Göstər"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Parolu təsdiqlə <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={accountForm.confirmPassword}
                onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                placeholder="Parolu yenidən daxil edin"
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A2E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/30 focus:border-[#0D47A1] transition-all"
              />
            </div>

            {accountError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {accountError}
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={accountSubmitting || !accountForm.password || !accountForm.confirmPassword}
              className="w-full bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accountSubmitting ? "Yaradılır..." : "Hesabı yarat"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><Image src="/levelup-logo.svg" alt="Level UP" width={80} height={32} className="h-8 w-auto" /></Link>
          <div className="text-sm text-[#718096]">Addım {step}/{totalSteps}</div>
        </div>
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-gradient-to-r from-[#0D47A1] to-[#2EC4B6] transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-2">Qeydiyyat Forması</h1>
          <p className="text-[#718096]">Level UP — Urban Innovation Hackathon | WUF13</p>
          <p className="text-sm text-[#718096] mt-2">Komanda: min 3 — maks 5 nəfər</p>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-fade-in-up">
            <SectionTitle step={1} title="Komanda Məlumatları" subtitle="Komandanın ümumi məlumatları və hər üzvün şəxsi məlumatları" />
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField label="Komanda adı" required value={form.komandaAdi} onChange={(v) => setForm({ ...form, komandaAdi: v })} />
              <SelectField label="Hansı istiqamət üzrə iştirak edirsiniz?" required value={form.istiqamet} onChange={(v) => setForm({ ...form, istiqamet: v })} options={istiqametler} />
            </div>
            <div className="space-y-6">
              {form.members.map((member, i) => (
                <div key={i} className="relative">
                  <MemberForm index={i} data={member} onChange={(f, v) => updateMember(i, f, v)} isRequired={i < 3} isLeader={i === 0} />
                  {i >= 3 && <button type="button" onClick={() => removeMember(i)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm">Sil</button>}
                </div>
              ))}
            </div>
            {form.members.length < 5 && (
              <button type="button" onClick={addMember} className="w-full light-card py-4 text-[#0D47A1] font-medium hover:bg-gray-50 transition-colors border-2 border-dashed border-[#0D47A1]/20">
                + Yeni üzv əlavə et ({form.members.length}/5)
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <SectionTitle step={2} title="Hakaton Təcrübəsi" subtitle="Komandanın əvvəlki təcrübəsini qiymətləndirmək üçün" />
            <SelectField label="Daha əvvəl hakaton/texnoloji yarışmada iştirak edibmi?" required value={form.hakatonTecrube} onChange={(v) => setForm({ ...form, hakatonTecrube: v })} options={["Bəli", "Xeyr"]} placeholder="Seçin..." />
            <TextArea label="Prototip üçün hansı texnologiya/alətlərdən istifadə edəcəksiniz?" required value={form.prototipAletler} onChange={(v) => setForm({ ...form, prototipAletler: v })} hint="Məs: Figma, React, Python Flask, Arduino, TensorFlow" />
            <InputField label="Layihə idarəetmə təcrübəsi olan üzv varmı?" value={form.layiheIdareetme} onChange={(v) => setForm({ ...form, layiheIdareetme: v })} hint="Məs: Agile, Scrum, Kanban" />
            <SelectField label="Hakaton haqqında məlumatı haradan əldə etdiniz?" required value={form.hakatonMelumat} onChange={(v) => setForm({ ...form, hakatonMelumat: v })} options={melumatMenbeler} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <SectionTitle step={3} title="Layihə İdeyası və Prototip Planlaması" subtitle="WUF13 kontekstinə uyğunluq nəzərə alınacaq" />
            <InputField label="Layihənizin adı" required value={form.layiheAdi} onChange={(v) => setForm({ ...form, layiheAdi: v })} />
            <TextArea label="Hansı şəhər problemini həll etməyi hədəfləyirsiniz?" required value={form.problem} onChange={(v) => setForm({ ...form, problem: v })} maxLength={1000} hint="Maks. 1000 simvol" />
            <TextArea label="Layihənizin əsas ideyası və məqsədi" required value={form.ideya} onChange={(v) => setForm({ ...form, ideya: v })} maxLength={1000} hint="Maks. 1000 simvol" />
            <TextArea label="Seçdiyiniz istiqamət daxilində hansı aspekti əhatə edir?" required value={form.trackAspekt} onChange={(v) => setForm({ ...form, trackAspekt: v })} maxLength={1000} hint="Maks. 1000 simvol" />
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-3">Prototip formatı (MVP) <span className="text-red-500">*</span></label>
              <div className="grid sm:grid-cols-2 gap-2">
                {prototipSecimler.map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.prototipFormati.includes(opt) ? "border-[#0D47A1] bg-[#0D47A1]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="checkbox" checked={form.prototipFormati.includes(opt)} onChange={() => togglePrototip(opt)} className="w-4 h-4 accent-[#0D47A1]" />
                    <span className="text-sm text-[#1A1A2E]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <TextArea label="İstifadə edəcəyiniz texnologiyalar" required value={form.texnologiyalar} onChange={(v) => setForm({ ...form, texnologiyalar: v })} maxLength={1000} hint="Maks. 1000 simvol" />
            <TextArea label="Urban mühitə müsbət təsirləri" required value={form.urbanTesir} onChange={(v) => setForm({ ...form, urbanTesir: v })} maxLength={1000} hint="Maks. 1000 simvol" />
            <TextArea label="Mövcud həllərdən fərqi" required value={form.ferq} onChange={(v) => setForm({ ...form, ferq: v })} maxLength={1000} hint="Maks. 1000 simvol" />
            <TextArea label="'Made in Azerbaijan' texnologiyalarına töhfə" value={form.madeInAz} onChange={(v) => setForm({ ...form, madeInAz: v })} />

            {/* Razılıq status */}
            <div className={`light-card p-5 flex items-center justify-between ${form.raziliq ? "border-green-300 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex items-center gap-3">
                {form.raziliq ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ) : (
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                )}
                <div>
                  <p className={`font-medium ${form.raziliq ? "text-green-700" : "text-amber-700"}`}>
                    {form.raziliq ? "İştirak şərtləri qəbul edildi" : "İştirak şərtlərini qəbul etməlisiniz"}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setShowTerms(true)}
                className="text-sm text-[#0D47A1] hover:underline font-medium whitespace-nowrap ml-4">
                {form.raziliq ? "Yenidən oxu" : "Oxu və qəbul et"}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
          {step > 1 ? (
            <button type="button" onClick={() => { setStep(step - 1); window.scrollTo(0, 0); }} className="flex items-center gap-2 text-[#718096] hover:text-[#1A1A2E] transition-colors px-6 py-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Geri
            </button>
          ) : (
            <Link href="/" className="text-[#718096] hover:text-[#1A1A2E] transition-colors px-6 py-3">Ana səhifə</Link>
          )}
          {step < totalSteps ? (
            <button type="button" onClick={() => { setStep(step + 1); window.scrollTo(0, 0); }} className="bg-[#0D47A1] hover:bg-[#1565C0] text-white font-semibold px-8 py-3 rounded-xl transition-all flex items-center gap-2">
              Növbəti<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting || !form.raziliq}
              className="bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold px-10 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? "Göndərilir..." : "Qeydiyyatı tamamla"}
            </button>
          )}
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button key={i} onClick={() => { setStep(i + 1); window.scrollTo(0, 0); }}
              className={`w-3 h-3 rounded-full transition-all ${i + 1 === step ? "bg-[#0D47A1] w-8" : i + 1 < step ? "bg-[#0D47A1]/40" : "bg-gray-300"}`} />
          ))}
        </div>
      </main>

      {/* Terms popup */}
      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => { setForm({ ...form, raziliq: true }); setShowTerms(false); }}
      />
    </div>
  );
}
