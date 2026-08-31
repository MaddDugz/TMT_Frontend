// function to get user balance from blockchain
"use client";
import { useAccount,  useReadContract } from "wagmi";
const FaucetContractAddress = process.env.NEXT_PUBLIC_FAUCET_TOKEN_ADDRESS;
import {formatPrice} from "@/app/page"
import {FaucetTokenABI} from "@kingtony36/turtlenft-contracts";

function toAddress(value: string | undefined): `0x${string}` | undefined {
  if (value && /^0x[a-fA-F0-9]{40}$/.test(value)) return value as `0x${string}`;
  return undefined;
}

export function TokenBalance() {
  const { address, isConnected } = useAccount();
  const token = toAddress(FaucetContractAddress);



    const { data: balance, isLoading, error } = useReadContract({ //for directly getting TMT balance
    address: token,
    abi: FaucetTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  if (!isConnected) return null;
  if (isLoading) return (
    <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/[0.04] px-4 py-2.5 ring-1 ring-white/10 tmt-skeleton overflow-hidden relative">
      <span className="h-2.5 w-2.5 rounded-full bg-white/20" aria-hidden />
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">
        Loading TMT
      </span>
      <span className="h-4 w-20 sm:w-24 rounded-full bg-white/15" aria-hidden />
    </div>
  );
  if(error){
    console.log(error)
    return (
      <span className="inline-flex items-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200/90 ring-1 ring-red-400/20">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400/80" aria-hidden />
        Balance unavailable
      </span>
    )
  }

  const value = balance;
  // console.log("resolved token:", token);

  return (
    <div className="inline-flex items-baseline gap-2 sm:gap-3">
      <span className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wide bg-clip-text text-transparent bg-[linear-gradient(113deg,_#ffffff_0%,_rgba(0,230,118,0.98)_60%,_rgba(0,230,118,0.85)_100%)] drop-shadow-[0_0_24px_rgba(0,230,118,0.18)] tabular-nums">
        {(typeof value !== "bigint" || value <= 0n) ? ("0") :
       formatPrice(value)} 
      </span>
      <span className="text-sm sm:text-base font-semibold uppercase tracking-[0.18em] text-accent/90">
        TMT
      </span>
    </div>
  );
}