'use client'

import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from 'wagmi'
import {  RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '../lib/wagmi-config' // wherever your config lives

import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (

    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
         <RainbowKitProvider 
         theme={darkTheme({
        accentColor: '#0fee7bda', // your button color
        accentColorForeground: 'white', // text color on the button
        borderRadius: 'medium',
        })}  
        modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}