"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface WalletConnectProps {
  onConnect: (address: string) => void
  connected: boolean
  address: string
}

export default function WalletConnect({ onConnect, connected, address }: WalletConnectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleConnect = (walletType: string) => {
    // Simulate wallet connection
    const mockAddress = "0x" + Math.random().toString(16).slice(2, 12) + "..."
    onConnect(mockAddress)
    setIsOpen(false)
  }

  if (connected) {
    return (
      <Button variant="outline" className="bg-white text-purple-700 border-purple-300 hover:bg-purple-50">
        <Wallet className="h-4 w-4 mr-2" />
        {address}
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-purple-700 hover:bg-purple-50">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>Connect your crypto wallet to access your CryptoPet NFTs</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={() => handleConnect("metamask")} className="flex justify-between items-center w-full">
            <span>MetaMask</span>
            <img src="/placeholder.svg?height=24&width=24" alt="MetaMask" className="h-6 w-6" />
          </Button>

          <Button onClick={() => handleConnect("walletconnect")} className="flex justify-between items-center w-full">
            <span>WalletConnect</span>
            <img src="/placeholder.svg?height=24&width=24" alt="WalletConnect" className="h-6 w-6" />
          </Button>

          <Button onClick={() => handleConnect("coinbase")} className="flex justify-between items-center w-full">
            <span>Coinbase Wallet</span>
            <img src="/placeholder.svg?height=24&width=24" alt="Coinbase" className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
