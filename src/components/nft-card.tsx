// code to display nft-cards
"use client";
import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { NftMintAction } from "./nft-mint-action";
import { NftImportAction } from "./nft-import-action";
import { formatPrice } from "@/app/page";
const rawNft = process.env.NEXT_PUBLIC_NFT_TOKEN_ADDRESS;
const NFTContractAddress = toAddress(rawNft);


export type NftCardProps = {
  tokenId?: number | string; 
  typeId?: number | string;
  name: string;
  imageSrc: string;
  rawUnitPrice: string | null;
  remainingQuantity?:number | string
};


  function toAddress(value: string | undefined): `0x${string}` {
  if (value && /^0x[a-fA-F0-9]{40}$/.test(value)) return value as `0x${string}`;
  return "0x0000000000000000000000000000000000000000";
}


function formatTotalPrice(unitPrice: bigint | null, quantity: number): string {
  if (unitPrice === null || !Number.isFinite(quantity) || quantity < 1) {
    return formatPrice(unitPrice === null ? null : unitPrice.toString());
  }

  const qtyAsBig = BigInt(String(Math.max(1, Math.floor(quantity))));
  const total = unitPrice * qtyAsBig;
  try {
    const formatted = ethers.formatUnits(total.toString(), 18);
    const n = Number(formatted);
    if (!Number.isFinite(n) || n <= 0) return "Free";
    return `${n.toFixed(0)} TMT`;
  } catch {
    return formatPrice(total.toString());
  }
}

function parseBigPrice(value: string | null): bigint | null {
  if (value === null || value === undefined) return null;
  if (value === "") return null;
  try {
    const asBig = BigInt(value);
    return asBig;
  } catch {
    return null;
  }
}

export function NftCard({ tokenId, typeId, name, imageSrc, rawUnitPrice, remainingQuantity }: NftCardProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const unitPrice = useMemo(() => parseBigPrice(rawUnitPrice), [rawUnitPrice]);

  const totalLabel = formatTotalPrice(unitPrice, selectedQuantity); // one to display as string
  const totalLableNumber = Number(totalLabel); // one to send over as number


if(typeId !== undefined)
  return (
    <div className="group w-80 relative h-[30rem]  overflow-hidden rounded-3xl bg-surface ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:ring-[rgba(0,230,118,0.35)] tmt-surface tmt-card-hover">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,_transparent,_rgba(0,230,118,0.5),_transparent)] opacity-80" />
      <div className="relative h-[80%] w-full  overflow-hidden">
      <img
        src={imageSrc}
        alt={`NFT ${String(typeId)}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] "
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0)_55%,_rgba(0,0,0,0.35)_100%)]" />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white sm:text-[15px]">{name}</div>
          </div>
          {(remainingQuantity !== undefined && remainingQuantity !== null && String(remainingQuantity) !== "") ? (
              <div className="inline-flex items-center rounded-full bg-[rgba(0,230,118,0.12)] px-2.5 py-1 text-[11px] font-semibold text-[#8cf5b0] ring-1 ring-[rgba(0,230,118,0.32)]">
                   {selectedQuantity > 1
                  ? `${totalLabel}`
                  : totalLabel}
              </div>
          ): null}
          
        </div>

        <div className="mt-3 flex items-center justify-between text-[13px] text-white/65 sm:text-sm">
           <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-2 w-2 rounded-full bg-white/20" aria-hidden />
                        Qty:{" "}
                        {typeof remainingQuantity === "number" ||
                        typeof remainingQuantity === "string"
                          ? String(remainingQuantity)
                          : "0"}
                      </span>

                      <span className="inline-flex items-center gap-1.5 text-white/55">
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[rgba(0,230,118,0.9)] shadow-[0_0_8px_rgba(0,230,118,0.5)]" aria-hidden />
                        Available
                      </span>
        </div>

        {/* //display overlay of mint button  */}
           <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/50 p-4 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        <NftMintAction
          typeId={typeId}
          defaultQuantity={selectedQuantity}
          onQuantityChange={setSelectedQuantity}
          totalLabel= {totalLableNumber}
        />
        </div>
          </div>
      </div>
    </div>
  );

  if(tokenId !== undefined){
    return(
       <div className="group relative overflow-hidden rounded-3xl bg-surface ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:ring-[rgba(0,230,118,0.35)] tmt-surface tmt-card-hover">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,_transparent,_rgba(0,230,118,0.5),_transparent)] opacity-80" />
      <div className="relative h-[80%] w-full  overflow-hidden">
      <img
        src={imageSrc}
        alt={`NFT ${String(tokenId)}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] "
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0)_55%,_rgba(0,0,0,0.35)_100%)]" />
      </div>

      <div className="p-4 sm:p-5">
        <div className="  gap-3">
          <div className="text-sm font-semibold text-white sm:text-[15px]">{name} #{tokenId}</div>
        </div>
        <div className="mt-2 text-sm text-white/60">
          
        </div>

        {/* display overlay of import function button  */}
         <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/50 p-4 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="w-full" onClick={(e) => e.stopPropagation()}>
          <NftImportAction
            tokenId={tokenId}
            contractAddress = {NFTContractAddress}
            imageUrl = {imageSrc}
          />
          </div>
        </div>
      </div>
    </div>
  );

  }
}

