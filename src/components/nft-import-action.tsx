// code for nft-import functionality
"use client";
import { useState } from "react";
import { useWalletClient, useChainId, useSwitchChain } from "wagmi";
import { getFriendlyErrorMessage } from "@/components/getFriendlyError";


type NftImportActionProps = {
  contractAddress: `0x${string}`;
  tokenId: number | string;
  tokenStandard?: "ERC721" | "ERC1155"; // defaults to ERC721
  targetChainId?: number; // chain the NFT actually lives on, if you need to force a switch first
  symbol?: string; // short display symbol some wallets show alongside the asset (optional, MetaMask-specific)
  imageUrl?: string; // optional image hint — support varies by wallet
};

export function NftImportAction({
  contractAddress,
  tokenId,
  tokenStandard = "ERC721",
  targetChainId,
  symbol,
  imageUrl,
}: NftImportActionProps) {
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const [status, setStatus] = useState<"idle" | "switching" | "prompting" | "success" | "declined" | "unsupported">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const disabled = status === "switching" || status === "prompting" || isSwitching;
  

  const handleImport = async () => {
    if (!walletClient) return;
    setErrorMessage(null);

    try {
      // If the NFT lives on a different chain than the wallet's current one,
      // watchAsset has no chain param — it just applies to whatever's active.
      // So we switch first if the caller told us which chain to be on.
      if (targetChainId !== undefined && chainId !== targetChainId) {
        setStatus("switching");
        await switchChainAsync({ chainId: targetChainId });
      }

      setStatus("prompting");

      const wasAdded = await walletClient.request({
        method: "wallet_watchAsset",
        params: {
          type: tokenStandard,
          options: {
            address: contractAddress,
            tokenId: String(tokenId),
            ...(symbol ? { symbol } : {}),
            ...(imageUrl ? { image: imageUrl } : {}),
          },
        },
      } as any);

      setStatus(wasAdded ? "success" : "declined");
    } catch (err: any) {
      // Wallets that don't support wallet_watchAsset for NFTs (many WalletConnect-linked
      // mobile wallets) typically throw here rather than returning false.
      console.error("wallet_watchAsset failed", err);
      setStatus("unsupported");
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      window.setTimeout(() => setStatus("idle"), 2500);
    }
  };

  const buttonLabel =
    status === "switching"
      ? "Switching network…"
      : status === "prompting"
        ? "Confirm in wallet…"
        : status === "success"
          ? "Added ✓"
          : status === "declined"
            ? "Not added"
            : status === "unsupported"
              ? "Unsupported"
              : "Import NFT";

  return (
    <div className="mt-4 w-full space-y-2">
      <button
        type="button"
        onClick={handleImport}
        disabled={disabled}
        className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[linear-gradient(113deg,_rgba(0,200,83,0.95)_0%,_rgba(0,230,118,0.95)_100%)] text-sm font-semibold text-background shadow-[0_12px_24px_rgba(0,200,83,0.16)] hover:brightness-105 disabled:opacity-60"
      >
        {buttonLabel}
      </button>

      {status === "unsupported" && errorMessage && (
        <div className="rounded-xl bg-[rgba(255,77,79,0.08)] px-3 py-2 text-xs text-[#ff9aa0] ring-1 ring-[rgba(255,77,79,0.25)]">
          {errorMessage}
        </div>
      )}

      {status === "declined" && (
        <div className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/65 ring-1 ring-white/10">
          Import was cancelled in your wallet.
        </div>
      )}
    </div>
  );
}