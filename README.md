# F20 dApp

A basic dApp created as a learning exercise in the blockchain world. This application allows users to purchase tokens from an ERC20 contract (called F20) and offers an exclusive administrative panel for the contract owner, which allows minting tokens, changing the price, and withdrawing funds.

## Description

This dApp interacts with a smart contract deployed on the **Sepolia** test network. The project is divided into two parts:

- **Home:**  
  - Allows users to connect their wallet (MetaMask).  
  - Displays the tokens available for sale, the current price per token, and the user's token balance.  
  - Enables token purchases by sending ETH.

- **Admin Panel:**  
  - Available only to the contract owner.  
  - Administrative functions include:
    - **Mint Tokens:** Allows the administrator to mint new tokens to the contract.
    - **Change Price:** Allows updating the token sale price.
    - **Withdraw Funds:** Allows the administrator to withdraw the funds accumulated in the contract.

## Features

- **MetaMask Integration:** Connects the user's wallet via MetaMask.
- **Transparent Transactions:** All transactions can be publicly verified on Sepolia Etherscan.
- **Split Interface:**  
  - A client interface (Home).  
  - An administrative panel for the owner (Admin Panel).

## Technologies Used

- **Frontend:** React, TypeScript, Vite, CSS Modules.
- **Smart Contract:** Solidity, utilizing OpenZeppelin libraries (ERC20 and Ownable).
- **Blockchain:** Sepolia Testnet.
- **Web3:** Ethers.js to interact with the contract.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed.
- [MetaMask](https://metamask.io/) installed in your browser.
- Sepolia ETH (you can obtain it from a faucet such as [Sepolia Faucet](https://sepoliafaucet.com/)).

### Installation

1. **Clone the repository**

   ```bash
   git clone <REPOSITORY_URL>
   cd my-dapp
