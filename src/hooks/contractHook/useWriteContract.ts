import { useAppKitAccount } from "@reown/appkit/react";
import { useGameContract } from "../useContracts";
import { ErrorDecoder } from "ethers-decode-error";
import { useState } from "react";
import { toast } from "react-toastify";
import { useEtherspot } from "../useEtherspot";

export const useWriteFunctions = () => {
  const gameContract = useGameContract(true);
  const { address } = useAppKitAccount();
  const errorDecoder = ErrorDecoder.create();
  const { primeSdk, smartAccountAddress } = useEtherspot();

  const [isMining, setIsMining] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const projectKey = import.meta.env.VITE_ETHERSPOT_PROJECT_KEY;

  const mineGold = async (onSuccess?: () => void) => {
    if (!gameContract || !address) return toast.error("Please connect your wallet first.");
    if (!primeSdk || !smartAccountAddress) return toast.error("Etherspot Smart Account not initialized yet.");

    setIsMining(true);
    try {
      const contractAddress = await gameContract.getAddress();
      const encodedData = gameContract.interface.encodeFunctionData("mineGold");

      toast.info("Preparing gasless mining transaction...", { autoClose: false, toastId: "mining-tx" });

      // Clear any pending ops just in case
      await primeSdk.clearUserOpsFromBatch();

      // Add to batch
      await primeSdk.addUserOpsToBatch({
        to: contractAddress,
        data: encodedData,
      });

      // Estimate gas and get the UserOperation object
      const userOp = await primeSdk.estimate(
        {
          paymasterDetails: {
            url: `https://arka.etherspot.io?apiKey=${projectKey}&chainId=31`,
            context: { mode: "sponsor" }
          }
        }
      );
      console.log("user op => ", userOp);

      toast.update("mining-tx", { render: "Waiting for wallet signature...", type: "info", autoClose: false });

      // Send the UserOperation (this triggers the wallet signature for the UserOp hash)
      const uoHash = await primeSdk.send(userOp);
      console.log("hash => ", uoHash);
      toast.update("mining-tx", { render: `Transaction submitted! Mining gold in the background...`, type: "info", autoClose: 5000 });

      // Optimistic update: unblock UI immediately
      setIsMining(false);
      if (onSuccess) onSuccess();

      // Poll for the Real Receipt in the background
      (async () => {
        try {
          let receipt = null;
          let retries = 0;
          while (!receipt && retries < 120) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            receipt = await primeSdk.getUserOpReceipt(uoHash);
            retries++;
          }
          if (receipt && receipt.success) {
            toast.success("✅ Gold successfully mined on-chain!");
          } else if (receipt && receipt.success === false) {
            toast.error(`❌ Mining failed on-chain: ${receipt.reason || "Unknown"}`);
          } else {
            toast.warn("⚠️ Mining transaction took too long to confirm, but might still succeed.");
          }
        } catch (e) {
          console.error("Background receipt polling error:", e);
        }
      })();

      return;
    } catch (error: any) {
      console.error(error);
      const decodedError = await errorDecoder.decode(error);
      toast.error(`Mining failed: ${decodedError.reason || error.message || "Unknown error"}`);
      toast.dismiss("mining-tx");
    } finally {
      setIsMining(false);
    }
  };

  const upgradePickaxe = async (onSuccess?: () => void) => {
    if (!gameContract || !address) return toast.error("Please connect your wallet first.");
    if (!primeSdk || !smartAccountAddress) return toast.error("Etherspot Smart Account not initialized yet.");

    setIsUpgrading(true);
    try {
      const contractAddress = await gameContract.getAddress();
      const encodedData = gameContract.interface.encodeFunctionData("upgradePickaxe");

      toast.info("Preparing gasless upgrade transaction...", { autoClose: false, toastId: "upgrade-tx" });

      await primeSdk.clearUserOpsFromBatch();
      await primeSdk.addUserOpsToBatch({
        to: contractAddress,
        data: encodedData,
      });

      const userOp = await primeSdk.estimate({
        paymasterDetails: {
          url: `https://arka.etherspot.io?apiKey=${projectKey}&chainId=31`,
          context: { mode: "sponsor" }
        }
      });
      toast.update("upgrade-tx", { render: "Waiting for wallet signature...", type: "info", autoClose: false });

      const uoHash = await primeSdk.send(userOp);
      toast.update("upgrade-tx", { render: `Upgrade submitted! Upgrading pickaxe in the background...`, type: "info", autoClose: 5000 });

      // Optimistic update: unblock UI immediately
      setIsUpgrading(false);
      if (onSuccess) onSuccess();

      // Poll for the Real Receipt in the background
      (async () => {
        try {
          let receipt = null;
          let retries = 0;
          while (!receipt && retries < 12) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            receipt = await primeSdk.getUserOpReceipt(uoHash);
            retries++;
          }
          if (receipt && receipt.success) {
            toast.success("✅ Pickaxe successfully upgraded on-chain!");
          } else if (receipt && receipt.success === false) {
            toast.error(`❌ Upgrade failed on-chain: ${receipt.reason || "Unknown"}`);
          } else {
            toast.warn("⚠️ Upgrade transaction took too long to confirm, but might still succeed.");
          }
        } catch (e) {
          console.error("Background receipt polling error:", e);
        }
      })();

      return;
    } catch (error: any) {
      console.error(error);
      const decodedError = await errorDecoder.decode(error);
      if (error.message && error.message.includes("Not enough gold to upgrade")) {
        toast.error("Not enough gold to upgrade!");
      } else {
        toast.error(`Upgrade failed: ${decodedError.reason || error.message || "Unknown error"}`);
      }
      toast.dismiss("upgrade-tx");
    } finally {
      setIsUpgrading(false);
    }
  };

  return {
    mineGold,
    upgradePickaxe,
    isMining,
    isUpgrading
  };
};
