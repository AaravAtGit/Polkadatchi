'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { connectMetaMask, isWalletConnected } from '../../lib/wallet';

interface Web3ContextType {
  address: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
}

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
  const [state, setState] = useState({
    address: null,
    provider: null,
    signer: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await isWalletConnected();
      if (connected) {
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
        } catch (error) {
          setState(prev => ({
            ...prev,
            error: error as Error,
            isConnecting: false,
          }));
        }
      }
    };
    checkConnection();
  }, []);

  const connect = async () => {
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
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isConnecting: false,
      }));
    }
  };

  return (
    <Web3Context.Provider value={{ ...state, connect }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => useContext(Web3Context);