// app/nft/page.tsx (or wherever this lives)
import { Container } from "@/components/container";
import { supabase } from "@/lib/supabase";
import {
  getNFTMetadata,
  ipfsToGatewayUrl,
} from "@/app/page";
import { NftDisplay } from "@/components/nft-display";

export const dynamic = "force-static";
export const revalidate = 300;

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

export default async function NFT() {
  const { data: nfts_created, error } = await supabase
    .from("nft_created")
    .select(
      `type_id,
       nft_price,
       quantity,
       metadata_uri,
       nft_prices ( price, updated_at )`,
    )
    .limit(20);

  if (error) {
    return null;
  }

  const nftData = await pMap(
    (nfts_created ?? []) as Array<Record<string, unknown>>,
    async (nft) => {
      const metadataUri = String(nft.metadata_uri ?? "");
      const metadata = await getNFTMetadata(metadataUri);
      const imageUrl = ipfsToGatewayUrl(String(metadata.image ?? ""));
      const unitPriceRaw = resolveNftPriceRaw(nft);

      const rawTypeId = nft.type_id;
      const typeId =
        typeof rawTypeId === "number" || typeof rawTypeId === "string"
          ? rawTypeId
          : `${Math.random().toString(36).slice(2)}`;
    const remainingQuantity: number = nft.quantity ?? 0;
      const fallbackName = `NFT #${String(typeId)}`;
      const name =
        typeof metadata.name === "string" && metadata.name.length ? metadata.name : fallbackName;
      const imageSrc =
        typeof imageUrl === "string" && imageUrl.length
          ? imageUrl
          : "https://placehold.co/720x520/png";

      return {
        typeId,
        name,
        imageSrc,
        rawUnitPrice: unitPriceRaw,
        remainingQuantity,
      };
    },
    4,
  );

  return (
    <section className="pt-14 sm:pt-20">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="font-display text-2xl tracking-wide text-white">
              Top Selections
            </div>
            <p className="mt-2 text-sm text-white/65">
              Curated mints with clean designs and rewarding quests.
            </p>
          </div>
        </div>

        <NftDisplay nftData={nftData} />
      </Container>
    </section>
  );
}