"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, Coins, Heart, Star } from "lucide-react"
import Link from "next/link"
import WalletConnect from "@/components/wallet-connect"

interface MintTier {
  name: string
  price: string
  rarity: string
  color: string
  features: string[]
  emoji: string
}

const mintTiers: MintTier[] = [
  {
    name: "Common Pet",
    price: "0.05 ETH",
    rarity: "Common",
    color: "bg-gray-100 border-gray-300",
    features: ["Basic stats", "Standard animations", "Feed & Play actions"],
    emoji: "🐱",
  },
  {
    name: "Rare Pet",
    price: "0.15 ETH",
    rarity: "Rare",
    color: "bg-blue-100 border-blue-300",
    features: ["Enhanced stats", "Special animations", "Bonus interactions", "Rare accessories"],
    emoji: "🦄",
  },
  {
    name: "Legendary Pet",
    price: "0.5 ETH",
    rarity: "Legendary",
    color: "bg-purple-100 border-purple-300",
    features: ["Maximum stats", "Unique animations", "All interactions", "Exclusive traits", "Breeding rights"],
    emoji: "🐉",
  },
]

export default function MintPage() {
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [selectedTier, setSelectedTier] = useState<MintTier | null>(null)
  const [petName, setPetName] = useState("")
  const [isMinting, setIsMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)

  const handleConnect = (address: string) => {
    setConnected(true)
    setWalletAddress(address)
  }

  const handleMint = async () => {
    if (!selectedTier || !petName.trim()) return

    setIsMinting(true)

    // Simulate minting process
    setTimeout(() => {
      setIsMinting(false)
      setMintSuccess(true)
    }, 3000)
  }

  if (mintSuccess) {
    return (
      <Card className="overflow-hidden border-2 border-purple-300 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-400 p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <CardTitle className="text-white text-2xl">Mint Successful!</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">{selectedTier?.emoji}</div>
          <h3 className="text-xl font-bold mb-2">{petName}</h3>
          <Badge className="mb-4">{selectedTier?.rarity}</Badge>
          <p className="text-gray-600 mb-6">Your new CryptoPet has been minted successfully!</p>
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
              <Heart className="h-4 w-4 mr-2" />
              Meet Your Pet
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-2 border-purple-300 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-violet-400 to-fuchsia-400 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle className="text-white text-xl font-pixel">Mint CryptoPet</CardTitle>
          </div>
          <WalletConnect onConnect={handleConnect} connected={connected} address={walletAddress} />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!connected ? (
          <div className="text-center py-8">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-400" />
            <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600">Connect your wallet to mint your very own CryptoPet NFT</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pet Name Input */}
            <div className="space-y-2">
              <Label htmlFor="petName" className="text-sm font-medium">
                Choose Your Pet's Name
              </Label>
              <Input
                id="petName"
                placeholder="Enter a unique name..."
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                maxLength={20}
                className="text-center text-lg font-bold"
              />
              <p className="text-xs text-gray-500 text-center">{petName.length}/20 characters</p>
            </div>

            {/* Mint Tiers */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-center">Choose Your Pet Tier</h3>
              {mintTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTier?.name === tier.name ? "border-purple-500 bg-purple-50" : tier.color
                  }`}
                  onClick={() => setSelectedTier(tier)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{tier.emoji}</span>
                      <div>
                        <h4 className="font-bold">{tier.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {tier.rarity}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{tier.price}</div>
                      <div className="text-xs text-gray-500">~$150 USD</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <ul className="list-disc list-inside space-y-1">
                      {tier.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Mint Button */}
            {selectedTier && petName.trim() && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Pet Name:</span>
                    <span className="font-bold">{petName}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Tier:</span>
                    <span className="font-bold">{selectedTier.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Price:</span>
                    <span className="font-bold">{selectedTier.price}</span>
                  </div>
                </div>

                <Button
                  onClick={handleMint}
                  disabled={isMinting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isMinting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Minting...
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      Mint CryptoPet
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 p-4 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center">
          <Star className="h-3 w-3 mr-1" />
          Limited Edition NFTs - Own a unique digital companion
        </div>
      </CardFooter>
    </Card>
  )
}
