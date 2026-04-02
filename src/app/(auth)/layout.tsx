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
          alt="Level UP"
          width={180}
          height={60}
          priority
          className="drop-shadow-lg"
        />
      </div>

      {/* Auth content */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-sm text-white/60">
        &copy; 2026 Level UP Hackathon &mdash; WUF13 Bak&#305;
      </p>
    </div>
  );
}
