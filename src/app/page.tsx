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
    (nfts_created ?? []).map(async (nft): Promise<Record<string, unknown>>  => {
      const metadata = await getNFTMetadata(nft.metadata_uri);
      const imageUrl = ipfsToGatewayUrl(String(metadata.image ?? ""));
      return {
        ...nft,
        ...metadata,
        imageUrl,
      };
    }),
  );

  const featuredData = nftData[0];
  const featured = featuredData as Record<string, unknown> | undefined;

  const sortedNfts = [...nftData]
    .sort((a, b) => Number(b.type_id ?? 0) - Number(a.type_id ?? 0))
    .filter((nft) => nft.type_id !== (featured as Record<string, unknown>)?.type_id)
    .slice(0, 10); 

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

  <div className="relative flex flex-col p-2 sm:p-2.5">
    {/* image now bleeds almost to the card edge, taller aspect ratio, LIVE badge floats on top */}
    <div className="relative overflow-hidden rounded-[1.25rem] ring-1 ring-white/10 aspect-[4/3]">
      <img
        src={typeof featured?.imageUrl === "string" ? featured?.imageUrl : "https://placehold.co/900x600/png"}
        alt={typeof featured?.name === "string" ? featured.name : "Featured NFT artwork"}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0)_50%,_rgba(0,0,0,0.55)_100%)]" />

      <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
        <span className="tmt-dot-connected" aria-hidden />
        LIVE
      </div>

      {/* name + qty overlaid at bottom of image for a premium editorial feel */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
        <div className="text-base font-semibold text-white drop-shadow-sm sm:text-lg">
          {typeof featured?.name === "string" ? featured.name : "..."}
        </div>
        <div className="mt-0.5 text-[13px] text-white/70">
          Qty:{" "}
          {typeof featured?.quantity === "number" || typeof featured?.quantity === "string"
            ? String(featured.quantity)
            : "0"}
        </div>
      </div>
    </div>

    <div className="mt-3 flex items-center justify-between gap-3 px-1">
      <div className="inline-flex items-center rounded-full bg-[rgba(0,230,118,0.12)] px-3 py-1 text-xs font-semibold text-[#8af7b8] ring-1 ring-[rgba(0,230,118,0.35)]">
        {formatPrice(
          typeof (featured as Record<string, unknown>)?.nft_prices === "object" &&
            (featured as Record<string, unknown>)?.nft_prices &&
            !Array.isArray((featured as Record<string, unknown>).nft_prices)
            ? ((featured as Record<string, unknown>).nft_prices as Record<string, unknown>).price
            : null,
        )}
      </div>

      <Link
        href="/nft"
        className="inline-flex h-10 flex-1 max-w-[160px] items-center justify-center rounded-2xl bg-[linear-gradient(113deg,_#ffffff_0%,_rgba(0,200,83,0.95)_50%,_rgba(0,230,118,0.95)_100%)] text-sm font-semibold text-background shadow-[0_16px_36px_-18px_rgba(0,230,118,0.9)] ring-1 ring-[rgba(0,230,118,0.35)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_20px_48px_-20px_rgba(0,230,118,0.98)]"
      >
        Mint →
      </Link>
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
          className="h-10 rounded-full bg-white/5 px-4 text-sm font-semibold text-white/80 ring-1 ring-white/10 shadow-[0_8px_20px_-12px_rgba(0,230,118,0.4)] transition-all duration-200 hover:bg-white/10 hover:ring-[rgba(0,230,118,0.3)]"
        >
          {chip}
        </button>
      ))}
    </div>
  </div>

  <div className="mt-6 flex gap-4 overflow-hidden pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div className="flex w-max gap-4 marquee-track">
    {[...sortedNfts, ...sortedNfts].map((nft, i) => {
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
          typeof (nft as Record<string, unknown>).nft_prices === "object" &&
          (nft as Record<string, unknown>).nft_prices &&
          !Array.isArray((nft as Record<string, unknown>).nft_prices)
            ? ((nft as Record<string, unknown>).nft_prices as Record<string, unknown>).price
            : null;
        return (
          <div
            key={`${nft.type_id}-${i}`}
            className="group min-w-[220px] shrink-0 overflow-hidden rounded-[1.5rem] bg-surface-2 p-1.5 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:ring-[rgba(0,230,118,0.35)] sm:min-w-[240px]"
          >
            {/* image now larger, tighter bezel, name/qty overlaid at bottom */}
            <div className="relative overflow-hidden rounded-[1.15rem]">
              <img
                src={image}
                alt={name}
                loading="lazy"
                decoding="async"
                className="h-48 w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04] sm:h-52"
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0)_45%,_rgba(0,0,0,0.65)_100%)]" />

              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="truncate text-sm font-semibold text-white drop-shadow-sm">
                  {name}
                </div>
                <div className="mt-1 flex items-center justify-between text-[13px] text-white/70">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/30" aria-hidden />
                    Qty:{" "}
                    {typeof nft.quantity === "number" || typeof nft.quantity === "string"
                      ? String(nft.quantity)
                      : "0"}
                  </span>
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[rgba(0,230,118,0.9)] shadow-[0_0_8px_rgba(0,230,118,0.5)]" aria-hidden />
                </div>
              </div>
            </div>
          </div>
        );
    })}
      </div>
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