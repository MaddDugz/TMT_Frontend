// components/nft-list-client.tsx
"use client";

import { useState, useMemo } from "react";
import { NftCard } from "@/components/nft-card";
import { SortDropdown } from "@/components/sortBy";

type SortOrder = "asc" | "desc";

type NftItem = {
  typeId: number | string;
  name: string;
  imageSrc: string;
  rawUnitPrice: string | null;
  remainingQuantity: number;
};

export function NftDisplay({ nftData }: { nftData: NftItem[] }) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedNftData = useMemo(() => {
    return [...nftData].sort((a, b) => {
      const aPrice = a.rawUnitPrice ? BigInt(a.rawUnitPrice) : 0n;
      const bPrice = b.rawUnitPrice ? BigInt(b.rawUnitPrice) : 0n;
      if (aPrice < bPrice) return sortOrder === "asc" ? -1 : 1;
      if (aPrice > bPrice) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [nftData, sortOrder]);

  return (
    <>
      <div className="mt-6 flex justify-end">
        <SortDropdown value={sortOrder} onChange={setSortOrder} />
      </div>

      <div className="mt-6 lg:grid md:grid gap-4 flex flex-col justify-center items-center lg:grid-cols-3 md:grid-cols-2">
        {sortedNftData.map((item) => (
          <NftCard
            key={String(item.typeId)}
            typeId={item.typeId}
            name={item.name}
            imageSrc={item.imageSrc}
            rawUnitPrice={item.rawUnitPrice}
            remainingQuantity={item.remainingQuantity ?? 0}
          />
        ))}
      </div>
    </>
  );
}