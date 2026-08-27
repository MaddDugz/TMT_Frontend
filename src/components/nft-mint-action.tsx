// code for nft-mint functionality
"use client";
import { useEffect, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { NFTokenABI } from "@kingtony36/turtlenft-contracts";
import { FaucetTokenABI } from "@kingtony36/turtlenft-contracts";
import {supabase} from "../lib/supabase"
import { getFriendlyErrorMessage } from "@/components/getFriendlyError";


function toAddress(value: string | undefined): `0x${string}` {
  if (value && /^0x[a-fA-F0-9]{40}$/.test(value)) return value as `0x${string}`;
  return "0x0000000000000000000000000000000000000000";
}

 
const NFTContractAddress = toAddress(process.env.NEXT_PUBLIC_NFT_TOKEN_ADDRESS);
const FaucetContractAddress = toAddress(process.env.NEXT_PUBLIC_FAUCET_TOKEN_ADDRESS)


type NftMintActionProps = { //define typeId type
  typeId: number | string;
  defaultQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
  totalLabel: number;
};

function toBigInt256(value: number | string): bigint | undefined { //convert inputed number to bigInt
  try {
    const asBig = BigInt(String(value));
    if (asBig < 0n) return undefined;
    return asBig;
  } catch {
    return undefined;
  }
}

export function NftMintAction({
  typeId,
  defaultQuantity = 1,
  onQuantityChange,
  totalLabel,
}: NftMintActionProps) {
  const [phase, setPhase] = useState<"idle" | "approving" | "minting">("idle");
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const initialQuantity =
    Number.isFinite(defaultQuantity) && defaultQuantity >= 1
      ? Math.floor(Number(defaultQuantity))
      : 1;
  const [quantity, setQuantityState] = useState<number>(initialQuantity);

  const typeIdArg = toBigInt256(typeId);
  const quantityArg = toBigInt256(quantity);
  const canMint =
    isConnected &&
    typeIdArg !== undefined &&
    quantityArg !== undefined &&
    quantityArg >= 1n &&
    NFTContractAddress !== "0x0000000000000000000000000000000000000000";


  // Fetch per-unit price for this NFT type from the contract
  const { data: priceData, error: priceError, status } = useReadContract({
    address: NFTContractAddress,  
    abi: NFTokenABI,
    functionName: "getPrice",
    args: typeIdArg !== undefined ? [typeIdArg] : undefined,
    query: { enabled: typeIdArg !== undefined && isOpen },
  });

   const pricePerUnit = (priceData as bigint | undefined) ?? undefined;
    const requiredAmount =
    pricePerUnit !== undefined && quantityArg !== undefined
      ? pricePerUnit * quantityArg
      : undefined;


    // Current allowance user has granted the NFT contract to spend their payment token
  const { data: allowance, refetch: refetchAllowance, } = useReadContract({
    address: FaucetContractAddress,
    abi: FaucetTokenABI,
    functionName: "allowance",
    args: address ? [address, NFTContractAddress] : undefined,
    query: { enabled: !!address && isOpen },
  });

  // Approve tx
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
    reset: resetApprove,
  }  = useWriteContract();


  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Mint tx
  const {
    writeContract,
    data: hash,
    isPending,
    error: mintError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

    // Once approval confirms on-chain, refetch allowance then fire the mint
  useEffect(() => {
    if (isApproveConfirmed && phase === "approving") {
      refetchAllowance().then(() => {
        setPhase("minting");
        writeContract({
          address: NFTContractAddress,
          abi: NFTokenABI,
          functionName: "mintNFT",
          args: [typeIdArg as bigint, quantityArg as bigint],
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveConfirmed]);

  const setQuantity = (next: number | ((prev: number) => number)) => {
    setQuantityState((prev) => {
      const resolved =
        typeof next === "function" ? (next as (p: number) => number)(prev) : next;
      if (typeof onQuantityChange === "function") {
        try {
          onQuantityChange(resolved);
        } catch {
          /* noop */
        }
      }
      return resolved;
    });
  };

  useEffect(() => {
    //Resets blockchain and frontend after claim
    if (isConfirmed) {
      setIsOpen(false);
      setQuantity(1);
      const id = window.setTimeout(() => reset(), 2500);
      return () => window.clearTimeout(id);
    }
  }, [isConfirmed, reset]);

  const decrement = () => //handling quatity decrement logic
    setQuantity((prev) => (Number.isFinite(prev) && prev > 1 ? prev - 1 : 1));

  const increment = () => //handling quantity increament logic

    setQuantity((prev) => {
    const next = Number.isFinite(prev) && prev >= 1 ? prev + 1 : 1;
    return next > 5 ? prev : next;
  });

  const handleQuantityInputChange = (value: string) => { //handling quantity change logic
    const n = Number(value);
    if (!Number.isFinite(n) || Number.isNaN(n)) {
      setQuantity(1);
      return;
    }
    const clamped = Math.max(1, Math.floor(Math.min(Number.MAX_SAFE_INTEGER, n)));
    setQuantity(clamped);
  };


 
  const mint = () => {
    if (
      !canMint ||
      requiredAmount === undefined ||
      isPending ||
      isConfirming ||
      isApprovePending ||
      isApproveConfirming
    )
      return;

    const currentAllowance = (allowance as bigint) ?? 0n;

    if (currentAllowance < requiredAmount) {
      setPhase("approving");
      writeApprove({
        address: FaucetContractAddress,
        abi: FaucetTokenABI,
        functionName: "approve",
        args: [NFTContractAddress, requiredAmount],
      });
      return; // mint fires automatically once approval confirms, via the effect above
    }

    setPhase("minting");
    writeContract({
      address: NFTContractAddress,
      abi: NFTokenABI,
      functionName: "mintNFT",
      args: [typeIdArg as bigint, quantityArg as bigint],
    });
  };

  const disabled = isPending || isConfirming || isApprovePending || isApproveConfirming;

  const buttonLabel = isApprovePending
    ? "Approving…"
    : isApproveConfirming
      ? "Confirming approval…"
      : isPending
        ? "Signing…"
        : isConfirming
          ? "Minting…"
          : isConfirmed
            ? "Minted ✓"
            : "Please try again";

            // if(mintError || approveError || priceError){
            //   mintError ? console.log("mint error", mintError)
            //   : approveError ? console.log("approve error", approveError.details)
            //   : priceError ? console.log("price error", priceError.details)
            //   : null
            // }


  return (
    <div className="mt-5 w-full">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[linear-gradient(113deg,_rgba(0,200,83,0.95)_0%,_rgba(0,230,118,0.95)_100%)] text-sm font-semibold text-background shadow-[0_14px_30px_-18px_rgba(0,230,118,0.75)] ring-1 ring-[rgba(0,230,118,0.35)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_18px_40px_-20px_rgba(0,230,118,0.9)] disabled:opacity-60 disabled:hover:shadow-[0_14px_30px_-18px_rgba(0,230,118,0.75)]"
          disabled={disabled}
        >
          {isConfirmed ? "Minted ✓" : "Mint NFT →"}
        </button>
      ) : (
        <div className="space-y-3 rounded-2xl bg-white/[0.025] p-3 ring-1 ring-white/10 sm:p-3.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decrement}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-lg font-semibold text-white ring-1 ring-white/10 transition-all duration-200 hover:bg-white/5 hover:ring-white/15 disabled:opacity-50"
              disabled={disabled || quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <label className="sr-only" htmlFor={`nft-mint-qty-${String(typeId)}`}>
              Mint quantity
            </label>
            <input
              id={`nft-mint-qty-${String(typeId)}`}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => handleQuantityInputChange(e.target.value)}
              className="h-11 w-full rounded-2xl border-0 bg-surface-2 px-3 text-center text-[15px] font-semibold text-white shadow-none outline-none ring-1 ring-white/10 transition-all duration-200 focus:ring-2 focus:ring-[rgba(0,230,118,0.55)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none sm:text-base"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={increment}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-lg font-semibold text-white ring-1 ring-white/10 transition-all duration-200 hover:bg-white/5 hover:ring-white/15 disabled:opacity-50"
              disabled={disabled || quantity >= 5}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setQuantity(1);
                reset();
                resetApprove()
              }}
              className="inline-flex h-11 w-28 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-sm font-semibold text-white ring-1 ring-white/10 transition-all duration-200 hover:bg-white/5 hover:ring-white/15 disabled:opacity-60"
              disabled={disabled}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={mint}
              className="group inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-[linear-gradient(113deg,_rgba(0,200,83,0.95)_0%,_rgba(0,230,118,0.95)_100%)] text-sm font-semibold text-background shadow-[0_14px_30px_-18px_rgba(0,230,118,0.75)] ring-1 ring-[rgba(0,230,118,0.35)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_18px_40px_-20px_rgba(0,230,118,0.9)] disabled:opacity-60 disabled:hover:shadow-[0_14px_30px_-18px_rgba(0,230,118,0.75)]"
              disabled={!canMint || disabled}
            >
              {totalLabel}
            </button>
          </div>

          {!isConnected && (
            <div className="rounded-2xl bg-white/5 px-3.5 py-2.5 text-[13px] text-white/65 ring-1 ring-white/10">
              Connect your wallet to mint.
            </div>
          )}


          {!isPending && !isConfirming && !isApprovePending && !isApproveConfirming && (approveError || mintError) && (
           <div className="rounded-2xl bg-white/5 px-3.5 py-2.5 text-[13px] text-red-500 ring-1 ring-red-500">
                {getFriendlyErrorMessage(approveError || mintError)}
            </div>
          )}

          {isConfirmed && (
            <div className="rounded-2xl bg-[rgba(0,230,118,0.08)] px-3.5 py-2.5 text-[13px] text-[#6df4a4] ring-1 ring-[rgba(0,230,118,0.3)]">
              Minted {String(quantity)} NFT(s) successfully.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

