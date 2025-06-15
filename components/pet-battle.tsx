"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useContract } from "@/hooks/use-contract"
import { PetStats } from "@/components/pet-game"

interface Move {
  name: string;
  description: string;
  type: 'Fire' | 'Water' | 'Grass';
  animation: string;
}

interface BattlePet extends PetStats {
  hp: number;
  attack: number;
  speed: number;
  moves: Move[];
}

interface PetBattleProps {
  playerPet: PetStats;
}

const TYPE_MOVES: Record<number, Move[]> = {
  0: [ // Fire
    { name: "Flame Burst", description: "A powerful burst of flames", type: "Fire", animation: "explosion" },
    { name: "Heat Wave", description: "A wave of scorching heat", type: "Fire", animation: "wave" },
    { name: "Ember Strike", description: "A quick strike of burning embers", type: "Fire", animation: "particles" },
    { name: "Inferno Spin", description: "A spinning vortex of fire", type: "Fire", animation: "rotate" }
  ],
  1: [ // Water
    { name: "Aqua Jet", description: "A high-speed water projectile", type: "Water", animation: "projectile" },
    { name: "Tidal Wave", description: "A massive wave of water", type: "Water", animation: "wave" },
    { name: "Bubble Blast", description: "A stream of explosive bubbles", type: "Water", animation: "particles" },
    { name: "Whirlpool", description: "A swirling vortex of water", type: "Water", animation: "rotate" }
  ],
  2: [ // Grass
    { name: "Vine Whip", description: "Sharp vines that slash the opponent", type: "Grass", animation: "slash" },
    { name: "Leaf Storm", description: "A storm of sharp leaves", type: "Grass", animation: "particles" },
    { name: "Solar Beam", description: "A concentrated beam of solar energy", type: "Grass", animation: "beam" },
    { name: "Petal Dance", description: "A whirlwind of flower petals", type: "Grass", animation: "rotate" }
  ]
};

export default function PetBattle({ playerPet }: PetBattleProps) {
  const { contract } = useContract();
  const [opponentId, setOpponentId] = useState("");
  const [battleStarted, setBattleStarted] = useState(false);
  const [playerBattlePet, setPlayerBattlePet] = useState<BattlePet | null>(null);
  const [opponentBattlePet, setOpponentBattlePet] = useState<BattlePet | null>(null);
  const [currentTurn, setCurrentTurn] = useState<"player" | "opponent">("player");
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [animation, setAnimation] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset battle state when dialog closes
  const handleReset = () => {
    setBattleStarted(false);
    setPlayerBattlePet(null);
    setOpponentBattlePet(null);
    setCurrentTurn("player");
    setBattleLog([]);
    setAnimation("");
    setGameOver(false);
    setError(null);
    setOpponentId("");
  };

  const initializeBattlePet = (pet: PetStats): BattlePet => {
    return {
      ...pet,
      hp: 50,
      attack: 20,
      speed: Math.floor(Math.random() * 10) + 1, // Random speed between 1-10
      moves: TYPE_MOVES[pet.petType]
    };
  };

  const startBattle = async () => {
    if (!contract || !opponentId) {
      setError("Please enter a valid opponent ID");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch opponent pet data
      const opponentPetStats = await contract.getPetStatsView(opponentId);
      const opponentPetType = await contract.getPetType(opponentId);

      const opponentPet: PetStats = {
        id: opponentId,
        name: opponentPetStats.name,
        happiness: opponentPetStats.happiness.toNumber(),
        hunger: opponentPetStats.hunger.toNumber(),
        birthdate: new Date(opponentPetStats.birthTime.toNumber() * 1000).toLocaleDateString(),
        lastInteraction: new Date(opponentPetStats.lastUpdate.toNumber() * 1000).toLocaleString(),
        level: opponentPetStats.level.toNumber(),
        hasNFT: true,
        imageUri: "",
        petType: opponentPetType,
        xp: opponentPetStats.xp.toNumber()
      };

      const player = initializeBattlePet(playerPet);
      const opponent = initializeBattlePet(opponentPet);

      setPlayerBattlePet(player);
      setOpponentBattlePet(opponent);
      setBattleStarted(true);
      setCurrentTurn(player.speed >= opponent.speed ? "player" : "opponent");
      setBattleLog([`Battle started! ${player.name} vs ${opponent.name}`]);
    } catch (err) {
      setError("Failed to fetch opponent pet. Please check the ID and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const executeMove = async (move: Move) => {
    if (!playerBattlePet || !opponentBattlePet || gameOver) return;

    // Set animation
    setAnimation(move.animation);

    // Player's turn
    if (currentTurn === "player") {
      const newOpponentHp = Math.max(0, opponentBattlePet.hp - playerBattlePet.attack);
      setOpponentBattlePet({ ...opponentBattlePet, hp: newOpponentHp });
      setBattleLog(prev => [...prev, `${playerBattlePet.name} used ${move.name}!`]);

      if (newOpponentHp === 0) {
        setBattleLog(prev => [...prev, `${opponentBattlePet.name} fainted! ${playerBattlePet.name} wins!`]);
        setGameOver(true);
        return;
      }

      setCurrentTurn("opponent");
      
      // Opponent's turn (after a delay)
      setTimeout(() => {
        if (!playerBattlePet || !opponentBattlePet) return;
        
        const opponentMove = opponentBattlePet.moves[Math.floor(Math.random() * 4)];
        setAnimation(opponentMove.animation);
        
        const newPlayerHp = Math.max(0, playerBattlePet.hp - opponentBattlePet.attack);
        setPlayerBattlePet({ ...playerBattlePet, hp: newPlayerHp });
        setBattleLog(prev => [...prev, `${opponentBattlePet.name} used ${opponentMove.name}!`]);

        if (newPlayerHp === 0) {
          setBattleLog(prev => [...prev, `${playerBattlePet.name} fainted! ${opponentBattlePet.name} wins!`]);
          setGameOver(true);
          return;
        }

        setCurrentTurn("player");
      }, 2000);
    }
  };

  const renderAnimation = (animationType: string, isPlayer: boolean) => {
    const baseClassName = "absolute z-10 pointer-events-none";
    const positionClassName = isPlayer ? "right-0" : "left-0";

    return (
      <AnimatePresence>
        {animation === animationType && (
          <motion.div
            className={`${baseClassName} ${positionClassName}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: isPlayer ? [-100, 0] : [100, 0],
              rotate: animationType === "rotate" ? 360 : 0
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-16 w-16 bg-yellow-500/50 rounded-full blur-md" />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <Dialog onOpenChange={(open) => !open && handleReset()}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-red-500 hover:bg-red-600 text-white">
          Battle Arena
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Pet Battle Arena</DialogTitle>
        </DialogHeader>
        
        {!battleStarted ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter opponent's pet ID"
                value={opponentId}
                onChange={(e) => setOpponentId(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={startBattle} disabled={!opponentId || isLoading}>
                {isLoading ? "Loading..." : "Start Battle"}
              </Button>
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-2 gap-8">
              {/* Player Pet */}
              <Card className="p-4">
                <h3 className="font-bold mb-2">{playerBattlePet?.name}</h3>
                <Progress value={(playerBattlePet?.hp || 0) * 2} className="mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  {playerBattlePet?.moves.map((move, index) => (
                    <Button
                      key={index}
                      onClick={() => executeMove(move)}
                      disabled={currentTurn !== "player" || gameOver}
                      className="relative overflow-hidden"
                    >
                      {move.name}
                      <span className="text-xs block opacity-75">{move.type}</span>
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Opponent Pet */}
              <Card className="p-4">
                <h3 className="font-bold mb-2">{opponentBattlePet?.name}</h3>
                <Progress value={(opponentBattlePet?.hp || 0) * 2} className="mb-4" />
              </Card>
            </div>

            {/* Battle Log */}
            <Card className="mt-4 p-4 max-h-32 overflow-y-auto">
              {battleLog.map((log, index) => (
                <p key={index} className="text-sm">{log}</p>
              ))}
            </Card>

            {/* Animations */}
            {renderAnimation(animation, currentTurn === "player")}

            {/* Game Over Actions */}
            {gameOver && (
              <div className="mt-4 flex justify-center">
                <Button onClick={handleReset}>New Battle</Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
