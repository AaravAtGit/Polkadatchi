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

    // Add Westend network if not already added
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [westendChain],
      });
    } catch (addError) {
      console.log('Network might already be added');
    }

    // Switch to Westend network
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: westendChain.chainId }],
      });
    } catch (switchError) {
      console.error('Error switching network:', switchError);
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
