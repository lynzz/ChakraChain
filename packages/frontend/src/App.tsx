import { useState, useEffect } from 'react'
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Input,
  Flex,
  IconButton,
  Badge,
  Select,
  Portal,
  createListCollection,
} from '@chakra-ui/react'
import { useAccount, useConnect, useDisconnect, useContractRead, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { parseEther, formatEther } from 'viem'
import { TOKEN1_ADDRESS, TOKEN2_ADDRESS, SWAP_ADDRESS } from './config'
import { ArrowUpDownIcon } from 'lucide-react'
// ABI for our contracts
const tokenABI = [
  { inputs: [], name: "decimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "owner", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" }
]

const swapABI = [
  { inputs: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }], name: "getExchangeRate", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }], name: "getAmountOut", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }], name: "swap", outputs: [], stateMutability: "nonpayable", type: "function" }
]

// Create token collection for Select component
const createTokenCollection = (token1Symbol: string, token2Symbol: string) => {
  return createListCollection({
    items: [
      { label: token1Symbol, value: TOKEN1_ADDRESS },
      { label: token2Symbol, value: TOKEN2_ADDRESS }
    ]
  })
}

function App() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  
  // State for token selection and amounts
  const [tokenIn, setTokenIn] = useState(TOKEN1_ADDRESS)
  const [tokenOut, setTokenOut] = useState(TOKEN2_ADDRESS)
  const [amountIn, setAmountIn] = useState("")
  const [amountOut, setAmountOut] = useState("0")
  const [isLoading, setIsLoading] = useState(false)
  
  // Get token balances
  const { data: token1Balance } = useContractRead({
    address: TOKEN1_ADDRESS as `0x${string}`,
    abi: tokenABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  })
  
  const { data: token2Balance } = useContractRead({
    address: TOKEN2_ADDRESS as `0x${string}`,
    abi: tokenABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  })
  
  // Get token symbols
  const { data: token1Symbol } = useContractRead({
    address: TOKEN1_ADDRESS as `0x${string}`,
    abi: tokenABI,
    functionName: 'symbol',
    query: {
      enabled: true,
    }
  })
  
  const { data: token2Symbol } = useContractRead({
    address: TOKEN2_ADDRESS as `0x${string}`,
    abi: tokenABI,
    functionName: 'symbol',
    query: {
      enabled: true,
    }
  })
  
  // Convert token symbols to strings to avoid type issues
  const token1SymbolStr = token1Symbol ? String(token1Symbol) : 'Token 1'
  const token2SymbolStr = token2Symbol ? String(token2Symbol) : 'Token 2'
  
  // Create token collections for Select components
  const tokenCollection = createTokenCollection(token1SymbolStr, token2SymbolStr)
  
  // Get exchange rate
  const { data: exchangeRate } = useContractRead({
    address: SWAP_ADDRESS as `0x${string}`,
    abi: swapABI,
    functionName: 'getExchangeRate',
    args: [tokenIn as `0x${string}`, tokenOut as `0x${string}`],
    query: {
      enabled: true,
    }
  })
  
  // Calculate amount out when amount in changes
  useEffect(() => {
    if (amountIn && exchangeRate) {
      try {
        const amountInWei = parseEther(amountIn)
        const amountOutWei = (amountInWei * BigInt(exchangeRate.toString())) / parseEther("1")
        setAmountOut(formatEther(amountOutWei))
      } catch (error) {
        console.error("Error calculating amount out:", error)
        setAmountOut("0")
      }
    } else {
      setAmountOut("0")
    }
  }, [amountIn, exchangeRate])
  
  // Contract write hooks
  const { writeContract } = useWriteContract()
  
  // Handle swap
  const handleSwap = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      return
    }
    
    setIsLoading(true)
    try {
      const amountInWei = parseEther(amountIn)
      const result = await writeContract({
        address: SWAP_ADDRESS as `0x${string}`,
        abi: swapABI,
        functionName: 'swap',
        args: [tokenIn as `0x${string}`, tokenOut as `0x${string}`, amountInWei],
      })
      
      if (typeof result === 'string') {
        const receipt = await useWaitForTransactionReceipt({ hash: result as `0x${string}` })
        console.log('Swap transaction confirmed:', receipt)
      }
    } catch (error) {
      console.error("Error swapping tokens:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle approve
  const handleApprove = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      return
    }
    
    setIsLoading(true)
    try {
      const amountInWei = parseEther(amountIn)
      const result = await writeContract({
        address: tokenIn as `0x${string}`,
        abi: tokenABI,
        functionName: 'approve',
        args: [SWAP_ADDRESS as `0x${string}`, amountInWei],
      })
      
      if (typeof result === 'string') {
        const receipt = await useWaitForTransactionReceipt({ hash: result as `0x${string}` })
        console.log('Approval transaction confirmed:', receipt)
      }
    } catch (error) {
      console.error("Error approving tokens:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Container maxW="container.md" py={8}>
      <VStack gap={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Token Swap</Heading>
          {isConnected ? (
            <HStack>
              <Text fontSize="sm">{address?.slice(0, 6)}...{address?.slice(-4)}</Text>
              <Button onClick={() => disconnect()}>Disconnect</Button>
            </HStack>
          ) : (
            <Button onClick={() => connect({ connector: injected() })}>Connect Wallet</Button>
          )}
        </Flex>

        <Box p={6} borderWidth={1} borderRadius="lg">
          <VStack gap={4}>
            <HStack width="100%" justify="space-between">
              <Box flex={1}>
                <Select.Root 
                  collection={tokenCollection}
                  value={[tokenIn]}
                  onValueChange={(details) => setTokenIn(details.value[0])}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select token" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {tokenCollection.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
                <Text fontSize="sm" mt={1}>
                  Balance: {token1Balance ? formatEther(BigInt(token1Balance.toString())) : "0"}
                </Text>
              </Box>
              
              <IconButton
                aria-label="Swap tokens"
                onClick={() => {
                  setTokenIn(tokenOut)
                  setTokenOut(tokenIn)
                }}
              >
                <ArrowUpDownIcon />
              </IconButton>
              
              <Box flex={1}>
                <Select.Root 
                  collection={tokenCollection}
                  value={[tokenOut]}
                  onValueChange={(details) => setTokenOut(details.value[0])}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select token" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {tokenCollection.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
                <Text fontSize="sm" mt={1}>
                  Balance: {token2Balance ? formatEther(BigInt(token2Balance.toString())) : "0"}
                </Text>
              </Box>
            </HStack>

            <Input
              placeholder="Amount to swap"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              type="number"
            />
            
            <Text>You will receive: {amountOut} {tokenOut === TOKEN1_ADDRESS ? token1SymbolStr : token2SymbolStr}</Text>
            
            <HStack width="100%">
              <Button
                flex={1}
                colorScheme="blue"
                variant="outline"
                onClick={handleApprove}
                loadingText="Approving..."
                loading={isLoading}
                disabled={!amountIn || parseFloat(amountIn) <= 0}
              >
                Approve
              </Button>
              <Button
                flex={1}
                colorScheme="blue"
                onClick={handleSwap}
                loadingText="Swapping..."
                loading={isLoading}
                disabled={!amountIn || parseFloat(amountIn) <= 0}
              >
                Swap
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default App
