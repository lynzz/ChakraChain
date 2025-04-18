import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { injected } from 'wagmi/connectors'

function App() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address,
  })

  return (
    <Container maxW="container.xl" py={10}>
      <VStack gap={8}>
        <Heading>ChakraChain DApp</Heading>
        
        <Box p={6} borderRadius="lg" borderWidth="1px" w="full">
          <VStack gap={4}>
            <Text>Connection Status: {isConnected ? '🟢 Connected' : '🔴 Not Connected'}</Text>
            {isConnected ? (
              <>
                <Text>Account: {address}</Text>
                <Text>Balance: {balance?.formatted} {balance?.symbol}</Text>
                <Button colorScheme="red" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </>
            ) : (
              <Button colorScheme="blue" onClick={() => connect({ connector: injected() })}>
                Connect Wallet
              </Button>
            )}
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default App
