// src/App.tsx
import React, { useEffect, useState } from 'react';
import { getContract, connectWallet } from './ethereum';
import { ethers } from 'ethers';

const App: React.FC = () => {
  const [availableTokens, setAvailableTokens] = useState<string>('0');
  const [walletConnected, setWalletConnected] = useState<boolean>(false);

  // Función para conectar la wallet
  const handleConnectWallet = async () => {
    const provider = await connectWallet();
    if (provider) {
      setWalletConnected(true);
    }
  };

  // Función para obtener tokens disponibles desde el contrato
  const fetchTokensAvailable = async () => {
    const contract = await getContract();
    if (contract) {
      try {
        const tokens = await contract.getTokensAvailables();
        // Formateamos el valor a una cadena legible asumiendo 18 decimales
        setAvailableTokens(ethers.formatUnits(tokens, 18));
      } catch (error) {
        console.error('Error al obtener tokens disponibles:', error);
      }
    }
  };

  // Llamamos a la función de obtener tokens cuando se conecta la wallet
  useEffect(() => {
    if (walletConnected) {
      fetchTokensAvailable();
    }
  }, [walletConnected]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mi dApp de Tokens</h1>
      {!walletConnected ? (
        <button onClick={handleConnectWallet}>Conectar Wallet</button>
      ) : (
        <>
          <p>Wallet Conectada</p>
          <p>Tokens Disponibles: {availableTokens}</p>
          {/* Aquí puedes agregar más botones o formularios para comprar, quemar, etc. */}
        </>
      )}
    </div>
  );
};

export default App;
