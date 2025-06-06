import { useEffect, useState } from 'react';
import { connectMetaMask, isWalletConnected } from '../lib/wallet';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
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

  return {
    ...state,
    connect,
  };
}