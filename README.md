# ⛏️ Rootstock Account Abstraction Game (Click Miner)

Welcome to the **Rootstock Account Abstraction Game (Click Miner)**! This is a beginner-friendly tutorial project designed to demonstrate how to implement Account Abstraction (AA) on the Rootstock Testnet using modern web3 tools. 

If you are learning about smart contract interactions, Account Abstraction, and gasless transactions, you are in the right place!

## 🌟 What You Will Learn
In this project, you will learn how to:
- Set up a React + Vite application with TypeScript.
- Connect to user wallets using **Reown AppKit**.
- Implement Account Abstraction using the **Etherspot Prime SDK**.
- Send gasless transactions and interact with a smart contract on the **Rootstock Testnet**.
- Improve User Experience (UX) in dapps by hiding the friction of traditional transactions.

## 🛠️ Tech Stack
- **Frontend Framework**: [React](https://reactjs.org/) & [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Wallet Connection**: [Reown AppKit](https://reown.com/appkit)
- **Account Abstraction**: [Etherspot Prime SDK](https://etherspot.io/)
- **Blockchain**: Rootstock Testnet

## 🚀 Getting Started

Follow these steps to run the game locally on your machine.

### 1. Prerequisites
Ensure you have the following installed and are familiar with:
- **Familiarity**: Deploying smart contracts, and integrating smart contracts to react frontends using either `ethers` or `viem`.
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn` package manager

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone <your-repo-url>
cd Rootstock-AA-game
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory by copying the example file:
```bash
cp .env.example .env
```
Fill in the required variables in your `.env` file!

*Note: Make sure to replace placeholders with your actual keys. Never commit your private keys or `.env` file to version control!*

### 4. Running the Development Server
Start the development server using Vite:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` to play the game!

## 🎮 How the Game Works

**Click Miner** is a simple incremental game where players can:
1. **Mine Gold**: Click the "Mine Gold" button to earn gold.
2. **Upgrade Pickaxe**: Once you have enough gold, spend it to upgrade your pickaxe. A better pickaxe mines gold faster!

### Account Abstraction Magic ✨
The real magic of this game happens under the hood. Thanks to **Account Abstraction**:
- When you connect your wallet, an **Etherspot Smart Account** is initialized for you.
- Transactions like mining and upgrading are routed securely through the smart account (bundler).
- The transaction experience is seamless and does not constantly prompt you for native gas (RBTC), removing massive friction for new and non-web3 native users. 

## 📂 Code Structure Overview
For developers analyzing the code, here are the key areas to look at:
- `src/App.tsx`: The main UI component handling game flow and UI state.
- `src/hooks/useEtherspot.ts`: Handles the Etherspot Prime SDK setup and returns your Smart Account address.
- `src/hooks/contractHook/useReadContract.ts`: React hooks used to cleanly read state variables (e.g., gold balance, pickaxe level) from the smart contract.
- `src/hooks/contractHook/useWriteContract.ts`: Hooks that bundle the smart contract calls (Mining, Upgrading) into UserOperations using Etherspot. 
- `src/components/CopyButton.tsx`: A UX component allowing users to easily copy their Smart Account address.

## 🔗 Useful Links
- **Deployed Game Contract**: [0x15498df25C1e36147ef5903d2819f83e421e36e5](https://rootstock-testnet.blockscout.com/address/0x15498df25C1e36147ef5903d2819f83e421e36e5)
- **Rootstock Faucet**: [https://faucet.rootstock.io/](https://faucet.rootstock.io/)
- [Rootstock Testnet Explorer](https://rootstock-testnet.blockscout.com/)
- [Etherspot Documentation](https://docs.etherspot.io/)
- [Reown AppKit](https://docs.reown.com/)

Happy Coding and Mining! ⛏️
