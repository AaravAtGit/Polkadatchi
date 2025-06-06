"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, UtensilsCrossed, Calendar, Clock, Trophy } from "lucide-react"
import WalletConnect from "@/components/wallet-connect"
import PetDisplay from "@/components/pet-display"

interface PetStats {
  name: string
  happiness: number
  hunger: number
  birthdate: string
  lastInteraction: string
  level: number
  hasNFT: boolean
}

export default function PetGame() {
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [petStats, setPetStats] = useState<PetStats>({
    name: "Pixel",
    happiness: 70,
    hunger: 40,
    birthdate: "2023-05-15",
    lastInteraction: "2023-06-05 14:30",
    level: 5,
    hasNFT: false,
  })

  // Simulate wallet connection
  const handleConnect = (address: string) => {
    setConnected(true)
    setWalletAddress(address)

    // Simulate NFT detection
    setTimeout(() => {
      setPetStats((prev) => ({
        ...prev,
        hasNFT: true,
        name: "CryptoPet #1337",
      }))
    }, 1000)
  }

  // Pet interaction functions
  const feedPet = () => {
    setPetStats((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 20),
      happiness: Math.min(100, prev.happiness + 5),
      lastInteraction: new Date().toLocaleString(),
    }))
  }

  const playWithPet = () => {
    setPetStats((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 20),
      hunger: Math.max(0, prev.hunger - 10),
      lastInteraction: new Date().toLocaleString(),
    }))
  }

  return (
    <Card className="overflow-hidden border-2 border-purple-300 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-violet-400 to-fuchsia-400 p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-xl font-pixel">CryptoPet</CardTitle>
          <WalletConnect onConnect={handleConnect} connected={connected} address={walletAddress} />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <PetDisplay hasNFT={petStats.hasNFT} happiness={petStats.happiness} />

        {connected ? (
          <div className="p-4">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold text-purple-800">{petStats.name}</h2>
              {petStats.hasNFT && (
                <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full mt-1">
                  NFT Verified ✓
                </span>
              )}
            </div>

            <Tabs defaultValue="actions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm font-medium">Happiness</span>
                    </div>
                    <span className="text-sm font-medium">{petStats.happiness}%</span>
                  </div>
                  <Progress value={petStats.happiness} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UtensilsCrossed className="h-4 w-4 mr-2 text-orange-500" />
                      <span className="text-sm font-medium">Hunger</span>
                    </div>
                    <span className="text-sm font-medium">{petStats.hunger}%</span>
                  </div>
                  <Progress value={petStats.hunger} className="h-2" />

                  <div className="flex items-center justify-between text-sm mt-4">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>Level {petStats.level}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Born: {petStats.birthdate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Last interaction: {petStats.lastInteraction}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={feedPet}
                    className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500"
                  >
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Feed
                  </Button>

                  <Button
                    onClick={playWithPet}
                    className="bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">Connect your wallet to see your CryptoPet</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 p-4 text-center text-xs text-gray-500">
        CryptoPet v1.0 - Your pet lives on the blockchain
      </CardFooter>
    </Card>
  )
}
