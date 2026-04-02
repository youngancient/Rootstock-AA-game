import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./connection.ts";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { formatAddress } from "./utils.ts";
import { useEtherspot } from "./hooks/useEtherspot.ts";
import { useReadFunctions } from "./hooks/contractHook/useReadContract.ts";
import { useWriteFunctions } from "./hooks/contractHook/useWriteContract.ts";
import { useEffect } from "react";
import { CopyButton } from "./components/CopyButton.tsx";

function App() {
  const { isConnected, address } = useAppKitAccount();
  const { open } = useAppKit();
  const { smartAccountAddress, isInitializing } = useEtherspot();

  const {
    goldBalance,
    pickaxeLevel,
    nextUpgradeCost,
    isLoadingStats,
    fetchPlayerStats,
  } = useReadFunctions();

  const { mineGold, upgradePickaxe, isMining, isUpgrading } = useWriteFunctions();

  // Fetch stats when wallet connects
  useEffect(() => {
    if (isConnected) {
      fetchPlayerStats();
    }
  }, [isConnected, fetchPlayerStats]);

  return (
    <div className="game-container">
      <header className="header">
        <div className="logo-container">
          <img src="/rootstock.png" className="logo" alt="Rootstock Logo" />
          <h1>Click Miner</h1>
        </div>
        <button className="connect-btn" onClick={() => open()}>
          {isConnected ? formatAddress(address ?? "") : "Connect Wallet"}
        </button>
      </header>

      <main className="main-content">
        {!isConnected ? (
          <div className="welcome-screen">
            <h2>Welcome to Clicker Miner</h2>
            <p>Connect your wallet to start mining gold on the Rootstock Testnet.</p>
            <p className="hint">Note: Every action requires a wallet signature!</p>
          </div>
        ) : (
          <div className="dashboard">
            <div className="account-info">
              <p>
                <strong>Smart Account (Etherspot):</strong>{" "}
                {isInitializing ? "Initializing..." : smartAccountAddress ? (
                  <span className="address-container">
                    {formatAddress(smartAccountAddress)}
                    <CopyButton textToCopy={smartAccountAddress} />
                  </span>
                ) : "Not created"}
              </p>
            </div>
            <div className="stats-panel">
              <div className="stat-card">
                <h3>Gold Balance</h3>
                <p className="stat-value">{isLoadingStats ? "..." : goldBalance}</p>
              </div>
              <div className="stat-card">
                <h3>Pickaxe Level</h3>
                <p className="stat-value">{isLoadingStats ? "..." : pickaxeLevel}</p>
              </div>
            </div>

            <div className="action-area">
              <button
                className={`action-btn mine-btn ${isMining ? "loading" : ""}`}
                onClick={() => mineGold(fetchPlayerStats)}
                disabled={isMining || isUpgrading}
              >
                {isMining ? "Mining..." : "⛏️ Mine Gold"}
              </button>

              <button
                className={`action-btn upgrade-btn ${isUpgrading ? "loading" : ""}`}
                onClick={() => upgradePickaxe(fetchPlayerStats)}
                disabled={isMining || isUpgrading || goldBalance < nextUpgradeCost}
              >
                {isUpgrading
                  ? "Upgrading..."
                  : `⬆️ Upgrade Pickaxe (Costs ${nextUpgradeCost} Gold)`}
              </button>
            </div>

            <div className="friction-notice">
              <p>
                ✨ <strong>Account Abstraction Active!</strong> Transactions are now gasless and routed through your Etherspot Smart Account.
                You will only need to sign the UserOperation once.
              </p>
            </div>
          </div>
        )}
      </main>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
