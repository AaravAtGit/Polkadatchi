import PetGame from "@/components/pet-game"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-purple-500 to-pink-500">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <Link href="/mint">
            <Button className="bg-white text-purple-700 hover:bg-purple-50">
              <Plus className="h-4 w-4 mr-2" />
              Mint New Pet
            </Button>
          </Link>
        </div>
        <PetGame />
      </div>
    </main>
  )
}
