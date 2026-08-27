import type { Metadata } from "next";
import { Rubik, Squada_One } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Providers } from './providers'

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const squadaOne = Squada_One({
  variable: "--font-squada",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Turtle Meta Tribe",
  description: "MintAura-inspired UI (homepage, faucet, profile, nft)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} ${squadaOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.18),_transparent_60%)]" />
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}

