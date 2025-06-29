import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useWeb3 } from '../components/providers/web3-provider';
import contractABI from '../abi.json';
import { sepoliaChain } from '../lib/wallet';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x282f335096474C32211544Ee21CC49e52CA4F3F4';
const FALLBACK_RPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || sepoliaChain.rpcUrls[0];

export function useContract() {
  const { provider: web3Provider, signer, isConnected } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [readContract, setReadContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    let mounted = true;

    const initContract = async () => {
      // Use web3Provider if available, otherwise use fallback RPC
      const provider = web3Provider || new ethers.providers.JsonRpcProvider(FALLBACK_RPC);
      
      try {
        // Initialize read-only contract with provider
        const readOnlyContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        
        // Initialize write contract with signer if connected
        let writeContract = null;
        if (isConnected && signer) {
          writeContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        }

        if (mounted) {
          setReadContract(readOnlyContract);
          setContract(writeContract);
        }
      } catch (error) {
        console.error("Error initializing contract:", error);
        if (mounted) {
          setReadContract(null);
          setContract(null);
        }
      }
    };

    initContract();

    return () => {
      mounted = false;
    };
  }, [web3Provider, signer, isConnected]);

  const getPetsByOwner = async (address: string) => {
    if (!readContract) throw new Error('Contract not initialized');
    try {
      const pets = await readContract.getPetsByOwner(address);
      // Filter out any empty or invalid pets
      return pets.filter((id: ethers.BigNumber) => !id.isZero());
    } catch (error: any) {
      console.error('Error getting pets:', error);
      // Check if it's a network error
      if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error: Please make sure you are connected to Sepolia network');
      }
      // Check if contract doesn't exist
      if (error.code === 'CALL_EXCEPTION') {
        throw new Error('Contract error: Please make sure you are on the Sepolia network');
      }
      throw error;
    }
  };

  const getTokenURI = async (tokenId: number) => {
    if (!readContract) throw new Error('Contract not initialized');
    try {
      const uri = await readContract.tokenURI(tokenId);
      return uri;
    } catch (error) {
      console.error('Error getting token URI:', error);
      throw error;
    }
  };

  const mintPet = async (name: string) => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      // Get the mint price from contract using read contract
      const mintPrice = await readContract?.MINT_PRICE();
      
      // Call the mint function with the correct value using write contract
      const tx = await contract.mintPet(name, {
        value: mintPrice
      });
      
      // Wait for transaction to be mined
      await tx.wait();
      
      return tx;
    } catch (error) {
      console.error('Error minting pet:', error);
      throw error;
    }
  };

  return {
    contract: readContract, // Use read contract as default for view functions
    writeContract: contract, // Use this for state-modifying functions
    getPetsByOwner,
    mintPet,
    getTokenURI
  };
}
