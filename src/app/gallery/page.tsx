"use client";

import { Container } from "@/components/container";
import { NftCard } from "@/components/nft-card";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { getNFTMetadata, ipfsToGatewayUrl } from "@/app/page";

async function pMap<TIn, TOut>(
  items: TIn[],
  fn: (item: TIn) => Promise<TOut>,
  concurrency: number,
): Promise<TOut[]> {
  const results: TOut[] = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }).map(
    async () => {
      while (nextIndex < items.length) {
        const current = nextIndex++;
        const item = items[current];
        results[current] = await fn(item);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

function resolveNftPriceRaw(nft: Record<string, unknown>): string | null {
  const nested = (nft as { nft_prices?: unknown }).nft_prices;
  if (
    nested &&
    typeof nested === "object" &&
    !Array.isArray(nested) &&
    (nested as { price?: unknown }).price !== undefined
  ) {
    const value = (nested as { price: unknown }).price;
    return value === null || value === undefined ? null : String(value);
  }
  if (Array.isArray(nested) && nested.length > 0) {
    const first = nested[0];
    if (
      first &&
      typeof first === "object" &&
      (first as { price?: unknown }).price !== undefined
    ) {
      const value = (first as { price: unknown }).price;
      return value === null || value === undefined ? null : String(value);
    }
  }
  const direct = (nft as { nft_price?: unknown }).nft_price;
  return direct === null || direct === undefined ? null : String(direct);
}

type GalleryItem = {
  tokenId: string | number;
  name: string;
  imageSrc: string;
  rawUnitPrice: string | null;
};

export default function Gallery() {
  const { address: walletAddress, isConnected } = useAccount();

  const [nftData, setNftData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !walletAddress) {
      setNftData([]);
      return;
    }

    let cancelled = false;

    async function loadGallery() {
      setLoading(true);
      setError(null);

      try {
        const { data: nfts_mints, error: supabaseError } = await supabase
          .from("nft_mints")
          .select("*, nft_created(metadata_uri)")
          .eq("owner_address", walletAddress)
          .order("minted_at", { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }



        const nftData = await pMap(
          (nfts_mints ?? []) as Array<Record<string, unknown>>,
          async (nft) => {
              const nft_created = nft.nft_created as Record<string, unknown>;
              const metadataUri = String(nft_created?.metadata_uri ?? "");
                  const metadata = await getNFTMetadata(metadataUri);
                  const imageUrl = ipfsToGatewayUrl(String(metadata.image ?? ""));
                  const unitPriceRaw = resolveNftPriceRaw(nft);
            
                  const rawTokenId = nft.token_id;
                  const tokenId =
                    typeof rawTokenId === "number" || typeof rawTokenId === "string"
                      ? rawTokenId
                      : `${Math.random().toString(36).slice(2)}`;
                    const fallbackName = `NFT #${String(tokenId)}`;
                   const name = 
                    typeof metadata.name === "string" && metadata.name.length ? metadata.name : fallbackName; 
                  const imageSrc =
                    typeof imageUrl === "string" && imageUrl.length
                      ? imageUrl
                      : "https://placehold.co/720x520/png";
            
                  return {
                    tokenId,
                    name,
                    imageSrc,
                    rawUnitPrice: unitPriceRaw,
                  };
          },
          5, // concurrency
        );

        if (!cancelled) {
          setNftData(nftData);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load gallery";
          console.error("Error fetching gallery:", message);
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    loadGallery();

    return () => {
      cancelled = true;
    };
  }, [isConnected, walletAddress]);

  return (
    <section className="pt-14 sm:pt-20">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="font-display text-2xl tracking-wide text-white">
              Your Gallery
            </div>
            <p className="mt-2 text-sm text-white/65">NFT&apos;s you Own</p>
          </div>
          <a href="#" className="text-sm font-semibold text-white/80">
            View all
          </a>
        </div>

        {!isConnected && (
          <p className="mt-6 text-sm text-white/65">Connect your wallet to view your gallery.</p>
        )}

        {loading && <p className="mt-6 text-sm text-white/65">Loading your NFTs...</p>}

        {error && <p className="mt-6 text-sm text-red-400">Error: {error}</p>}

        {!loading && !error && isConnected && nftData.length === 0 && (
          <p className="mt-6 text-sm text-white/65">No NFTs found for this wallet.</p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {nftData.map((item) => (
            <NftCard
              key={String(item.tokenId)}
              tokenId={item.tokenId}
              name={item.name}
              imageSrc={item.imageSrc}
              rawUnitPrice={item.rawUnitPrice}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

