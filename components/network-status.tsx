'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useWeb3 } from './providers/web3-provider'
import { sepoliaChain } from '@/lib/wallet'
import { AlertCircle, CheckCircle2, Signal } from 'lucide-react'

export function NetworkStatus() {
  const { provider } = useWeb3()
  const [network, setNetwork] = useState<{ name: string; chainId: number } | null>(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  useEffect(() => {
    const checkNetwork = async () => {
      if (!provider) return
      
      try {
        const network = await provider.getNetwork()
        setNetwork({
          name: network.name,
          chainId: network.chainId
        })
        
        // Check if we're on Sepolia (chainId: 11155111)
        setIsCorrectNetwork(network.chainId === parseInt(sepoliaChain.chainId, 16))
      } catch (error) {
        console.error('Error checking network:', error)
      }
    }

    checkNetwork()
  }, [provider])

  if (!network) return null

  return (
    <Badge 
      variant={isCorrectNetwork ? "default" : "destructive"}
      className="flex items-center gap-1"
    >
      {isCorrectNetwork ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          <span>Sepolia</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3" />
          <span>Wrong Network</span>
        </>
      )}
    </Badge>
  )
}
