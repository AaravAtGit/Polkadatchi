"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, Coins, Heart, Star, Loader2 } from "lucide-react"
import Link from "next/link"
import WalletConnect from "@/components/wallet-connect"
import { useContract } from "@/hooks/use-contract"
import { useWeb3 } from "@/components/providers/web3-provider"
import { ethers } from "ethers"

interface Pet {
  tokenId: string;
  name: string;
  happiness: number;
  hunger: number;
}

export default function MintPage() {
  const { address, isConnected } = useWeb3()
  const { getPetsByOwner, mintPet, contract } = useContract()
  const [isLoading, setIsLoading] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [petName, setPetName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (isConnected && address && contract) {
      fetchPets()
    }
  }, [isConnected, address, contract])

  const fetchPets = async () => {
    if (!address || !contract) return
    try {
      setIsLoading(true)
      const petIds = await getPetsByOwner(address)
      
      if (petIds && petIds.length > 0) {
        const petPromises = petIds.map(async (id: ethers.BigNumber) => {
          const petStats = await contract.getPetStatsView(id)
          return {
            tokenId: id.toString(),
            name: petStats.name,
            happiness: petStats.happiness.toNumber(),
            hunger: petStats.hunger.toNumber()
          }
        })
        const petDetails = await Promise.all(petPromises)
        setPets(petDetails)
      } else {
        setPets([])
      }
    } catch (err) {
      console.error("Error fetching pets:", err)
      setError("Failed to fetch your pets")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMint = async () => {
    if (!petName) {
      setError("Please enter a name for your pet")
      return
    }
    
    try {
      setIsLoading(true)
      setError("")
      await mintPet(petName)
      await fetchPets() // Refresh pets list
      setPetName("") // Reset input
    } catch (err) {
      console.error("Error minting pet:", err)
      setError("Failed to mint pet. Make sure you have enough funds and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <WalletConnect />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mint Your Virtual Pet</CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground mb-4">Connect your wallet to mint and view your pets</p>
            </div>
          ) : (
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {pets.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Your Pets</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {pets.map((pet) => (
                          <Card key={pet.tokenId} className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{pet.name}</h4>
                                <Badge>#{pet.tokenId}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Heart className="mr-1 h-4 w-4" /> {pet.happiness}
                                </span>
                                <span className="flex items-center">
                                  <Coins className="mr-1 h-4 w-4" /> {pet.hunger}
                                </span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-semibold">Mint New Pet</h3>
                    <div className="space-y-2">
                      <Label htmlFor="petName">Pet Name</Label>
                      <Input
                        id="petName"
                        placeholder="Enter a name for your pet"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}
                    <Button
                      onClick={handleMint}
                      disabled={isLoading || !petName}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Minting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Mint Pet
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
