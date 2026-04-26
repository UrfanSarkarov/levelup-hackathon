import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Level UP Hakatonu | Bakı",
  description:
    "Ağıllı ev sistemləri, avtomatlaşdırma və real IOT sistemlərinin qarşılıqlı inteqrasiyası həllərinə yönəlmiş 36 saatlıq innovativ həllər yarışı.",
  openGraph: {
    title: "Level UP Hakatonu",
    description:
      "IoT, ağıllı ev sistemləri və avtomatlaşdırma sahəsində 36 saatlıq innovasiya hakatonu.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" data-accw-position="bottom-left" data-accw-offset="none" data-accw-size="md" className={cn("antialiased", inter.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen">
        <a href="#main-content" className="skip-nav">
          Əsas məzmuna keç
        </a>
        {children}
        <script src="https://accessibility.cert.gov.az/acc-widget.min.js" defer />
      </body>
    </html>
  );
}
