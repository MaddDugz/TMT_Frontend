
"use client";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import {FaucetTokenABI} from "@kingtony36/turtlenft-contracts";
import { Container } from "@/components/container";
import {useState} from "react";
import {TransactionExecutionError,  UserRejectedRequestError, BaseError} from "viem";
import { getFriendlyErrorMessage } from "@/components/getFriendlyError";

const rawNft = process.env.NEXT_PUBLIC_NFT_TOKEN_ADDRESS;
const rawFaucet = process.env.NEXT_PUBLIC_FAUCET_TOKEN_ADDRESS;

function toAddress(value: string | undefined): `0x${string}` {
  if (value && /^0x[a-fA-F0-9]{40}$/.test(value)) return value as `0x${string}`;
  return "0x0000000000000000000000000000000000000000";
}

const NFTContractAddress = toAddress(rawNft);
const FaucetContractAddress = toAddress(rawFaucet);


export function ClaimButton() { // claim button logic 
  const { isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  function handleClaim() {
    writeContract({
      address: FaucetContractAddress,
      abi: FaucetTokenABI,
      functionName: "claim",
    });
  }

  if (!isConnected) {
    return <button className="mt-5 text-white inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white/5 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/15 disabled:opacity-60" disabled>Connect wallet to claim</button>;
  }

  if(error){
    return (
   <div>
  <button
    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[rgba(255,77,79,0.12)] px-4 text-sm font-semibold text-[#ffb5ba] shadow-[0_12px_28px_-24px_rgba(255,77,79,0.5)] ring-1 ring-[rgba(255,77,79,0.32)] disabled:opacity-60"
    disabled
  >
  {
  error instanceof BaseError
    ? error?.walk((e) => e instanceof  UserRejectedRequestError)
      ? "User rejected request" 
      : error?.walk((e) => e instanceof TransactionExecutionError) ? 
      "Cooldown not exceeded "
      : getFriendlyErrorMessage(error)
    : error?.message ?? "Something went wrong"
    }
  </button>
</div>
    )
  }

  return (
    <div>
      <button onClick={handleClaim} disabled={isPending || isConfirming} className="group mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[linear-gradient(113deg,_rgba(0,200,83,0.95)_0%,_rgba(0,230,118,0.95)_100%)] text-sm font-semibold text-background shadow-[0_14px_30px_-18px_rgba(0,230,118,0.75)] ring-1 ring-[rgba(0,230,118,0.35)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_18px_40px_-20px_rgba(0,230,118,0.85)] disabled:opacity-60 disabled:hover:shadow-[0_14px_30px_-18px_rgba(0,230,118,0.75)]">
               {isPending ? "Confirm in wallet..." : isConfirming ? "Claiming..." : isConfirmed ? "Claimed successfully ✓" : "Claim 100 TMT →"}
      </button>
    </div>
  );
}

type FaucetCard = {
  id : number,
  symbol: string;
  name: string;
  chain: string;
  reward: string;
  button?: string;
  contractAddress: `0x${string}`;
};

const faucets: FaucetCard[] = [
  {
    id: 0,
    symbol: "TMT",
    name: "TMT Faucet",
    chain: "TMT Testnet",
    reward: "Daily reward • Per wallet • every 24h",
    button: "Claim 100 TMT →",
    contractAddress: FaucetContractAddress,
  },
  {
    id: 1,
    symbol: "TMT NFT",
    name: "TMT NFT Faucet",
    chain: "TMT Testnet",
    reward: "Ownership over TMT NFT",
    contractAddress: NFTContractAddress,
  },
];

export default function FaucetPage() {

 const [copiedId, setCopiedId] = useState<string | number | null>(null);

  async function copyAddress(text: string, id: string | number) {
    if (!text) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 5000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  }


  return (
    <div className="pb-12 pt-10 sm:pt-14">
      <Container>
        <div className="text-center">
          <h1 className="mx-auto max-w-3xl font-display text-[36px] leading-[1.02] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-accent-2 sm:text-[46px] md:text-[52px]">
            Token Faucet
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Claim testnet tokens once every 24 hours. Paste your wallet address,
            choose a faucet, and hit claim.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {faucets.map((faucet) => (
            <div
              key={faucet.id}
              className="group relative overflow-hidden rounded-3xl bg-surface ring-1 ring-border shadow-[0_0_70px_rgba(0,200,83,0.14)] tmt-surface tmt-card-hover"
            >
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(65%_90%_at_100%_0%,_rgba(0,230,118,0.18),_rgba(7,29,18,0)_60%)]" />
              <div className="relative p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 sm:h-14 sm:w-14">
                      <img
                        src={`https://placehold.co/96x96/png?text=${encodeURIComponent(
                          faucet.symbol,
                        )}`}
                        alt={`${faucet.symbol} icon`}
                        className="h-full w-full object-cover"
                      />
                      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(0,0,0,0))]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold text-white sm:text-base">
                        {faucet.name}
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        {faucet.chain}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <div className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/10">
                      {faucet.symbol}
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(0,200,83,0.15)] px-3 py-1 text-xs font-semibold text-[#00E676] ring-1 ring-[rgba(0,230,118,0.35)]">
                      <span className="tmt-dot-connected" aria-hidden />
                      LIVE
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white/5 px-4 py-3 text-xs font-medium text-white/70 ring-1 ring-white/10 sm:text-[13px]">
                  {faucet.reward}
                </div>

               <div className="mt-5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                    Contract Address
                  </label>
                  <div className="relative mt-2">
                    <input
                      placeholder="0x... wallet address"
                      value={faucet.contractAddress}
                      readOnly
                      className="h-12 w-full rounded-2xl bg-background/60 pl-4 pr-12 text-[13px] text-white placeholder:text-white/35 ring-1 ring-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgba(0,230,118,0.45)] sm:text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => copyAddress(faucet.contractAddress, faucet.id)}
                      className="absolute right-2.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-white/55 ring-1 ring-white/10 transition-all duration-200 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[rgba(0,230,118,0.45)]"
                      aria-label="Copy contract address"
                    >
                      {copiedId === faucet.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style={{ fill: "#00E676" }} aria-hidden>
                          <path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style={{ fill: "currentColor" }} aria-hidden>
                          <path d="M14 8H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V10c0-1.103-.897-2-2-2z"></path>
                          <path d="M20 2H10a2 2 0 0 0-2 2v2h8a2 2 0 0 1 2 2v8h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path>
                        </svg>
                      )}
                   </button>

                  </div>
                </div>
                    {faucet.symbol === "TMT" && (
                    <ClaimButton />
                    )}
                </div>
              </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
