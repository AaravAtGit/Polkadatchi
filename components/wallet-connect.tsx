// components/WalletConnect.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { connectMetaMask, isWalletConnected, sepoliaChain } from '../lib/wallet'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NetworkStatus } from './network-status'

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  connected?: boolean;
  address?: string;
}

export default function WalletConnect({ onConnect, connected, address }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(connected || false)
  const [walletAddress, setWalletAddress] = useState(address || '')

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await isWalletConnected()
      setIsConnected(connected)
    }
    checkConnection()
  }, [])

  const handleConnect = async () => {
    try {
      const { address } = await connectMetaMask()
      setIsConnected(true)
      setWalletAddress(address)
      onConnect?.(address)
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      // Show user-friendly error message
      alert(error?.message || 'Please make sure you have MetaMask installed and are connected to Sepolia network')
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Button 
          onClick={handleConnect} 
          variant="secondary"
          className="flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          Connect to AssetHub
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <NetworkStatus />
          <span className="text-sm text-gray-500 truncate max-w-[150px]">
            {walletAddress}
          </span>
        </div>
      )}
    </div>
  )
}
