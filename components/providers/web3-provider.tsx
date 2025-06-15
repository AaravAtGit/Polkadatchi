'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { connectMetaMask, isWalletConnected, sepoliaChain } from '../../lib/wallet';

// Define the shape of the Web3 context
interface Web3ContextType {
  address: string | null;
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
}

// Define the shape of the Web3 state
interface Web3State {
  address: string | null;
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
}

// Create the Web3 context with default values
const Web3Context = createContext<Web3ContextType>({
  address: null,
  provider: null,
  signer: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: async () => {},
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Web3State>({
    address: null,
    provider: null,
    signer: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Initialize fallback provider for read-only operations
  useEffect(() => {
    const initFallbackProvider = () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(sepoliaChain.rpcUrls[0]);
        setState(prev => ({
          ...prev,
          provider: prev.provider || provider
        }));
      } catch (error) {
        console.error('Error initializing fallback provider:', error);
      }
    };

    if (!state.provider) {
      initFallbackProvider();
    }
  }, [state.provider]);

  // Check wallet connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await isWalletConnected();
        if (connected) {
          const wallet = await connectMetaMask();
          setState(prev => ({
            ...prev,
            address: wallet.address,
            provider: wallet.provider,
            signer: wallet.signer,
            isConnected: true,
          }));
        }
      } catch (error) {
        console.error('Connection check error:', error);
      }
    };

    checkConnection();
  }, []);

  // Connect to the wallet
  const connect = async () => {
    if (state.isConnecting) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const wallet = await connectMetaMask();
      setState({
        address: wallet.address,
        provider: wallet.provider,
        signer: wallet.signer,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Connection error:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: new Error(error?.message || 'Failed to connect to Sepolia network'),
      }));
    }
  };

  return (
    <Web3Context.Provider value={{ ...state, connect }}>
      {children}
    </Web3Context.Provider>
  );
}

// Custom hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context);