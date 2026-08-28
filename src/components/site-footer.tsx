// footer code
"use client";
import Link from "next/link";
import { Container } from "@/components/container";
import { usePathname } from "next/navigation";


export function SiteFooter() {

const HIDDEN_ON = [ "/gallery"]; // routes to hide footer on

  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;
  
  return (
    <footer className="relative mt-16 sm:mt-24 border-t border-white/10 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,230,118,0.10),_transparent_55%)]" aria-hidden />
      <Container>
        <div className="grid gap-12 py-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,_rgba(0,230,118,0.95),_rgba(4,10,6,0.0)_62%),radial-gradient(circle_at_70%_70%,_rgba(0,230,118,0.55),_rgba(4,10,6,0.0)_58%)] ring-1 ring-border shadow-[0_0_36px_rgba(0,230,118,0.22)]" >
              <img src="/favicon.ico" alt="Turtle Meta Tribe" className="h-full w-full rounded-2xl" />
              </div>
              <span className="font-display text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-accent-2">
                Turtle Meta Tribe
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              Transform imagination into digital legacy across chains with a
              sleek, reward-driven minting experience.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/[0.04] px-4 py-2.5 ring-1 ring-white/10">
              <span className="tmt-dot-connected" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                Testnet Live
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-10 sm:grid-cols-3 md:col-span-7">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent/90">
                <span className="h-1 w-1 rounded-full bg-accent/80" aria-hidden />
                Project
              </div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
                <a href="#" rel="noreferrer" className="group inline-flex w-fit items-center gap-1.5 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg">
                  <span className="relative">
                    About
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
                  </span>
                </a>
                <a href="#" rel="noreferrer" className="group inline-flex w-fit items-center gap-1.5 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg">
                  <span className="relative">
                    Contact
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
                  </span>
                </a>
                <a href="#" rel="noreferrer" className="group inline-flex w-fit items-center gap-1.5 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg">
                  <span className="relative">
                    Support
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
                  </span>
                </a>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent/90">
                <span className="h-1 w-1 rounded-full bg-accent/80" aria-hidden />
                Resources
              </div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
                <a href="#" rel="noreferrer" className="group inline-flex w-fit items-center gap-1.5 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg">
                  <span className="relative">
                    Docs
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
                  </span>
                </a>
                <Link
                  href="/faucet"
                  className="group inline-flex w-fit items-center gap-1.5 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg"
                >
                  <span className="relative">
                    Faucet
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
                  </span>
                </Link>
                <a href="#" rel="noreferrer" className="group inline-flex w-fit items-center gap-1.5 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg">
                  <span className="relative">
                    Blogs
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
                  </span>
                </a>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent/90">
                <span className="h-1 w-1 rounded-full bg-accent/80" aria-hidden />
                Community
              </div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
                <a href="https://x.com/king_Tony27" target="_blank" rel="noreferrer" className="group inline-flex w-fit items-center gap-1.5 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg">
                  <span className="relative">
                    X / Twitter
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
                  </span>
                </a>
                <a href="https://t.me/@King_Tony27" target="_blank" rel="noreferrer" className="group inline-flex w-fit items-center gap-1.5 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg">
                  <span className="relative">
                    Telegram
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
                  </span>
                </a>
                <a href="#" rel="noreferrer" className="group inline-flex w-fit items-center gap-1.5 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg">
                  <span className="relative">
                    Discord
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-4 border-t border-white/10 py-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white/40" aria-hidden>◆</span>
            <span>© {new Date().getFullYear()} Turtle Meta Tribe. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-5 sm:gap-6">
            <a href="#" rel="noreferrer" className="group inline-flex items-center gap-1 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg">
              <span className="relative">
                Terms
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
              </span>
            </a>
            <a href="#" rel="noreferrer" className="group inline-flex items-center gap-1 hover:text-white transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded-lg">
              <span className="relative">
                Privacy Policy
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-accent to-accent-2 group-hover:w-full transition-all duration-200" aria-hidden />
              </span>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
