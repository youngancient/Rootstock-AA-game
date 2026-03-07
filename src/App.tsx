import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./connection.ts";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { formatAddress } from "./utils.ts";
import { useReadFunctions } from "./hooks/contractHook/useReadContract.ts";
import { useWriteFunctions } from "./hooks/contractHook/useWriteContract.ts";
import { useEffect } from "react";

function App() {
  const { isConnected, address } = useAppKitAccount();
  const { open } = useAppKit();

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
                {isMining ? "Mining... (Check Wallet)" : "⛏️ Mine Gold"}
              </button>

              <button
                className={`action-btn upgrade-btn ${isUpgrading ? "loading" : ""}`}
                onClick={() => upgradePickaxe(fetchPlayerStats)}
                disabled={isMining || isUpgrading || goldBalance < nextUpgradeCost}
              >
                {isUpgrading
                  ? "Upgrading... (Check Wallet)"
                  : `⬆️ Upgrade Pickaxe (Costs ${nextUpgradeCost} Gold)`}
              </button>
            </div>

            <div className="friction-notice">
              <p>Experiencing friction? Having to sign every single transaction is slow. Account Abstraction can fix this!</p>
            </div>
          </div>
        )}
      </main>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
