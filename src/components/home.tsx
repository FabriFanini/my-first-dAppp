// src/components/Home.tsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { connectWallet, getContract } from '../ethereum';

const Home: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [availableTokens, setAvailableTokens] = useState<string>('0');
  const [purchaseAmount, setPurchaseAmount] = useState<string>(''); // cantidad en tokens (string legible)
  const [price, setPrice] = useState<string>('0'); // precio por token en ETH (como string)
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Conectar la wallet y obtener información inicial
  const handleConnectWallet = async () => {
    const provider = await connectWallet();
    if (provider) {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setWalletConnected(true);
      fetchAvailableTokens();
      fetchTokenPrice();
    }
  };

  // Consulta la cantidad de tokens disponibles (pre-minted en el contrato)
  const fetchAvailableTokens = async () => {
    const contract = await getContract();
    if (contract) {
      try {
        const avail = await contract.getAvailablesTokens();
        // Convertir de la unidad mínima (18 decimales) a un valor legible
        setAvailableTokens(ethers.formatUnits(avail, 18));
      } catch (error) {
        console.error('Error al obtener tokens disponibles:', error);
      }
    }
  };

  // Consulta el precio actual del token
  const fetchTokenPrice = async () => {
    const contract = await getContract();
    if (contract) {
      try {
        // Se asume que tu contrato tiene una función 'price' que retorna el precio (uint256)
        const p = await contract.price();
        // Formatea el precio a ETH (ya que priceF20 se define en ether)
        setPrice(ethers.formatUnits(p, 'ether'));
      } catch (error) {
        console.error('Error al obtener el precio:', error);
      }
    }
  };

  // Función para comprar tokens
  const handleBuyTokens = async () => {
    if (!purchaseAmount || Number(purchaseAmount) <= 0) return;
    setLoading(true);
    setMessage('');
    try {
      const contract = await getContract();
      if (contract) {
        // Convierte la cantidad ingresada a unidades mínimas (18 decimales)
        const tokensToBuy = ethers.parseUnits(purchaseAmount, 18);
        // Obtiene el precio actual en BigInt (Ethers v6 usa BigInt para estos valores)
        const pricePerToken = await contract.price();
        // Calcula el costo total en wei
        const totalPrice = tokensToBuy * pricePerToken;
        // Llama a la función de compra enviando el Ether correspondiente
        const tx = await contract.buyF20(tokensToBuy, { value: totalPrice });
        await tx.wait();
        setMessage('Compra exitosa');
        fetchAvailableTokens();
      }
    } catch (error) {
      console.error('Error al comprar tokens:', error);
      setMessage('Error al comprar tokens');
    } finally {
      setLoading(false);
    }
  };

  // Cuando la wallet esté conectada, se consulta la información
  useEffect(() => {
    if (walletConnected) {
      fetchAvailableTokens();
      fetchTokenPrice();
    }
  }, [walletConnected]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mi dApp de Tokens</h1>
      {!walletConnected ? (
        <button onClick={handleConnectWallet}>Conectar Wallet</button>
      ) : (
        <div>
          <p>Wallet conectada: {walletAddress}</p>
          <p>Tokens disponibles: {availableTokens}</p>
          <p>Precio por token: {price} ETH</p>
          <div>
            <input
              type="number"
              placeholder="Cantidad a comprar"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
            />
            <button onClick={handleBuyTokens} disabled={loading}>
              {loading ? 'Procesando...' : 'Comprar Tokens'}
            </button>
          </div>
          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  );
};

export default Home;
