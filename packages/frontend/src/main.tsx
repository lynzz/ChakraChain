import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        body: { value: 'Inter, sans-serif' },
      },
    },
  },
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          <App />
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
