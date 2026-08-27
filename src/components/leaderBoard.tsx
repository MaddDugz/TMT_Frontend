// code to get leaderBoard of claims from blockchain
"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase";
import { formatAddress } from "@/app/profile/page";
import { formatPrice } from "@/app/page";

type LeaderboardRow = {
  wallet_address: string;
  level: number;
  total_claimed: number;
};

export default function LeaderBoard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address: walletAddress, isConnected } = useAccount();

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("leaderboard")
        .select(`wallet_address, level, total_claimed`)
        .order("level", { ascending: false })
        .limit(10);

      if (!cancelled) {
        if (!error) setLeaderboard(data ?? []);
        setIsLoading(false);
      }
    }

    loadLeaderboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const userIndex = isConnected
    ? leaderboard.findIndex(
        (u) => u.wallet_address.toLowerCase() === walletAddress?.toLowerCase()
      )
    : -1;

  const isUserOnBoard = userIndex !== -1;
  const isUserBelowTop10 = isUserOnBoard && userIndex > 9;

  function renderRow(user: LeaderboardRow, idx: number, isPinned = false) {
    const isCurrentUser =
      isConnected && user.wallet_address.toLowerCase() === walletAddress?.toLowerCase();
    const isTopThree = idx >= 0 && idx <= 2;
    const rankTone =
      idx === 0
        ? "from-[rgba(0,230,118,0.9)] via-[rgba(0,200,83,0.9)] to-[rgba(255,255,255,0.85)] text-background"
        : idx === 1
          ? "from-white/90 via-white/75 to-white/55 text-background"
          : idx === 2
            ? "from-[rgba(0,230,118,0.65)] via-[rgba(255,255,255,0.75)] to-[rgba(255,255,255,0.6)] text-background"
            : "";

    return (
      <div
        key={isPinned ? `pinned-${user.wallet_address}` : user.wallet_address}
        className={`group flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3.5 ring-1 transition-all duration-200 sm:px-4 sm:py-4 ${
          isCurrentUser
            ? "bg-[rgba(0,230,118,0.12)] ring-[rgba(0,230,118,0.35)] shadow-[0_10px_40px_-24px_rgba(0,230,118,0.55)] hover:bg-[rgba(0,230,118,0.16)]"
            : "bg-surface-2 ring-white/10 hover:ring-white/15 hover:bg-white/[0.035]"
        } ${isPinned ? "shadow-[0_0_40px_-10px_rgba(0,230,118,0.45)]" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold sm:h-10 sm:w-10 sm:text-xs ${
              isTopThree
                ? `bg-[linear-gradient(135deg,_${rankTone})] shadow-[0_10px_30px_-18px_rgba(0,230,118,0.55)]`
                : "bg-white/5 text-white/75 ring-1 ring-white/10 group-hover:text-white/85"
            }`}
            aria-label={`Rank ${idx + 1}`}
          >
            {idx + 1}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {!isCurrentUser && (
              <div className="truncate text-sm font-semibold text-white">
                {formatAddress(user.wallet_address)}
              </div>
              )}
              {isCurrentUser ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[rgba(0,230,118,0.14)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8af7b8] ring-1 ring-[rgba(0,230,118,0.35)]">
                  <span className="tmt-dot-connected" aria-hidden /> You
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/55 sm:text-xs">
              <span className="inline-flex items-center gap-1">
                Level{" "}
                <span className="font-semibold text-white/80">
                  {Math.floor(user.level)}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-display text-base leading-none tracking-wide text-white sm:text-lg">
            {formatPrice(user.total_claimed)}
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/45 sm:text-[10px]">
            Total Claimed
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="tmt-skeleton flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3.5 ring-1 ring-white/10 sm:px-4 sm:py-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/5 sm:h-10 sm:w-10" />
                <div className="space-y-2">
                  <div className="h-3 w-32 rounded-lg bg-white/10 sm:w-40" />
                  <div className="h-2.5 w-20 rounded-lg bg-white/5 sm:w-24" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-3 w-24 rounded-lg bg-white/10 sm:w-28" />
                <div className="h-2.5 w-16 rounded-lg bg-white/5 sm:w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="rounded-2xl bg-surface-2 px-4 py-8 text-center ring-1 ring-white/10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/45 ring-1 ring-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M7 4h10l-1 12H8L7 4z" />
              <path d="M7 7c0-1.5 2-3 5-3s5 1.5 5 3" />
            </svg>
          </div>
          <div className="mt-4 text-sm font-semibold text-white">
            Leaderboard is warming up
          </div>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/60">
            Be the first to claim faucet rewards and mint an NFT to appear at
            the top.
          </p>
        </div>
      ) : (
        <>
          {leaderboard.slice(0, 3).map((user, idx) => renderRow(user, idx))}

          {isUserBelowTop10 && renderRow(leaderboard[userIndex], userIndex, true)}

          {leaderboard.slice(3).map((user, idx) => renderRow(user, idx + 3))}
        </>
      )}
    </div>
  );
}