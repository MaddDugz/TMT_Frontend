import Link from "next/link";
import { Container } from "@/components/container";
import { supabase } from "@/lib/supabase";
import { freemem } from "os";
import { ethers } from "ethers";
import Image from 'next/image';

export function formatPrice (value: unknown) {
    if (value === null || value === undefined) return "Free";
    const formatted = ethers.formatUnits(String(value), 18);
    const n = Number(formatted);
    if (!Number.isFinite(n) || n <= 0) return "Free";
    return `${n.toFixed(0)} TMT`;
  }

 export async function getNFTMetadata(metadataURI: string): Promise<Record<string, unknown>>{
    const url = ipfsToGatewayUrl(metadataURI);
    try{
    const response = await fetch(url);
    const metadata = await response.json();
    return metadata as Record<string, unknown>;
    } catch (error) {
      console.error("Can't Display photo right now:", error);
      return {};
    }
  }

   export function ipfsToGatewayUrl(ipfsUri: string): string {
    return ipfsUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }

export default async function Home() {
  
  const { data: nfts_created, error } = await supabase
    .from("nft_created")
    .select(`type_id,
            nft_price,
            quantity,
            metadata_uri,
            nft_prices ( price, updated_at)`
  );

  if (error) {
    return null;
  }


  const nftData = await Promise.all(
    (nfts_created ?? []).map(async (nft) => {
      const metadata = await getNFTMetadata(nft.metadata_uri);
      const imageUrl = ipfsToGatewayUrl(String(metadata.image ?? ""));
      return {
        ...nft,
        ...metadata,
        imageUrl,
      };
    }),
  );

  const featured = nftData[0];

  return (
    <div className="relative pb-16">
      <section className="pt-10 sm:pt-14 ">

        <Container>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 ring-1 ring-white/10">
                <span className="tmt-dot-connected" aria-hidden />
                Testnet is live
              </div>
              <h1 className="mt-5 font-display text-[36px] leading-[1.05] tracking-wide text-white sm:text-[48px] md:text-[56px]">
                Transform imagination into digital legacy
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                Multichain minting, reward loops, and a sleek creator-to-collector
                experience. Explore curated drops, claim test tokens, and build
                your on-chain profile.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/faucet"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[linear-gradient(113deg,_#ffffff_0%,_rgba(0,200,83,0.95)_50%,_rgba(0,230,118,0.95)_100%)] px-6 text-sm font-semibold text-background shadow-[0_16px_40px_-18px_rgba(0,230,118,0.85)] ring-1 ring-[rgba(0,230,118,0.35)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_20px_50px_-20px_rgba(0,230,118,0.95)]"
                >
                  Get Test Tokens
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-white/5 px-6 text-sm font-semibold text-white ring-1 ring-white/10 transition-all duration-200 hover:bg-white/10 hover:ring-white/15"
                >
                  View Profile
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Base", "Mainnet", "Testnet", "Rewards", "Drops"].map((tag) => (
                  <div
                    key={tag}
                    className="rounded-full bg-white/5 px-4 py-2 text-xs font-medium text-white/75 ring-1 ring-white/10 transition-all duration-200 hover:bg-white/10 hover:ring-white/15"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-surface ring-1 ring-border shadow-[0_0_70px_rgba(0,200,83,0.18)] tmt-surface tmt-card-hover">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_0%_0%,_rgba(0,230,118,0.22),_rgba(7,29,18,0)_60%),radial-gradient(60%_60%_at_100%_100%,_rgba(0,200,83,0.16),_rgba(7,29,18,0)_60%)]" />
              <div className="relative p-4 sm:p-5 flex flex-col ">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-[rgba(0,230,118,0.14)] text-[#7cf6a8] ring-1 ring-[rgba(0,230,118,0.35)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M12 2 2 7l10 5 10-5-10-5Z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                      </svg>
                    </span>
                    Featured Mint
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/10">
                    <span className="tmt-dot-connected" aria-hidden />
                    LIVE
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10 aspect-[3/2] ">
                  <img
                    src={featured?.imageUrl || "https://placehold.co/900x600/png"}
                    alt={
                      typeof featured?.name === "string"
                        ? featured.name
                        : "Featured NFT artwork"
                    }
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] "
                  />
                </div>

                <div className="mt-4 flex justify-between ">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-white sm:text-lg">
                      {typeof featured?.name === "string"
                        ? featured.name
                        : "..."}
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      Qty:{" "}
                      {typeof featured?.quantity === "number" ||
                      typeof featured?.quantity === "string"
                        ? String(featured.quantity)
                        : "0"}{" "}
                    </div>
                  </div>
                  <div className="inline-flex max-h-[24px] items-center self-start rounded-full bg-[rgba(0,230,118,0.12)] px-3 py-1 text-xs font-semibold text-[#8af7b8] ring-1 ring-[rgba(0,230,118,0.35)] sm:self-auto">
                    {formatPrice(
                      typeof (featured as Record<string, unknown>)?.nft_prices ===
                        "object" &&
                      (featured as Record<string, unknown>)?.nft_prices &&
                      !Array.isArray((featured as Record<string, unknown>).nft_prices)
                        ? ((featured as Record<string, unknown>).nft_prices as Record<string, unknown>).price
                        : null,
                    )}
                  </div>
                </div>
                    <div className="mt-3">
                    <button className="inline-flex w-full h-11 items-center justify-center rounded-2xl bg-[linear-gradient(113deg,_#ffffff_0%,_rgba(0,200,83,0.95)_50%,_rgba(0,230,118,0.95)_100%)] text-sm font-semibold text-background shadow-[0_16px_36px_-18px_rgba(0,230,118,0.9)] ring-1 ring-[rgba(0,230,118,0.35)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_20px_48px_-20px_rgba(0,230,118,0.98)]">
                    <a href="/nft">  Mint → </a>
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pt-12 sm:pt-16">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Community", value: "24K+" },
              { label: "NFTs Minted", value: "1.2M" },
              { label: "Chains", value: "12" },
            ].map((s, idx) => (
              <div
                key={s.label}
                className={`group relative overflow-hidden rounded-3xl bg-surface ring-1 ring-white/10 px-5 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:ring-[rgba(0,230,118,0.35)] tmt-surface tmt-card-hover sm:px-6 sm:py-6 ${
                  idx === 0 ? "shadow-[0_0_60px_rgba(0,200,83,0.14)]" : ""
                }`}
              >
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,_transparent,_rgba(0,230,118,0.45),_transparent)] opacity-80" />
                <div className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/55 sm:text-sm sm:tracking-normal sm:uppercase-none sm:text-white/60">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pt-14 sm:pt-20">
        <Container>
          <div className="rounded-[28px] bg-surface ring-1 ring-border px-5 py-8 sm:px-8 tmt-surface">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="font-display text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-accent-2 sm:text-3xl">
                  Discover
                </div>
                <p className="mt-2 text-sm text-white/65">
                  Discover newly added NFT&apos;s.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Featured NFT's"].map((chip) => (
                  <button                                                                                                                                                     
                    key={chip}
                    className="h-10 rounded-full bg-white/5 px-4 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition-all duration-200 hover:bg-white/10 hover:ring-white/15"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {nftData
              .sort((a, b) => Number(b.type_id ?? 0) - Number(a.type_id ?? 0))
              .slice(0, 10)
              .map((nft) => {
                if (nft.type_id === (featured as Record<string, unknown>)?.type_id) return null;
                const typeId = nft.type_id;
                const name =
                  typeof nft.name === "string"
                    ? nft.name
                    : `NFT Type ${String(typeId)}`;
                const image =
                  typeof nft.imageUrl === "string" && nft.imageUrl.length
                    ? nft.imageUrl
                    : "https://placehold.co/720x520/png";
                const price =
                  typeof (nft as Record<string, unknown>).nft_prices ===
                    "object" &&
                  (nft as Record<string, unknown>).nft_prices &&
                  !Array.isArray((nft as Record<string, unknown>).nft_prices)
                    ? ((nft as Record<string, unknown>).nft_prices as Record<string, unknown>).price
                    : null;
                return (
                  <div
                    key={String(typeId)}
                    className="group min-w-[240px] shrink-0 overflow-hidden rounded-3xl bg-surface-2 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:ring-[rgba(0,230,118,0.35)] sm:min-w-[260px]"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        decoding="async"
                        className="h-36 w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] sm:h-40"
                      />
                      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0)_55%,_rgba(0,0,0,0.35)_100%)]" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 truncate text-sm font-semibold text-white">
                          {name}
                        </div>
                        <div className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/75 ring-1 ring-white/10">
                          {formatPrice(price)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-white/60">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-flex h-2 w-2 rounded-full bg-white/20" aria-hidden />
                          Qty:{" "}
                          {typeof nft.quantity === "number" ||
                          typeof nft.quantity === "string"
                            ? String(nft.quantity)
                            : "0"}
                        </span>
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[rgba(0,230,118,0.9)] shadow-[0_0_8px_rgba(0,230,118,0.5)]" aria-hidden />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="pt-14 sm:pt-20">
        <Container>
          <div className="grid gap-6 rounded-[28px] bg-[radial-gradient(ellipse_at_top,_rgba(0,200,83,0.18),_rgba(7,29,18,0.0)_60%)] ring-1 ring-white/10 px-6 py-10 md:grid-cols-2 md:items-center md:px-10">
            <div className="min-w-0">
              <div className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                Start Earning Rewards Now
              </div>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Connect, claim faucet tokens daily, pick a mint, and track your progress. Your profile
                becomes the place where your gallery and level stack up.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                {
                  title: "Connect wallet",
                  desc: "Unlock drops, quests, and profile XP.",
                },
                { title: "Claim faucet Tokens Daily",
                  desc: "Get free tokens daily to use in the community.",
                },
                { title: "Mint an NFT", desc: "Use mined tokens to curate NFT's." },
                {
                  title: "Earn rewards",
                  desc: "Giveaways, and leaderboard spots.",
                },
              ].map((step, idx) => (
                <div
                  key={step.title}
                  className="group relative overflow-hidden rounded-2xl bg-surface ring-1 ring-white/10 px-5 py-4 transition-all duration-200 hover:bg-white/[0.035] hover:ring-[rgba(0,230,118,0.28)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,230,118,0.12)] text-[12px] font-semibold text-[#8cf5b0] ring-1 ring-[rgba(0,230,118,0.3)]">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">
                        {step.title}
                      </div>
                      <div className="mt-1 text-sm text-white/60">{step.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pt-14 sm:pt-20">
        <Container>
          <div className="rounded-[28px] bg-surface ring-1 ring-white/10 px-6 py-10 tmt-surface tmt-card-hover md:flex md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="font-display text-2xl tracking-wide text-white sm:text-3xl">
                Have a question?
              </div>
              <p className="mt-2 text-sm text-white/65">
                Join the community and get help with mints, quests, and tokens.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
              {["Telegram", "X (Twitter)"].map((c, idx) => (
                <a
                  key={idx}
                  href={idx === 0 ? "https://t.me/@King_Tony27" : "https://x.com/king_Tony27"}
                  target="_blank"
                  rel="noreferrer"
                  className={idx === 0
                    ? "inline-flex h-11 items-center justify-center rounded-2xl bg-[linear-gradient(113deg,_#ffffff_0%,_rgba(0,200,83,0.95)_50%,_rgba(0,230,118,0.95)_100%)] px-5 text-sm font-semibold text-background shadow-[0_14px_34px_-18px_rgba(0,230,118,0.95)] ring-1 ring-[rgba(0,230,118,0.35)] transition-all duration-200 hover:brightness-105"
                    : "inline-flex h-11 items-center justify-center rounded-2xl bg-white/5 px-5 text-sm font-semibold text-white/85 ring-1 ring-white/10 transition-all duration-200 hover:bg-white/10 hover:ring-white/15"
                  }
                >
                  {c}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

//learn how to deploy on sepolia
// add the best bg-image for this page 
//deploy frontend and backend
//test  