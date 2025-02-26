// src/components/Home.tsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { connectWallet, getContract } from '../ethereum';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [availableTokens, setAvailableTokens] = useState<string>('0');
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Conecta la wallet y obtiene información inicial
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

  // Consulta la cantidad de tokens disponibles en el contrato
  const fetchAvailableTokens = async () => {
    const contract = await getContract();
    if (contract) {
      try {
        const avail = await contract.getAvailablesTokens();
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
        const p = await contract.price();
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
        const pricePerToken = await contract.price();
        // Ajusta el cálculo: totalPrice = (tokensToBuy * pricePerToken) / 10^18
        const totalPrice = (tokensToBuy * pricePerToken) / BigInt(10 ** 18);

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

  useEffect(() => {
    if (walletConnected) {
      fetchAvailableTokens();
      fetchTokenPrice();
    }
  }, [walletConnected]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>dApp de Tokens F20</h1>
      {!walletConnected ? (
        <button className={styles.primaryButton} onClick={handleConnectWallet}>
          Conectar Wallet
        </button>
      ) : (
        <>
          <div className={styles.walletInfo}>
            <p>Wallet conectada: {walletAddress}</p>
            <p>Tokens disponibles: {availableTokens}</p>
            <p>Precio por token: {price} ETH</p>
          </div>
          <div className={styles.purchaseSection}>
            <input
              type="number"
              placeholder="Cantidad a comprar"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              className={styles.inputNumber}
            />
            <button
              onClick={handleBuyTokens}
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Comprar Tokens'}
            </button>
          </div>
          {message && <p className={styles.message}>{message}</p>}
        </>
      )}
    </div>
  );
};

export default Home;
