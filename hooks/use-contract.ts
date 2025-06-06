import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useWeb3 } from '../components/providers/web3-provider';
import contractABI from '../abi.json';

const CONTRACT_ADDRESS = '0x802988D2A33F3e53bc1485e4C9555528499D66D1';

export function useContract() {
  const { provider, signer, isConnected } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [readContract, setReadContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    let mounted = true;

    const initContract = async () => {
      if (!provider) return;

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
  }, [provider, signer, isConnected]);

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
        throw new Error('Network error: Please make sure you are connected to Westend network');
      }
      // Check if contract doesn't exist
      if (error.code === 'CALL_EXCEPTION') {
        throw new Error('Contract error: Please make sure you are on the correct network');
      }
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
    mintPet
  };
}
