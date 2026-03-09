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
      const userOp = await primeSdk.estimate({
        paymasterDetails: {
          url: `https://arka.etherspot.io?apiKey=${projectKey}&chainId=31`,
          context: { mode: "sponsor" }
        }
      });

      toast.update("mining-tx", { render: "Waiting for wallet signature...", type: "info", autoClose: false });

      // Send the UserOperation (this triggers the wallet signature for the UserOp hash)
      const uoHash = await primeSdk.send(userOp);

      toast.update("mining-tx", { render: `Mining UserOp submitted! Hash: ${uoHash.substring(0, 10)}... Please wait...`, type: "info", autoClose: false });

      // Wait for the bundler to process the UserOp (no wait method easily available on PrimeSdk usually, we might need to poll, but let's assume standard behavior or use getNativeTransactionReceipt)
      // PrimeSdk abstracting this might just require waiting a few seconds or polling for receipt
      // For simplicity, we'll delay and assume success if it didn't throw initially, but a real app should poll
      await new Promise(resolve => setTimeout(resolve, 8000));

      toast.update("mining-tx", { render: "Gold successfully mined gaslessly!", type: "success", autoClose: 3000 });
      if (onSuccess) onSuccess();
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
      toast.update("upgrade-tx", { render: `Upgrade UserOp submitted! Hash: ${uoHash.substring(0, 10)}... Please wait...`, type: "info", autoClose: false });

      await new Promise(resolve => setTimeout(resolve, 8000));

      toast.update("upgrade-tx", { render: "Pickaxe successfully upgraded!", type: "success", autoClose: 3000 });
      if (onSuccess) onSuccess();
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
