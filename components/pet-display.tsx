"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Sparkle } from "lucide-react"

interface PetDisplayProps {
  hasNFT: boolean
  happiness: number
  imageUri?: string
  petType?: number
}

const PET_IMAGES = {
  FIRE: "https://indigo-immense-barnacle-223.mypinata.cloud/ipfs/bafybeifyqolo6ybaq7qy4hliyldzon77uvtaujbroynpjvcntgfojn53zm",
  WATER: "https://indigo-immense-barnacle-223.mypinata.cloud/ipfs/bafkreie6kxam54tzfquax3p2jotx7qwtolqtgbewznth4fdt4kf4dkt3he",
  GRASS: "https://indigo-immense-barnacle-223.mypinata.cloud/ipfs/bafybeidobitqnzxgj7czbg72ep2kwq2tjqvyzrggzbpe575eevsryfahk4"
}

export default function PetDisplay({ hasNFT, happiness, imageUri, petType = 0 }: PetDisplayProps) {
  const [bounce, setBounce] = useState(false)

  // Get the correct IPFS image based on pet type
  const getIPFSImage = () => {
    switch (petType) {
      case 0:
        return PET_IMAGES.FIRE
      case 1:
        return PET_IMAGES.WATER
      case 2:
        return PET_IMAGES.GRASS
      default:
        return PET_IMAGES.FIRE
    }
  }

  // Trigger animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBounce(true)
      setTimeout(() => setBounce(false), 1000)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-64 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
      {/* Background particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ opacity: 0 }}
          animate={{
            x: [Math.random() * 400, Math.random() * 400],
            y: [Math.random() * 400, Math.random() * 400],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Sparkle className="text-white/20 h-3 w-3" />
        </motion.div>
      ))}

      {/* Pet container */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        {hasNFT ? (
          <motion.div
            animate={{
              y: bounce ? -20 : 0,
              scale: bounce ? 1.1 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 10,
            }}
            className="relative"
          >
            <div className="relative z-10 w-48 h-48 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm p-2 border-2 border-white/20">
              <Image
                src={getIPFSImage()}
                alt="Pet NFT"
                width={192}
                height={192}
                className="w-full h-full object-cover rounded-lg transform hover:scale-110 transition-transform duration-300"
                unoptimized
              />
              
              {/* Happiness indicator */}
              <motion.div
                className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-bold text-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {happiness}% ❤️
              </motion.div>

              {/* Type badge */}
              <motion.div
                className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-bold text-white"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {petType === 0 ? '🔥' : petType === 1 ? '💧' : '🌿'}
              </motion.div>
            </div>
            
            {/* Shadow */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black/20 rounded-full blur-sm" />
          </motion.div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg w-32 h-32 flex items-center justify-center border-2 border-white/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-6xl"
            >
              🎮
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
