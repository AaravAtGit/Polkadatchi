"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Sparkle } from "lucide-react"

interface PetDisplayProps {
  hasNFT: boolean
  happiness: number
  imageUri?: string
}

export default function PetDisplay({ hasNFT, happiness, imageUri }: PetDisplayProps) {
  const [bounce, setBounce] = useState(false)

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
            <div className="relative z-10 w-32 h-32 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm p-2 border-2 border-white/20">
              {imageUri ? (
                <Image
                  src={imageUri}
                  alt="Pet NFT"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🐾
                </div>
              )}
              
              {/* Happiness indicator */}
              <motion.div
                className="absolute bottom-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-bold"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {happiness}% ❤️
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
