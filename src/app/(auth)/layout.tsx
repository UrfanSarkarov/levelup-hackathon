import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#2EC4B6] flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/levelup-logo-new.svg"
          alt="Level UP Hackathon - Ana səhifəyə qayıt"
          width={180}
          height={60}
          priority
          className="drop-shadow-lg"
        />
      </div>

      {/* Auth content */}
      <main id="main-content" role="main" aria-label="Giriş" className="w-full max-w-md">{children}</main>

      {/* Footer */}
      <footer className="mt-8 text-sm text-white/60">
        &copy; 2026 Level UP Hakatonu &mdash; Bak&#305;
      </footer>
    </div>
  );
}
