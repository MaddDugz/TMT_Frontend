// header code
"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/container";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from "wagmi";
import {useRef, useEffect} from "react";

type NavItem = { label: string; href: string; internal?: boolean };

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isConnected } = useAccount();
  const wasConnected = useRef(false);

    useEffect(() => { // reload page on every wallet connect/disconnect
    if (isConnected) {
      wasConnected.current = true;
    } else if (wasConnected.current) {
      // was connected before, now disconnected — reload
      window.location.reload();
    }
  }, [isConnected]);


  const items = useMemo<NavItem[]>(
    () => [
      { label: "Faucet", href: "/faucet", internal: true },
      {label: "NFTs", href:"/nft", internal:true},
      { label: "Profile", href: "/profile", internal: true },
    ],
    [],
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/75 backdrop-blur-xl tmt-card-hover">
        <Container>
          <div className="flex h-16 sm:h-[72px] items-center justify-between gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-3 group min-w-0">
              <div className="relative h-10 w-10 flex-none rounded-2xl bg-[radial-gradient(circle_at_30%_30%,_rgba(0,230,118,0.95),_rgba(4,10,6,0.0)_62%),radial-gradient(circle_at_70%_70%,_rgba(0,230,118,0.55),_rgba(4,10,6,0.0)_58%)] ring-1 ring-border shadow-[0_0_36px_rgba(0,230,118,0.22)] transition-transform duration-180 group-hover:scale-[1.04]">
                <img src="/favicon.ico" alt="Turtle Meta Tribe" className="h-full w-full rounded-2xl" />
              </div>
              <span className="hidden font-display text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-accent-2 sm:inline">
                Turtle Meta Tribe
              </span>
              <span className="font-display text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-accent-2 sm:hidden">
                TMT
              </span>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {items.map((item) =>
                item.internal ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="relative inline-flex items-center rounded-2xl px-4 py-2 text-sm font-medium text-white/80 transition-all duration-180 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-accent to-transparent transition-transform duration-180 hover:scale-x-100" aria-hidden />
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    rel="noreferrer"
                    className="inline-flex items-center rounded-2xl px-4 py-2 text-sm font-medium text-white/70 transition-all duration-180 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {item.label}
                  </a>
                ),
              )}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* <div className="relative [&>*:first-child]:!rounded-2xl tmt-glow"> */}
                <ConnectButton />
              {/* </div> */}
              <button
                onClick={() => setOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 hover:ring-accent/30 transition-all duration-180 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Open menu"
              >
                <div className="flex w-5 flex-col gap-1.5">
                  <div className="h-0.5 w-full rounded-full bg-white/85" />
                  <div className="h-0.5 w-full rounded-full bg-white/85" />
                  <div className="h-0.5 w-4/5 ms-auto rounded-full bg-white/85" />
                </div>
              </button>
            </div>
          </div>
        </Container>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60]">
          <button
            className="absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
            aria-label="Close menu overlay"
          />
          <div className="absolute right-0 top-0 h-full w-[88%] min-w-[280px] max-w-sm tmt-surface ring-1 ring-border shadow-[0_0_70px_rgba(0,230,118,0.18)] rounded-l-3xl overflow-hidden">
            <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,_rgba(0,230,118,0.18),_transparent_55%)]" aria-hidden />
              <div className="flex items-center gap-2.5 relative">
                <div className="h-9 w-9 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,_rgba(0,230,118,0.95),_rgba(4,10,6,0.0)_62%),radial-gradient(circle_at_70%_70%,_rgba(0,230,118,0.55),_rgba(4,10,6,0.0)_58%)] ring-1 ring-border" aria-hidden />
                <span className="font-display text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-accent-2">
                  Menu
                </span>
              </div>
              
            </div>

            <div className="flex flex-col gap-1.5 p-4 sm:p-5">
              {items.map((item) =>
                item.internal ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-white/90 bg-white/[0.02] ring-1 ring-transparent hover:bg-white/5 hover:ring-accent/25 transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent/60 group-hover:bg-accent transition-colors" aria-hidden />
                      {item.label}
                    </span>
                    <span aria-hidden className="text-white/40 group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/5 transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/30 group-hover:bg-accent/70 transition-colors" aria-hidden />
                      {item.label}
                    </span>
                    <span aria-hidden className="text-white/40 group-hover:translate-x-0.5 transition-transform">↗</span>
                  </a>
                ),
              )}
              <div className="mt-2 rounded-3xl bg-[linear-gradient(113deg,_rgba(0,230,118,0.14)_0%,_rgba(255,255,255,0.06)_45%,_rgba(0,230,118,0.12)_100%)] p-[1px] ring-1 ring-accent/15">
                <div className="relative overflow-hidden rounded-3xl bg-surface px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                    {isConnected ? "Wallet Status" : "Get Started"}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white/90">
                      {isConnected ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="tmt-dot-connected" aria-hidden />
                          Connected
                        </span>
                      ) : "Connect wallet to earn rewards"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
