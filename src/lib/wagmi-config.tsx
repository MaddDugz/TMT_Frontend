// lib/wagmi-config.ts
import { http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";


export const config = getDefaultConfig({
  appName: "TMT NFT Project",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia], //change to sepolia when deploying to testnet
  ssr: true,

  transports: {
    // [hardhat.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!)
  },
});

// Re publish nft Token abi because of contract change and import new one 