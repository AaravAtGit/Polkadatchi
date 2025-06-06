// lib/wallet.ts
import { ethers } from 'ethers';

export const westendChain = {
  chainId: '0x190f1b45', // 420420421 in hex
  chainName: 'Westend',
  nativeCurrency: {
    name: 'Westend',
    symbol: 'WND',
    decimals: 18,
  },
  rpcUrls: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
  blockExplorerUrls: ['https://blockscout-asset-hub.parity-chains-scw.parity.io'],
};

export const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Check current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Only switch network if we're not already on Westend
    if (chainId !== westendChain.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: westendChain.chainId }],
        });
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [westendChain],
            });
          } catch (addError) {
            throw new Error('Failed to add Westend network to MetaMask');
          }
        } else {
          throw new Error('Failed to switch to Westend network');
        }
      }
    }

    // Create ethers provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    return {
      address: accounts[0],
      provider,
      signer,
    };
  } catch (error) {
    throw new Error('Failed to connect to MetaMask');
  }
};

export const isWalletConnected = async () => {
  if (!window.ethereum) return false;
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  } catch (error) {
    return false;
  }
};
