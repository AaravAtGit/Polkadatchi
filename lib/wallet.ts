// lib/wallet.ts
import { ethers } from 'ethers';

export const sepoliaChain = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/860d2e1cb0e0456f8e63301e343d6517'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
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
    
    // Only switch network if we're not already on Sepolia
    if (chainId !== sepoliaChain.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: sepoliaChain.chainId }],
        });
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [sepoliaChain],
            });
          } catch (addError) {
            throw new Error('Failed to add Sepolia network to MetaMask');
          }
        } else {
          throw new Error('Failed to switch to Sepolia network');
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
