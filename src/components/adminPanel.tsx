// src/components/AdminPanel.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { getContract, connectWallet } from '../ethereum';
import { ethers } from 'ethers';
import styles from './adminPanel.module.css';
//import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [mintAmount, setMintAmount] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  //const navigate = useNavigate();

  // Conecta la wallet y verifica si es el owner
  const handleConnectWallet = useCallback(async () => {
    const provider = await connectWallet();
    if (provider) {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setWalletConnected(true);
      verifyOwner(address);
    }
  }, []);

  const verifyOwner = async (address: string) => {
    const contract = await getContract();
    if (contract) {
      try {
        const ownerAddress = await contract.owner();
        if (ownerAddress.toLowerCase() === address.toLowerCase()) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
          setMessage('Acceso denegado: no eres el owner del contrato');
          // Opcional: redirigir al home
          // navigate('/');
        }
      } catch (error) {
        console.error('Error verificando owner:', error);
      }
    }
  };

  // Función para mintear tokens
  const handleMintTokens = async () => {
    if (!mintAmount || Number(mintAmount) <= 0) return;
    setLoading(true);
    setMessage('');
    try {
      const contract = await getContract();
      if (contract) {
        // Convertir la cantidad a unidades mínimas (18 decimales)
        const tokensToMint = ethers.parseUnits(mintAmount, 18);
        const tx = await contract.mintF20(tokensToMint);
        await tx.wait();
        setMessage('Tokens minteados con éxito');
      }
    } catch (error) {
      console.error('Error al mintear tokens:', error);
      setMessage('Error al mintear tokens');
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar el precio del token
  const handleChangePrice = async () => {
    if (!newPrice || Number(newPrice) <= 0) return;
    setLoading(true);
    setMessage('');
    try {
      const contract = await getContract();
      if (contract) {
        // Convertir el precio a wei (usando ethers.parseUnits)
        const priceInWei = ethers.parseUnits(newPrice, 'ether');
        const tx = await contract.changePriceOfF20(priceInWei);
        await tx.wait();
        setMessage('Precio actualizado con éxito');
      }
    } catch (error) {
      console.error('Error al cambiar el precio:', error);
      setMessage('Error al cambiar el precio');
    } finally {
      setLoading(false);
    }
  };

  // Función para retirar fondos
  const handleWithdraw = async () => {
    setLoading(true);
    setMessage('');
    try {
      const contract = await getContract();
      if (contract) {
        const tx = await contract.withdraw();
        await tx.wait();
        setMessage('Fondos retirados con éxito');
      }
    } catch (error) {
      console.error('Error al retirar fondos:', error);
      setMessage('Error al retirar fondos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      handleConnectWallet();
    }
  }, [walletConnected, handleConnectWallet]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Panel de Administración</h1>
      {walletConnected ? (
        <>
          <div className={styles.walletInfo}>
            <p>Wallet conectada: {walletAddress}</p>
            {isOwner ? (
              <p>Acceso administrativo habilitado</p>
            ) : (
              <p style={{ color: 'red' }}>Acceso denegado: no eres el owner del contrato</p>
            )}
          </div>
          {isOwner && (
            <div className={styles.adminSection}>
              {/* Tarjeta 1: Mintear Tokens */}
              <div className={styles.section}>
                <h3>Mintear Tokens</h3>
                <input
                  type="number"
                  placeholder="Cantidad a mintear"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className={styles.inputField}
                />
                <button
                  onClick={handleMintTokens}
                  className={styles.primaryButton}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Mintear'}
                </button>
              </div>

              {/* Tarjeta 2: Cambiar Precio */}
              <div className={styles.section}>
                <h3>Cambiar Precio de Token</h3>
                <input
                  type="number"
                  placeholder="Nuevo precio (ETH)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className={styles.inputField}
                />
                <button
                  onClick={handleChangePrice}
                  className={styles.primaryButton}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Actualizar Precio'}
                </button>
              </div>

              {/* Tarjeta 3: Retirar Fondos */}
              <div className={styles.section}>
                <h3>Retirar Fondos</h3>
                <button
                  onClick={handleWithdraw}
                  className={styles.primaryButton}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Retirar'}
                </button>
              </div>
            </div>
          )}
          {message && <p className={styles.message}>{message}</p>}
        </>
      ) : (
        <p>Conectando wallet...</p>
      )}
    </div>
  );
};

export default AdminPanel;
