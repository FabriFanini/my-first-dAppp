import { ethers } from 'ethers';
import F20Abi from './abi/F20Abi.json';

// Reemplaza con la dirección real de tu contrato en Sepolia
const contractAddress = '0x126630e0Bf6f76a26D5D228C285E708941E64d0b';

export async function connectWallet(): Promise<ethers.BrowserProvider | null> {
  if (!window.ethereum) {
    alert('Por favor, instala MetaMask');
    return null;
  }
  try {
    // Solicita a MetaMask que conecte la wallet
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    // En Ethers v6 se usa BrowserProvider en vez de providers.Web3Provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  } catch (error) {
    console.error('Error conectando a MetaMask:', error);
    return null;
  }
}

export async function getSigner(): Promise<ethers.Signer | null> {
  const provider = await connectWallet();
  if (!provider) return null;
  // En Ethers v6, getSigner() es asíncrono y se llama así:
  return await provider.getSigner();
}

export async function getContract(): Promise<ethers.Contract | null> {
  const signer = await getSigner();
  if (!signer) return null;
  // Creas la instancia del contrato
  return new ethers.Contract(contractAddress, F20Abi, signer);
}
