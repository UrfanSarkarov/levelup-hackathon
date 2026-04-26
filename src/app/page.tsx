"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/* ───────── ICON COMPONENTS ───────── */

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect x="12" y="18" width="56" height="50" rx="6" stroke="#6BBF6B" strokeWidth="3" fill="none"/>
      <line x1="12" y1="32" x2="68" y2="32" stroke="#6BBF6B" strokeWidth="3"/>
      <line x1="28" y1="12" x2="28" y2="24" stroke="#6BBF6B" strokeWidth="3" strokeLinecap="round"/>
      <line x1="52" y1="12" x2="52" y2="24" stroke="#6BBF6B" strokeWidth="3" strokeLinecap="round"/>
      <rect x="22" y="38" width="8" height="8" rx="1" fill="#6BBF6B" opacity="0.3"/>
      <rect x="36" y="38" width="8" height="8" rx="1" fill="#6BBF6B"/>
      <rect x="50" y="38" width="8" height="8" rx="1" fill="#6BBF6B" opacity="0.3"/>
      <rect x="22" y="50" width="8" height="8" rx="1" fill="#6BBF6B" opacity="0.3"/>
      <rect x="36" y="50" width="8" height="8" rx="1" fill="#6BBF6B" opacity="0.3"/>
      <circle cx="18" cy="22" r="6" fill="#6BBF6B" opacity="0.15"/>
      <path d="M10 26L16 20L14 22" stroke="#6BBF6B" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <path d="M15 60L30 50L50 58L65 45V20L50 33L30 25L15 35V60Z" stroke="#6BBF6B" strokeWidth="3" fill="none" strokeLinejoin="round"/>
      <path d="M30 25V50" stroke="#6BBF6B" strokeWidth="2" strokeDasharray="4 3"/>
      <path d="M50 33V58" stroke="#6BBF6B" strokeWidth="2" strokeDasharray="4 3"/>
      <circle cx="35" cy="22" r="8" fill="#6BBF6B"/>
      <circle cx="35" cy="20" r="3" fill="white"/>
      <path d="M35 30L35 22" stroke="#6BBF6B" strokeWidth="3"/>
    </svg>
  );
}

function SmartMobilityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ağıllı mobillik">
      <circle cx="50" cy="50" r="48" fill="#6BBF6B"/>
      <g stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 62C28 62 30 52 33 48C36 44 42 42 50 42C58 42 64 44 67 48C70 52 72 62 72 62"/>
        <ellipse cx="50" cy="42" rx="14" ry="8"/>
        <circle cx="36" cy="65" r="5"/>
        <circle cx="64" cy="65" r="5"/>
        <line x1="41" y1="65" x2="59" y2="65"/>
        <path d="M46 50L48 54L52 48L54 52" strokeWidth="2"/>
        <path d="M62 32L66 28" strokeWidth="2"/>
        <rect x="63" y="24" width="10" height="10" rx="2" strokeWidth="2"/>
        <circle cx="68" cy="29" r="2" fill="white"/>
        <path d="M72 30L76 30" strokeWidth="2"/>
        <path d="M68 34L68 38" strokeWidth="2"/>
      </g>
    </svg>
  );
}

function SmartHousingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ağıllı mənzil idarəetməsi">
      <circle cx="50" cy="50" r="48" fill="#6BBF6B"/>
      <g stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="25" y="30" width="50" height="40" rx="4"/>
        <rect x="30" y="35" width="40" height="30" rx="2"/>
        <path d="M38 55L45 48L52 52L62 42"/>
        <rect x="36" y="40" width="10" height="10" rx="1"/>
        <path d="M41 50V44L38 47" fill="none"/>
        <circle cx="58" cy="48" r="3"/>
        <line x1="58" y1="51" x2="58" y2="55"/>
        <line x1="55" y1="48" x2="52" y2="48"/>
        <line x1="61" y1="48" x2="64" y2="48"/>
        <path d="M34 75L34 70" strokeWidth="3"/>
        <path d="M66 75L66 70" strokeWidth="3"/>
      </g>
    </svg>
  );
}

function DisasterResilienceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fəlakət dayanıqlılığı">
      <circle cx="50" cy="50" r="48" fill="#6BBF6B"/>
      <g stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="26" y="28" width="48" height="38" rx="4"/>
        <rect x="30" y="32" width="40" height="30" rx="2"/>
        <path d="M40 50L45 44L50 48L60 38"/>
        <path d="M44 38L40 42L36 38" strokeWidth="2"/>
        <circle cx="56" cy="46" r="4"/>
        <path d="M56 42V46H60"/>
        <rect x="34" y="52" width="6" height="6" rx="1"/>
        <rect x="44" y="52" width="6" height="6" rx="1"/>
        <rect x="54" y="52" width="6" height="6" rx="1"/>
        <line x1="38" y1="70" x2="38" y2="66" strokeWidth="3"/>
        <line x1="62" y1="70" x2="62" y2="66" strokeWidth="3"/>
      </g>
    </svg>
  );
}

function GreenTechIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Yaşıl texnologiyalar">
      <circle cx="50" cy="50" r="48" fill="#6BBF6B"/>
      <g stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 75V50"/>
        <path d="M50 50C50 38 42 28 50 22C58 28 50 38 50 50Z" fill="white" fillOpacity="0.3"/>
        <path d="M50 50C50 38 42 28 50 22C58 28 50 38 50 50Z"/>
        <path d="M42 55L50 60L58 55"/>
        <path d="M38 48L50 54L62 48"/>
        <circle cx="35" cy="40" r="3"/>
        <line x1="35" y1="43" x2="35" y2="48"/>
        <circle cx="65" cy="40" r="3"/>
        <line x1="65" y1="43" x2="65" y2="48"/>
        <circle cx="30" cy="55" r="3"/>
        <line x1="33" y1="55" x2="38" y2="52"/>
        <circle cx="70" cy="55" r="3"/>
        <line x1="67" y1="55" x2="62" y2="52"/>
        <circle cx="38" cy="68" r="3"/>
        <line x1="38" y1="65" x2="42" y2="62"/>
        <circle cx="62" cy="68" r="3"/>
        <line x1="62" y1="65" x2="58" y2="62"/>
      </g>
    </svg>
  );
}


/* ───────── Navigation ───────── */
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { href: "#haqqinda", label: "Haqqında" },
    { href: "#istiqametler", label: "İstiqamətlər" },
    { href: "#mukafat", label: "Mükafatlar" },
    { href: "#proqram", label: "Proqram" },
    { href: "#faq", label: "FAQ" },
    { href: "#elaqe", label: "Əlaqə" },
  ];

  return (
    <nav role="navigation" aria-label="Əsas naviqasiya" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white/80 backdrop-blur-sm"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Level Up logo */}
          <div className="flex items-center gap-3">
            <Image src="/levelup-logo-new.svg" alt="Level UP Hakatonu" width={110} height={44} className="h-10 sm:h-12 w-auto" priority />
          </div>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-[#4A5568] hover:text-[#0D47A1] transition-colors font-medium">
                {l.label}
              </a>
            ))}
            <Link href="/giris" className="border border-[#0D47A1] text-[#0D47A1] hover:bg-[#0D47A1] hover:text-white font-semibold px-5 py-2 rounded-lg transition-all">
              Daxil ol
            </Link>
            <Link href="/qeydiyyat" className="bg-[#0D47A1] hover:bg-[#1565C0] text-white font-semibold px-5 py-2 rounded-lg transition-all">
              Qeydiyyat
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-[#1A1A2E] p-2" aria-label="Menyu" aria-expanded={isOpen} aria-controls="mobile-nav-menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-nav-menu" role="menu" className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setIsOpen(false)} className="block text-[#4A5568] hover:text-[#0D47A1] transition-colors py-2 font-medium">
                {l.label}
              </a>
            ))}
            <Link href="/giris" className="block border border-[#0D47A1] text-[#0D47A1] hover:bg-[#0D47A1] hover:text-white font-semibold px-5 py-2.5 rounded-lg text-center mt-3">
              Daxil ol
            </Link>
            <Link href="/qeydiyyat" className="block bg-[#0D47A1] hover:bg-[#1565C0] text-white font-semibold px-5 py-2.5 rounded-lg text-center mt-2">
              Qeydiyyat
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ───────── Section ───────── */
function Section({ id, children, className = "", alt = false }: { id?: string; children: React.ReactNode; className?: string; alt?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <section id={id} ref={ref} className={`py-16 sm:py-24 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${alt ? "bg-[#F5F7FA]" : "bg-white"} ${className}`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

/* ───────── Track Data ───────── */
const tracks = [
  {
    icon: <SmartMobilityIcon className="w-20 h-20" />,
    title: "Qarşılıqlı əlaqəli mikrocihaz ekosisteminin qurulması",
    titleEn: "IoT Ecosystem",
    desc: "IoT cihazları arasında etibarlı, dinamik və təhlükəsiz qarşılıqlı əlaqə həllərinin yaradılması.",
  },
  {
    icon: <SmartHousingIcon className="w-20 h-20" />,
    title: "IOT əsaslı avtomatlaşdırma həlləri",
    titleEn: "IoT Automation",
    desc: "IoT texnologiyaları əsasında ağıllı avtomatlaşdırma sistemləri və proseslərin optimallaşdırılması.",
  },
  {
    icon: <DisasterResilienceIcon className="w-20 h-20" />,
    title: "Evlərin və şəhərlərin ağıllı idarəetmə və nəzarət sistemləri",
    titleEn: "Smart Home & City Management",
    desc: "Ağıllı evlərin və şəhərlərin mərkəzləşdirilmiş idarəetmə və nəzarət platformaları.",
  },
  {
    icon: <GreenTechIcon className="w-20 h-20" />,
    title: "Təhlükəsiz və dayanıqlı sistemlərin yaradılması",
    titleEn: "Secure & Resilient Systems",
    desc: "Mikrocihazların kibertəhlükəsizliyi, məlumat qorunması və dayanıqlı IoT infrastrukturu.",
  },
];

/* ───────── Timeline ───────── */
const phases = [
  { phase: "1. Mərhələ", title: "Qeydiyyat", items: ["Rəsmi elan və sosial media kampaniyasının başlanması", "Universitetlərdə infosessiyalar", "Onlayn qeydiyyat sisteminin açılması"], icon: "📝", active: true },
  { phase: "2. Mərhələ", title: "Komanda Seçimi", items: ["Müraciətlərin qiymətləndirilməsi", "Seçilmiş komandaların elan edilməsi", "Komandaların sənaye problemləri ilə əlaqələndirilməsi"], icon: "👥", active: false },
  { phase: "3. Mərhələ", title: "Təlimlər və Mentorluq", items: ["IoT və ağıllı ev sistemləri üzrə təlim proqramı", "Kibertəhlükəsizlik, biznes modeli, pitch hazırlığı", "Sahə mütəxəssisləri tərəfindən mentor dəstəyi"], icon: "🎓", active: false },
  { phase: "4. Mərhələ", title: "Hakaton Müsabiqəsi — 36 saat", items: ["Açılış mərasimi və qaydaların izahı", "36 saatlıq intensiv prototipləşdirmə", "Final təqdimatları və münsiflər qarşısında pitç", "Qalib komandaların elan edilməsi və mükafatlandırma"], icon: "⚡", active: false },
];

/* ───────── FAQ ───────── */
const faqs = [
  { q: "Level UP nədir?", a: "Level UP — ağıllı ev sistemləri, avtomatlaşdırma və IoT (Internet of Things) sahəsində innovativ həllər yaradılmasına yönəlmiş 36 saatlıq hakatondur. Hakatonda iştirakçılar komandalar halında real mikrocihazlar problemlərinə texnoloji həllər hazırlayır, prototip yaradır və peşəkar münsiflər qarşısında layihələrini təqdim edirlər. Məqsəd gəncləri IoT və kibertəhlükəsizlik sahələrində birləşdirərək dayanıqlı gələcək üçün innovativ həllər ortaya qoymaqdır." },
  { q: "Kim iştirak edə bilər?", a: "Texnologiya və innovasiyaya marağı olan gənclər, Azərbaycan universitetlərinin bakalavr və magistr tələbələri, eləcə də startap düşüncəli iştirakçılar iştirak edə bilər. İştirakçıların proqramlaşdırma, elektronika, IoT, dizayn, layihə idarəetmə və ya kibertəhlükəsizlik sahələrindən birində bilik və bacarıqları olması arzu olunur. Yaş məhdudiyyəti yoxdur, lakin komanda üzvlərinin əksəriyyəti gənclərdən ibarət olmalıdır." },
  { q: "Komanda necə formalaşdırılır?", a: "Hər komanda minimum 3, maksimum 5 nəfərdən ibarət olmalıdır. Komanda rəhbəri qeydiyyat zamanı bütün üzvlərin məlumatlarını daxil edir. Komandada fərqli bacarıqlara sahib üzvlərin (developer, hardware mühəndisi, dizayner, biznes analitik və s.) olması tövsiyə edilir. Bu, hakatonda daha güclü və çoxşaxəli layihə hazırlamağa kömək edəcək." },
  { q: "İştirak haqqı varmı?", a: "Xeyr, Level UP Hakatonu tamamilə pulsuzdur. Bütün iştirakçılar üçün hakaton müddətində yemək, içki və iş mühiti təmin edilir. Bundan əlavə, hər iştirakçı sertifikat, mentor dəstəyi və təlim proqramından yararlanma imkanı əldə edir." },
  { q: "Mükafat fondu nə qədərdir?", a: "Ümumi mükafat fondu 5 000 AZN-dir. 1-ci yerə 2 500 AZN, 2-ci yerə 1 500 AZN, 3-cü yerə 1 000 AZN mükafat verilir. Bundan əlavə, bütün finalistlər investor əlaqələri qurmaq və akselerasiya proqramlarına qoşulmaq imkanı əldə edəcəklər." },
  { q: "Hansı istiqamətlər var?", a: "Hakatonda 4 əsas istiqamət mövcuddur: Qarşılıqlı əlaqəli mikrocihaz ekosisteminin qurulması — IoT cihazları arasında etibarlı və təhlükəsiz qarşılıqlı əlaqə; IoT əsaslı avtomatlaşdırma həlləri — proseslərin optimallaşdırılması; Evlərin və şəhərlərin ağıllı idarəetmə və nəzarət sistemləri — mərkəzləşdirilmiş platformalar; Təhlükəsiz və dayanıqlı sistemlərin yaradılması — kibertəhlükəsizlik və məlumat qorunması." },
  { q: "Hakaton necə keçəcək?", a: "Hakaton 36 saatlıq intensiv format şəklində Bakıda keçiriləcək. Proses açılış mərasimi ilə başlayır, ardınca mentorlarla görüşlər, intensiv prototipləşdirmə sessiyaları, ilkin pitçlər və final təqdimatları ilə davam edir. Qalib komandalar mükafatlandırılır." },
  { q: "Təlim proqramı nə əhatə edir?", a: "Hakatondan əvvəl 4 mərhələli proqram çərçivəsində IoT və ağıllı ev sistemləri üzrə təlimlər keçirilir. Təlimlər kibertəhlükəsizlik, biznes modeli hazırlanması, pitch təqdimatı hazırlığı və digər vacib mövzuları əhatə edir. Bundan əlavə, sahə mütəxəssisləri tərəfindən mentor dəstəyi təmin edilir." },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const answerId = `faq-answer-${index}`;
  return (
    <div className="light-card overflow-hidden">
      <h3>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={answerId}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-[#1A1A2E] pr-4">{q}</span>
          <svg className={`w-5 h-5 text-[#0D47A1] flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </h3>
      <div id={answerId} role="region" aria-labelledby={`faq-q-${index}`} aria-hidden={!open} className={`overflow-hidden transition-all duration-300 ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 invisible"}`}>
        <p className="px-5 pb-5 text-[#4A5568] leading-relaxed" tabIndex={open ? 0 : -1}>{a}</p>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function Home() {
  return (
    <>
      <Navbar />

      <main id="main-content" role="main">
      {/* ── HERO ── */}
      <section aria-labelledby="hero-heading" className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden bg-gradient-to-br from-white via-[#F0F4F8] to-[#E3EDF7]">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#0D47A1]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-[#2EC4B6]/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[#0D47A1]/20 bg-[#0D47A1]/5 text-[#0D47A1] text-sm font-medium">
            Level Up Hakatonu | Bakı
          </div>

          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Level UP</span>
            <br />
            <span className="text-[#1A1A2E]">Hakatonu</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#4A5568] mb-8 max-w-2xl mx-auto">
            Ağıllı ev sistemləri, avtomatlaşdırma və real IOT sistemlərinin qarşılıqlı inteqrasiyası həllərinə yönəlmiş innovativ həllər yarışı
          </p>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10 text-sm">
            {[
              { value: "36", label: "Saat" },
              { value: "5 000₼", label: "Mükafat fondu" },
              { value: "IOT", label: "Mövzu" },
              { value: "4", label: "İstiqamət" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-[#0D47A1]">{s.value}</div>
                <div className="text-[#5A6A7E]">{s.label}</div>
              </div>
            ))}
          </div>

          <Link href="/qeydiyyat" className="inline-block bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all animate-pulse-glow">
            Qeydiyyatdan keç
          </Link>
        </div>
      </section>

      {/* ── HAQQINDA ── */}
      <Section id="haqqinda" alt>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">Hakaton haqqında</h2>
          <div className="w-20 h-1 bg-[#0D47A1] mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#4A5568] leading-relaxed mb-6">
              Level Up — real mikrocihazlar həllərinə və problemlərinə əsaslanaraq gələcəyin şəhərləri və evləri üçün
              ağıllı və dayanıqlı həllərin hazırlanmasına yönəlmiş 36 saatlıq innovasiya hakatonudur.
            </p>
            <p className="text-[#4A5568] leading-relaxed">
              Hakaton çərçivəsində IOT, məişət infrastrukturunun rəqəmsal idarə olunması və mikrocihazların
              kibertəhlükəsizliyi kimi istiqamətlər üzrə innovativ yanaşmaların inkişafı hədəflənir.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="light-card p-6 text-center">
              <CalendarIcon className="w-16 h-16 mx-auto mb-3" />
              <div className="text-sm text-[#5A6A7E]">Müddət</div>
              <div className="font-semibold text-[#1A1A2E]">36 saat</div>
            </div>
            <div className="light-card p-6 text-center">
              <MapIcon className="w-16 h-16 mx-auto mb-3" />
              <div className="text-sm text-[#5A6A7E]">Məkan</div>
              <div className="font-semibold text-[#1A1A2E]">Bakı</div>
            </div>
          </div>
        </div>

        {/* Missiya - böyüdülmüş */}
        <div className="mt-16 light-card p-10 sm:p-12 text-center bg-gradient-to-r from-[#0D47A1]/5 to-[#2EC4B6]/5">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-[#0D47A1]">Missiya</h3>
          <p className="text-lg sm:text-xl text-[#4A5568] leading-relaxed max-w-3xl mx-auto">
            Ağıllı ev sistemləri, IoT və avtomatlaşdırma sahəsində innovativ texnologiya həllərinin inkişaf etdirilməsi!
          </p>
        </div>

        {/* Məqsədlər */}
        <div className="mt-8 light-card p-8 sm:p-10">
          <h3 className="text-xl font-bold mb-6 text-[#0D47A1]">Məqsədlər</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Mentorluq və praktik innovasiya prosesləri vasitəsilə iştirakçıların bacarıqlarını artırmaq.",
              "Real avtomatlaşdırma problemlərini həll edən ağıllı və dayanıqlı texnoloji həllərin inkişafını təşviq etmək.",
              "Yerli intellektual potensiala əsaslanaraq IoT və ağıllı ev sistemləri sahəsində \"Made in Azerbaijan\" brendi altında spin-off və startapların yaradılması.",
              "IoT cihazları arasında etibarlı, dinamik və təhlükəsiz qarşılıqlı əlaqənin təmin edilməsi.",
            ].map((m) => (
              <div key={m} className="flex items-start gap-3 p-3 rounded-lg bg-[#F5F7FA]">
                <svg className="w-5 h-5 text-[#6BBF6B] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-[#4A5568] text-sm">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── İSTİQAMƏTLƏR ── */}
      <Section id="istiqametler">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">İstiqamətlər</h2>
          <p className="text-[#5A6A7E]">Ağıllı evlər və IoT ekosistemləri üçün təhlükəsiz, dayanıqlı və innovativ həllər yarat!</p>
          <div className="w-20 h-1 bg-[#0D47A1] mx-auto rounded-full mt-4" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tracks.map((t) => (
            <div key={t.titleEn} className="light-card p-6 track-card cursor-default text-center">
              <div className="flex justify-center mb-4">{t.icon}</div>
              <h3 className="text-base font-bold mb-1 text-[#1A1A2E]">{t.title}</h3>
              <p className="text-xs text-[#0D47A1] mb-3 font-medium">{t.titleEn}</p>
              <p className="text-sm text-[#4A5568] leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── MÜKAFAT FONDU ── */}
      <Section id="mukafat" alt>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">Mükafat Fondu</h2>
          <p className="text-5xl sm:text-6xl font-bold gradient-text mb-2">5 000 AZN</p>
          <div className="w-20 h-1 bg-[#0D47A1] mx-auto rounded-full mt-4" />
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { place: "1-ci yer", amount: "2 500 AZN", accent: "border-t-[#0D47A1]" },
            { place: "2-ci yer", amount: "1 500 AZN", accent: "border-t-[#2EC4B6]" },
            { place: "3-cü yer", amount: "1 000 AZN", accent: "border-t-[#6BBF6B]" },
          ].map((p) => (
            <div key={p.place} className={`light-card p-8 text-center border-t-4 ${p.accent}`}>
              <div className="text-sm text-[#5A6A7E] mb-2">{p.place}</div>
              <div className="text-2xl font-bold text-[#1A1A2E]">{p.amount}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10 light-card p-6 max-w-2xl mx-auto">
          <p className="text-[#4A5568] text-sm leading-relaxed">
            Bundan əlavə, bütün iştirakçılar <strong className="text-[#1A1A2E]">sertifikat</strong>,{" "}
            <strong className="text-[#1A1A2E]">mentor dəstəyi</strong>,{" "}
            <strong className="text-[#1A1A2E]">təlim proqramı</strong> və{" "}
            <strong className="text-[#1A1A2E]">networking imkanı</strong> əldə edəcəklər.
          </p>
        </div>
      </Section>

      {/* ── PROQRAM ── */}
      <Section id="proqram">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">Proqram</h2>
          <div className="w-20 h-1 bg-[#0D47A1] mx-auto rounded-full" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0D47A1] via-[#2EC4B6] to-[#6BBF6B]/30 hidden sm:block" />
          <div className="space-y-8">
            {phases.map((p, i) => (
              <div key={i} className="relative flex gap-6">
                <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-full bg-white items-center justify-center text-xl z-10 border-2 border-[#0D47A1]/20 shadow-sm">
                  {p.icon}
                </div>
                <div className={`flex-1 light-card p-6 ${p.active ? "border-l-4 border-l-[#0D47A1]" : ""}`}>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="sm:hidden text-xl">{p.icon}</span>
                    <span className="text-xs font-semibold bg-[#0D47A1]/10 text-[#0D47A1] px-3 py-1 rounded-full">{p.phase}</span>
                    {p.active && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aktiv</span>}
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A2E] mb-3">{p.title}</h3>
                  <ul className="space-y-2">
                    {p.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[#4A5568]">
                        <span className="text-[#0D47A1] mt-0.5">&#8226;</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── KİM İŞTİRAK EDƏ BİLƏR ── */}
      <Section alt>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">Kim iştirak edə bilər?</h2>
          <div className="w-20 h-1 bg-[#0D47A1] mx-auto rounded-full" />
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { title: "Gənclər", desc: "Texnologiya və innovasiyaya marağı olan gənclər" },
            { title: "Tələbələr", desc: "Azərbaycan universitetlərinin bakalavr və magistr tələbələri" },
            { title: "Startap düşüncəli iştirakçılar", desc: "Prototip hazırlamağa hazır, startap yönümlü iştirakçılar" },
          ].map((item) => (
            <div key={item.title} className="light-card p-8 text-center">
              <h3 className="text-lg font-bold mb-2 text-[#1A1A2E]">{item.title}</h3>
              <p className="text-sm text-[#4A5568]">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── QEYDIYYAT CTA ── */}
      <Section>
        <div className="light-card p-10 sm:p-16 text-center bg-gradient-to-br from-[#0D47A1]/5 to-[#2EC4B6]/5 border border-[#0D47A1]/10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">Qeydiyyatdan keç</h2>
          <p className="text-[#4A5568] mb-6 max-w-xl mx-auto">
            Komandanı formalaşdır, qeydiyyatdan keç və ağıllı sistemlərin gələcəyini birlikdə formalaşdır!
          </p>
          <p className="text-sm text-[#5A6A7E] mb-8">Komanda: min 3 — maks 5 nəfər</p>
          <Link href="/qeydiyyat" className="inline-block bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold px-10 py-4 rounded-xl text-lg transition-all animate-pulse-glow">
            İndi qeydiyyatdan keç
          </Link>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section id="faq" alt>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">Tez-tez Verilən Suallar</h2>
          <div className="w-20 h-1 bg-[#0D47A1] mx-auto rounded-full" />
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} index={i} />
          ))}
        </div>
      </Section>

      </main>

      {/* ── FOOTER ── */}
      <footer id="elaqe" role="contentinfo" aria-label="Saytın alt hissəsi" className="bg-[#2D3748] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <Image src="/levelup-logo-new.svg" alt="Level UP Hakatonu" width={110} height={44} className="h-10 w-auto mb-4" />
              <p className="text-sm text-gray-300">
                IoT, ağıllı ev sistemləri və avtomatlaşdırma sahəsində innovativ həllər yarışı.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Əlaqə</h4>
              <p className="text-sm text-gray-300">Vantage Solutions</p>
              <p className="text-sm text-gray-300 mt-1">Hüseyn Cavid 25, Bakı</p>
              <a href="https://leveluphackapp.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#2EC4B6] hover:underline block mt-1">leveluphackapp.com</a>
              <a href="mailto:sual@leveluphackapp.com" className="text-sm text-[#2EC4B6] hover:underline block mt-1">sual@leveluphackapp.com</a>
              <a href="https://wa.me/994515678217" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#25D366] hover:underline mt-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                +994 51 567 82 17
              </a>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Keçidlər</h4>
              <div className="space-y-2">
                <a href="#haqqinda" className="block text-sm text-gray-300 hover:text-[#2EC4B6] transition-colors">Haqqında</a>
                <a href="#istiqametler" className="block text-sm text-gray-300 hover:text-[#2EC4B6] transition-colors">İstiqamətlər</a>
                <Link href="/qeydiyyat" className="block text-sm text-gray-300 hover:text-[#2EC4B6] transition-colors">Qeydiyyat</Link>
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div className="flex justify-center mb-6">
            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-[#E1306C] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <span className="text-sm">Instagram</span>
            </a>
          </div>

          <div className="border-t border-white/15 pt-6 text-center text-sm text-gray-400">
            &copy; 2026 Level UP Hakatonu | Powered by Innovation HUB / Vantage Solutions
          </div>
        </div>
      </footer>
    </>
  );
}
