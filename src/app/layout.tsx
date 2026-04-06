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
  title: "Level UP — Urban Innovation Hackathon | WUF13 Bakı 2026",
  description:
    "WUF13 çərçivəsində keçirilən 36 saatlıq urban innovasiya hakatonu. Şəhərlərin gələcəyini formalaşdır!",
  openGraph: {
    title: "Level UP — Urban Innovation Hackathon",
    description:
      "36 saatda ideyadan prototipə. WUF13 Bakı 2026",
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
