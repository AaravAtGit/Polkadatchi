"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface PetDisplayProps {
  hasNFT: boolean
  happiness: number
}

export default function PetDisplay({ hasNFT, happiness }: PetDisplayProps) {
  const [bounce, setBounce] = useState(false)

  // Trigger animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBounce(true)
      setTimeout(() => setBounce(false), 1000)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Determine pet mood based on happiness
  const getMoodEmoji = () => {
    if (happiness > 80) return "😄"
    if (happiness > 50) return "🙂"
    if (happiness > 30) return "😐"
    return "😢"
  }

  return (
    <div className="relative h-64 bg-gradient-to-b from-sky-300 to-sky-100 overflow-hidden">
      {/* Background elements */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-green-400 to-transparent" />
      <div className="absolute top-4 left-4 text-4xl">☁️</div>
      <div className="absolute top-8 right-8 text-4xl">☁️</div>

      {/* Pet display */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        {hasNFT ? (
          <motion.div
            animate={{
              y: bounce ? -20 : 0,
              rotate: bounce ? [0, -5, 5, -5, 0] : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 10,
            }}
            className="relative"
          >
            <div className="relative z-10 text-8xl">{getMoodEmoji()}</div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/10 rounded-full blur-sm" />
          </motion.div>
        ) : (
          <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center">
            <Wallet className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  )
}

// Import Wallet icon from lucide-react
import { Wallet } from "lucide-react"
