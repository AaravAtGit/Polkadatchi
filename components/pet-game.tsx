"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useWeb3 } from "@/components/providers/web3-provider"
import { useContract } from "@/hooks/use-contract"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, UtensilsCrossed, Calendar, Clock, Trophy } from "lucide-react"
import WalletConnect from "@/components/wallet-connect"
import PetDisplay from "@/components/pet-display"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PetStats {
  id: string
  name: string
  happiness: number
  hunger: number
  birthdate: string
  lastInteraction: string
  level: number
  hasNFT: boolean
}

export default function PetGame() {
  const { address, isConnected } = useWeb3();
  const { getPetsByOwner, contract, writeContract } = useContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [allPets, setAllPets] = useState<PetStats[]>([]);

  // Get the currently selected pet's stats
  const selectedPet = allPets.find(pet => pet.id === selectedPetId) || {
    id: "",
    name: "",
    happiness: 0,
    hunger: 0,
    birthdate: "",
    lastInteraction: "",
    level: 0,
    hasNFT: false,
  };

  const fetchPets = async () => {
    if (!isConnected || !address || !contract) return;
    
    try {
      setLoading(true);
      setError(null);
      const petIds = await getPetsByOwner(address);
      
      if (petIds && petIds.length > 0) {
        const petsData = await Promise.all(
          petIds.map(async (id: any) => {
            const petStats = await contract.getPetStatsView(id);
            return {
              id: id.toString(),
              name: petStats.name,
              happiness: petStats.happiness.toNumber(),
              hunger: petStats.hunger.toNumber(),
              birthdate: new Date(petStats.birthTime.toNumber() * 1000).toLocaleDateString(),
              lastInteraction: new Date(petStats.lastUpdate.toNumber() * 1000).toLocaleString(),
              level: 1,
              hasNFT: true,
            };
          })
        );
        
        setAllPets(petsData);
        // Set the first pet as selected if none is selected
        if (!selectedPetId && petsData.length > 0) {
          setSelectedPetId(petsData[0].id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching pets:', err);
      setError(err.message || 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && contract && !selectedPetId) {
      fetchPets();
    }
  }, [isConnected, address, contract]);

  // Pet interaction functions
  const feedPet = async () => {
    if (!writeContract || !selectedPetId) return;
    try {
      setLoading(true);
      const tx = await writeContract.feedPet(selectedPetId);
      await tx.wait();
      await fetchPets();
    } catch (err: any) {
      console.error('Error feeding pet:', err);
      setError(err.message || 'Failed to feed pet');
    } finally {
      setLoading(false);
    }
  }

  const playWithPet = async () => {
    if (!writeContract || !selectedPetId) return;
    try {
      setLoading(true);
      const tx = await writeContract.playWithPet(selectedPetId);
      await tx.wait();
      await fetchPets();
    } catch (err: any) {
      console.error('Error playing with pet:', err);
      setError(err.message || 'Failed to play with pet');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden border-2 border-purple-300 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-violet-400 to-fuchsia-400 p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-xl font-pixel">Polkadatchi</CardTitle>
          <WalletConnect />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <PetDisplay hasNFT={selectedPet.hasNFT} happiness={selectedPet.happiness} />

        {isConnected ? (
          <div className="p-4">
            <div className="mb-4">
              {allPets.length > 1 && (
                <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                  <SelectTrigger className="mb-4">
                    <SelectValue placeholder="Select your pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-800">{selectedPet.name}</h2>
                {selectedPet.hasNFT && (
                  <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full mt-1">
                    NFT Verified ✓
                  </span>
                )}
              </div>
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
                    <span className="text-sm font-medium">{selectedPet.happiness}%</span>
                  </div>
                  <Progress value={selectedPet.happiness} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UtensilsCrossed className="h-4 w-4 mr-2 text-orange-500" />
                      <span className="text-sm font-medium">Hunger</span>
                    </div>
                    <span className="text-sm font-medium">{selectedPet.hunger}%</span>
                  </div>
                  <Progress value={selectedPet.hunger} className="h-2" />

                  <div className="flex items-center justify-between text-sm mt-4">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>Level {selectedPet.level}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Born: {selectedPet.birthdate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Last interaction: {selectedPet.lastInteraction}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={feedPet}
                    className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500"
                    disabled={loading}
                  >
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Feed
                  </Button>

                  <Button
                    onClick={playWithPet}
                    className="bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500"
                    disabled={loading}
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
            {loading ? (
              <p>Loading your pets...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p className="text-gray-500 mb-4">Connect your wallet to see your Polkadatchi</p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 p-4 text-center text-xs text-gray-500">
        Polkadatchi v1.0 - Your pet lives on the blockchain
      </CardFooter>
    </Card>
  )
}
