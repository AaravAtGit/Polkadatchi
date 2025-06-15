"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
  imageUri?: string
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
            const uri = await contract.tokenURI(id);
            return {
              id: id.toString(),
              name: petStats.name,
              happiness: petStats.happiness.toNumber(),
              hunger: petStats.hunger.toNumber(),
              birthdate: new Date(petStats.birthTime.toNumber() * 1000).toLocaleDateString(),
              lastInteraction: new Date(petStats.lastUpdate.toNumber() * 1000).toLocaleString(),
              level: 1,
              hasNFT: true,
              imageUri: uri
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
    <Card className="overflow-hidden border-2 border-white/20 shadow-xl bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 border-b border-white/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-xl font-pixel flex items-center">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mr-2"
            >
              🎮
            </motion.div>
            Polkadatchi
          </CardTitle>
          <WalletConnect />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <PetDisplay 
          hasNFT={selectedPet.hasNFT} 
          happiness={selectedPet.happiness}
          imageUri={selectedPet.imageUri}
        />

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
                  <motion.div 
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-400" />
                      <span className="text-sm font-medium text-white">Happiness</span>
                    </div>
                    <div className="flex items-center">
                      <Progress value={selectedPet.happiness} className="h-2 w-24 mr-2" />
                      <span className="text-sm font-medium text-white/90">{selectedPet.happiness}%</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex items-center">
                      <UtensilsCrossed className="h-5 w-5 mr-2 text-orange-400" />
                      <span className="text-sm font-medium text-white">Hunger</span>
                    </div>
                    <div className="flex items-center">
                      <Progress value={selectedPet.hunger} className="h-2 w-24 mr-2" />
                      <span className="text-sm font-medium text-white/90">{selectedPet.hunger}%</span>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <motion.div 
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        <div>
                          <div className="text-xs text-white/70">Level</div>
                          <div className="text-sm font-bold text-white">{selectedPet.level}</div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="text-xs text-white/70">Born</div>
                          <div className="text-sm font-bold text-white">{selectedPet.birthdate}</div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="col-span-2 p-3 rounded-lg bg-white/5 border border-white/10"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-purple-400" />
                        <div>
                          <div className="text-xs text-white/70">Last interaction</div>
                          <div className="text-sm font-bold text-white">{selectedPet.lastInteraction}</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={feedPet}
                      className="w-full h-16 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 border-2 border-white/10 shadow-lg"
                      disabled={loading}
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center"
                      >
                        <UtensilsCrossed className="h-6 w-6 mr-2" />
                        <span className="text-lg">Feed</span>
                      </motion.div>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={playWithPet}
                      className="w-full h-16 bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 border-2 border-white/10 shadow-lg"
                      disabled={loading}
                    >
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center"
                      >
                        <Heart className="h-6 w-6 mr-2" />
                        <span className="text-lg">Play</span>
                      </motion.div>
                    </Button>
                  </motion.div>
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

      <CardFooter className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 text-center text-xs text-white/70 border-t border-white/10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Polkadatchi v1.0 - Your pet lives on the blockchain ✨
        </motion.div>
      </CardFooter>
    </Card>
  )
}
