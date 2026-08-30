// lib/wagmi-config.ts
'use client'

import { http, cookieStorage, createStorage } from "wagmi";
import { hardhat, sepolia, mainnet } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";


export const config = getDefaultConfig({
  appName: "TMT NFT Project",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, sepolia], //change to sepolia when deploying to testnet
  ssr: true,

   storage: createStorage({
    storage: cookieStorage,
  }),

   wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, coinbaseWallet, injectedWallet],
    },
  ],

  transports: {
    // [hardhat.id]: http("http://127.0.0.1:8545"),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL!),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!)
  },
});

// Re publish nft Token abi because of contract change and import new one 