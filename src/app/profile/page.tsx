"use client"
import { Container } from "@/components/container";
import { supabase } from "@/lib/supabase";
import { TokenBalance } from "@/components/balance";
import { useAccount,  useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import LeaderBoard from "@/components/leaderBoard";
import UseCooldownCountdown from "@/components/coolDown";
import {getNFTMetadata, ipfsToGatewayUrl} from "@/app/page";


export function formatAddress(address: string): string { //shorten address
  if (!address) return "";

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function resfreshPage(){ 
  window.location.reload();
}

function formatMintedAt(timestamp: string): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}/${month}/${year}`;
}


export default function ProfilePage() {

  const { address: walletAddress, isConnected } = useAccount();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [userInfo, setUserInfo] = useState([
    { label: "NFTs", value: "0" },
    { label: "Total claims", value: "0" },
    { label: "Level", value: "0" },
  ]);
  const [history, setHistory] = useState([]);


  useEffect(() => { //load profile details stored in DB
    if (!walletAddress) return;

  async function loadProfile(){

   const { data: leaderboard, error } = await supabase
          .from("leaderboard")
          .select("claim_count, level") 
          .eq("wallet_address", walletAddress) 
  
  if(error) {
    console.log(error)
    return null
  }

  const {data: nft_owner_summary, error: nftError} = await supabase
  .from("nft_owner_summary")
  .select("total_owned")
  .eq("owner_address", walletAddress)

  if (nftError) {
    console.log(nftError)
    return null;
  }

  const {data: History, error: HistoryError} = await supabase
  .from("nft_mints")
  .select(`
      minted_at,
      token_id,
      nft_created(metadata_uri)
    `)
  .eq("owner_address", walletAddress)
  .order("minted_at", { ascending: false })


  if (HistoryError) {
    console.log("Error loading from nft_mints", HistoryError)
    return null;
  }


  async function metaData(item: any) { //get metadata uri of data and name
  const metadata = await getNFTMetadata(item.nft_created?.metadata_uri ?? "");
  return metadata?.name ?? "";
}

const historyData = await Promise.all( // add all the gotten metadata uri to history using Promise.all to ensure it waits for all to finish
  History.map(async (item) => ({
    ...item,
    name: await metaData(item),
  }))
);


  setHistory(historyData);

  setUserInfo([
      {
        label: "NFTs",
        value: String(nft_owner_summary?.[0]?.total_owned ?? 0),
      },
      {
        label: "Total claims",
        value: String(leaderboard?.[0]?.claim_count ?? 0),
      },
      {
        label: "Level",
        value: String(Math.floor(leaderboard?.[0]?.level ?? 0)),
      },
    ]);

      const PercentLevel = Number(leaderboard?.[0]?.level ?? 1); // e.g. 1.67
       setCurrentLevel (Math.floor(PercentLevel));              // 1
       setProgressPercent(Math.round((PercentLevel % 1) * 100));            // 67

  // return{
  // }
    }

    loadProfile()

  }, [walletAddress])


  return (
  <div className="pb-12 pt-10 sm:pt-14">
    <Container>
      <div className="grid gap-4 lg:grid-cols-12">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 space-y-4">

          {/* Profile Card */}
          <div className="relative overflow-hidden rounded-3xl bg-surface ring-1 ring-border shadow-[0_0_70px_rgba(0,200,83,0.14)] tmt-surface">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(60%_80%_at_50%_0%,_rgba(0,230,118,0.22),_rgba(7,29,18,0)_60%)]" />
            <div className="relative p-5 sm:p-6">

              {/* Profile Header */}
              <div className="flex items-start gap-4">
  
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-white sm:text-lg">
                        {isConnected
                          ? formatAddress(walletAddress)
                          : "Guest User"}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-sm text-white/60">
                        {isConnected ? (
                          <>
                            <span className="tmt-dot-connected" aria-hidden />
                            Connected
                          </>
                        ) : (
                          "Not Connected"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {userInfo.map((m, idx) => (
                  <div
                    key={m.label}
                    className={`group relative overflow-hidden rounded-2xl px-4 py-4 ring-1 transition-all duration-200 sm:px-5 sm:py-5 ${
                      idx === 0
                        ? "bg-[rgba(0,230,118,0.06)] ring-[rgba(0,230,118,0.25)] hover:ring-[rgba(0,230,118,0.4)]"
                        : "bg-surface-2 ring-white/10 hover:ring-white/15"
                    }`}
                  >
                    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,_transparent,_rgba(0,230,118,0.35),_transparent)] opacity-70" />
                    <div className="font-display text-2xl tracking-wide text-white sm:text-3xl">
                      {m.value}
                    </div>

                    <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55 sm:text-xs">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Level Progress */}
              {!walletAddress ? (
                <div className="mt-7">
                  <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                    <div>Level 0</div>
                    <div>Level 1</div>
                  </div>

                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                    <div className="h-full w-[8%] bg-[linear-gradient(90deg,_rgba(0,200,83,0.95),_rgba(0,230,118,0.95))]" />
                  </div>
                </div>
              ) : (
                <div className="mt-7">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-white/70">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-2.5 py-1 ring-1 ring-white/10">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                        Level
                      </span>
                      <span>{currentLevel}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(0,230,118,0.14)] px-2.5 py-1 text-[#7ef3ad] ring-1 ring-[rgba(0,230,118,0.35)]">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                        Next
                      </span>
                      <span>Level {currentLevel + 1}</span>
                    </div>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                    <div
                      className="h-full bg-[linear-gradient(90deg,_rgba(0,200,83,0.95),_rgba(0,230,118,0.95))] transition-all duration-500 ease-out shadow-[0_0_18px_rgba(0,230,118,0.35)]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="mt-2 text-xs text-white/55">
                    {progressPercent.toFixed(0)}% to Level{" "}
                    {currentLevel + 1}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Token Balance */}
          <div className="relative overflow-hidden rounded-3xl bg-surface ring-1 ring-white/10 tmt-surface tmt-card-hover">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(70%_100%_at_100%_0%,_rgba(0,230,118,0.18),_rgba(7,29,18,0)_60%)]" />
            <div className="relative p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M2 12c0-4.418 3.582-8 8-8h4c4.418 0 8 3.582 8 8 0 4.418-3.582 8-8 8H10c-4.418 0-8-3.582-8-8Z"/>
                      <path d="M12 6v12"/>
                      <path d="M8 10h8M8 14h8"/>
                    </svg>
                  </span>
                  Token Balance
                </div>
                <span className="rounded-full bg-[rgba(0,200,83,0.15)] px-3 py-1 text-[11px] font-semibold text-[#00E676] ring-1 ring-[rgba(0,230,118,0.35)]">
                  TMT
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="break-words font-display text-4xl leading-none tracking-wide text-white sm:text-5xl">
                    <TokenBalance />
                  </div>

                  <div className="mt-2 text-sm text-white/60">
                    Turtle Meta Tribe
                  </div>
                </div>

                <div className="rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-white/75 ring-1 ring-white/10 sm:self-end">
                  +0.0% <span className="text-white/45">(24h)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 space-y-4">

          {/* Cooldown */}
          <UseCooldownCountdown />

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Minting Activity */}
            <div className="rounded-3xl bg-surface ring-1 ring-white/10 tmt-surface tmt-card-hover overflow-hidden">
              <div className="p-5 sm:p-6">

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M3 10.5 12 3l9 7.5"/>
                        <path d="M5 9.5V21h14V9.5"/>
                        <path d="M10 21v-6h4v6"/>
                      </svg>
                    </span>
                    Minting Activity
                  </div>

                  {/* Gallery Button */}
                  {isConnected && (
                    <a
                      href="/gallery"
                      className="inline-flex h-9 items-center justify-center rounded-xl bg-white/5 px-4 text-xs font-semibold text-white ring-1 ring-white/10 transition-all hover:bg-white/10 hover:ring-white/15"
                    >
                      View Gallery →
                    </a>
                  )}
                </div>

                <div className="mt-5 ">

                  {/* Minting History */}
                  {walletAddress ? (
                    history.length ? (
                      <ul className="space-y-3 ash-scrollbar mt-4 max-h-[300px]  overflow-y-auto overflow-x-hidden pr-1">
                        {history.map((nft, idx) => (
                          <li
                            key={nft.token_id}
                            className="group flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-2 py-3.5 ring-1 ring-white/10 transition-all duration-200 hover:bg-white/[0.035] hover:ring-white/15 sm:px-4 sm:py-4"
                          >
                            <div className="flex w-full items-center gap-3">
                              <div className="min-w-0">
                                <div className="truncate lg:w-21 w-60 text-sm font-semibold text-white">
                                {nft.name}
                                </div>

                                <div className="mt-1 text-xs text-white/60">
                                 ID:{nft.token_id}
                                </div>
                              </div>

                            </div>

                            <div className="shrink-0 text-right">
                              <div className="text-[13px] font-semibold text-white sm:text-sm">
                                {formatMintedAt(nft.minted_at)}
                              </div>
                              <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
                                Minted
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                    ) : (
                      <div className="rounded-2xl bg-surface-2 px-4 py-7 text-center ring-1 ring-white/10">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white/45 ring-1 ring-white/10">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M3 7h18"/>
                            <path d="M3 12h18"/>
                            <path d="M3 17h18"/>
                          </svg>
                        </div>
                        <div className="mt-4 text-sm font-semibold text-white">
                          No minting activity yet
                        </div>
                        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/60">
                          Mint an NFT to see your history stack
                          up here.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-sm text-white/60">
                      Connect your wallet to see minting history.
                    </div>
                  )}

                </div>
              </div>
            </div>
          

            {/* Leaderboard */}
            <div className="rounded-3xl bg-surface ring-1 ring-white/10 tmt-surface tmt-card-hover overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-[rgba(0,230,118,0.14)] text-[#7cf6a8] ring-1 ring-[rgba(0,230,118,0.35)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M8 21h8"/>
                        <path d="M12 17v4"/>
                        <path d="M7 4h10l-1 12H8L7 4z"/>
                        <path d="M7 7c0-1.5 2-3 5-3s5 1.5 5 3"/>
                      </svg>
                    </span>
                    Top 10 Leaderboard
                  </div>

                  <button
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-white/5 px-4 text-xs font-semibold text-white ring-1 ring-white/10 transition-all hover:bg-white/10 hover:ring-white/15"
                    onClick={resfreshPage}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mr-1.5">
                      <path d="M21 12a9 9 0 1 1-3-6.7L21 8"/>
                      <path d="M21 3v5h-5"/>
                    </svg>
                    Refresh data
                  </button>
                </div>

            <div className="ash-scrollbar mt-4 max-h-[300px] space-y-3 overflow-y-auto pr-1">
                <LeaderBoard />
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </Container>
  </div>
);
}


