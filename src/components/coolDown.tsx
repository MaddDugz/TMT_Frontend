// code to display claims cooldown countdown functionality
"use client";
import { useEffect, useState } from "react";
import {FaucetTokenABI} from "@kingtony36/turtlenft-contracts";
const FaucetContractAddress = process.env.NEXT_PUBLIC_FAUCET_TOKEN_ADDRESS;
import { useAccount,  useReadContract } from "wagmi";


const COOLDOWN_DURATION = 24 * 60 * 60; // 24 hours in seconds

function toAddress(value: string | undefined): `0x${string}` | undefined { //make sure in address format
  if (value && /^0x[a-fA-F0-9]{40}$/.test(value)) return value as `0x${string}`;
  return undefined;
}

export default function UseCooldownCountdown() {
  const { address: walletAddress, isConnected } = useAccount();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isReady: false , hasRecord: false});
  const pad = (n: number) => String(n).padStart(2, "0");

   const token = toAddress(FaucetContractAddress);
  
  
    type CooldownCountArgs = {
    address?: `0x${string}`;
    token?: `0x${string}`;
    query?: { enabled?: boolean };
  };
    
    const args: CooldownCountArgs = {
      address: walletAddress ?? undefined,
      token,
      query: {
        enabled: !!walletAddress && !!token,
      },
    };
  
     const { data: cooldownTimestamp, isLoading, error } = useReadContract({ //for directly getting TMT balance
        address: FaucetContractAddress,
        abi: FaucetTokenABI,
        functionName: "getClaimClaimedTimestamp",
        args: walletAddress ? [walletAddress] : undefined,
        query: {
          enabled: !!walletAddress,
        },
      })

  useEffect(() => {
    if (!cooldownTimestamp) return;
    // console.log(cooldownTimestamp)

    // normalize to seconds — adjust if your timestamp is in ms instead
    const claimedAt = Number(cooldownTimestamp);

      // no record yet, or invalid value
    if (!cooldownTimestamp || Number.isNaN(claimedAt) || claimedAt <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isReady: true, hasRecord: false });
      return;
    }

    const unlockAt = claimedAt + COOLDOWN_DURATION;

    function tick() {
      const now = Math.floor(Date.now() / 1000);
      const remaining = unlockAt - now;

      if (remaining <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isReady: true, hasRecord: true });
        return;
      }

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = Math.floor(remaining % 60);

      setTimeLeft({ days, hours, minutes, seconds, isReady: false, hasRecord: true });
    }

    tick(); // run immediately so there's no 1s delay on mount
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cooldownTimestamp]);

  if(error){
    console.log(error)
  }


  return(
    <div className="rounded-3xl bg-surface ring-1 ring-border shadow-[0_0_70px_rgba(0,200,83,0.14)] tmt-surface tmt-card-hover overflow-hidden">
  <div className="p-5 sm:p-6">
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-[rgba(0,230,118,0.14)] text-[#7cf6a8] ring-1 ring-[rgba(0,230,118,0.35)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          <span>Cooldown time</span>
        </div>
        <div className="mt-1 text-sm text-white/60">
            {!timeLeft.hasRecord
                ? "No claims yet — ready to mint?"
                : timeLeft.isReady
                ? "Ready to claim?"
                : "Time left till next mint"}
        </div>
      </div>

      {isConnected ? (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${
          timeLeft.isReady
            ? "bg-[rgba(0,230,118,0.14)] text-[#86f7b3] ring-[rgba(0,230,118,0.35)]"
            : "bg-white/5 text-white/70 ring-white/10"
        }`}>
          <span className={`tmt-dot-connected ${timeLeft.isReady ? "" : "opacity-60"}`} aria-hidden />
          {timeLeft.isReady ? "Claim ready" : "Counting down"}
        </span>
      ) : null}
    </div>

    <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {[
        { label: "Days", value: pad(timeLeft.days) ?? 0  },
        { label: "Hrs", value: pad(timeLeft.hours) ?? 0 },
        { label: "Min", value: pad(timeLeft.minutes) ?? 0 },
        { label: "Sec", value: pad(timeLeft.seconds) ?? 0 },
      ].map((t) => (
        <div
          key={t.label}
          className="group relative overflow-hidden rounded-2xl bg-surface-2 px-3 py-4 text-center ring-1 ring-white/10 transition-all duration-200 hover:ring-white/15 sm:px-4 sm:py-5"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,_transparent,_rgba(0,230,118,0.45),_transparent)] opacity-80"
            aria-hidden
          />
          <div className="font-display text-2xl tracking-wide text-white sm:text-3xl">
            {t.value}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50 sm:text-[11px]">
            {t.label}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
  )
}