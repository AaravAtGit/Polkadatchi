"use client"

import PetGame from "@/components/pet-game"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Animated background elements */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random()
          }}
          animate={{
            y: [-10, 10],
            opacity: [0.1, 1],
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}
      
      <motion.div 
        className="w-full max-w-md space-y-4 relative z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/mint">
            <Button className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 hover:bg-white/20">
              <Plus className="h-4 w-4 mr-2" />
              Mint New Pet
            </Button>
          </Link>
        </motion.div>
        <PetGame />
      </motion.div>
    </main>
  )
}
