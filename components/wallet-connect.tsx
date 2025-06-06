// components/WalletConnect.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { connectMetaMask, isWalletConnected } from '../lib/wallet'

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
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Button onClick={handleConnect} variant="secondary">
          Connect Wallet
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-sm">
            Connected
          </Button>
          <span className="text-sm text-gray-500 truncate max-w-[150px]">
            {walletAddress}
          </span>
        </div>
      )}
    </div>
  )
}
