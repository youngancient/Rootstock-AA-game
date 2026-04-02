import { useAppKitAccount } from "@reown/appkit/react";
import { useGameContract } from "../useContracts";
import { ErrorDecoder } from "ethers-decode-error";
import { useState } from "react";
import { toast } from "react-toastify";
import { useEtherspot } from "../useEtherspot";

const sleep = (sec: number) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

export const useWriteFunctions = () => {
  const gameContract = useGameContract(true);
  const { address } = useAppKitAccount();
  const errorDecoder = ErrorDecoder.create();
  const { primeSdk, smartAccountAddress } = useEtherspot();

  const [isMining, setIsMining] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const mineGold = async (onSuccess?: () => void) => {
    if (!gameContract || !address)
      return toast.error("Please connect your wallet first.");
    if (!primeSdk || !smartAccountAddress)
      return toast.error("Etherspot Smart Account not initialized yet.");

    if (isMining) return toast.info("Mining already in progress, please wait.");

    setIsMining(true);
    try {
      const contractAddress = await gameContract.getAddress();
      const encodedData = gameContract.interface.encodeFunctionData("mineGold");

      toast.info("Preparing gasless mining transaction...", {
        autoClose: false,
        toastId: "mining-tx",
      });

      // Clear any pending ops just in case
      await primeSdk.clearUserOpsFromBatch();

      // Add to batch
      await primeSdk.addUserOpsToBatch({
        to: contractAddress,
        data: encodedData,
      });

      // Estimate gas and get the UserOperation object
      // (Sponsor mode disabled temporarily due to Etherspot Arka outage)
      //   const userOp = await sdk.estimate({
      //   paymasterDetails: {
      //     url: `https://arka.etherspot.io?apiKey=${projectKey}&chainId=31`,
      //     context: { mode: "sponsor" }
      //   }
      // });

      const userOp = await primeSdk.estimate();
      console.log("user op => ", userOp);

      // Send the UserOperation (this triggers the wallet signature for the UserOp hash)
      const uoHash = await primeSdk.send(userOp);
      console.log("hash => ", uoHash);
      toast.update("mining-tx", {
        render: `Transaction submitted! Mining gold in the background...`,
        type: "info",
        autoClose: 5000,
      });

      // Unblock UI immediately
      setIsMining(false);

      // Start non-blocking background polling
      (async () => {
        console.log("Waiting for transaction...");
        let userOpsReceipt: any = null;
        const timeout = Date.now() + 180000; // 3 minute timeout
        while (userOpsReceipt == null && Date.now() < timeout) {
          await sleep(2);
          try {
            userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
          } catch (e) {
            console.log("Waiting for receipt...");
          }
        }
        console.log(
          "\x1b[33m%s\x1b[0m",
          `Transaction Receipt: `,
          userOpsReceipt
        );

        if (userOpsReceipt && userOpsReceipt.success) {
          if (onSuccess) onSuccess();
          toast.success("Gold successfully mined on-chain!");
        } else if (userOpsReceipt && userOpsReceipt.success === false) {
          toast.error(
            `Mining failed on-chain: ${userOpsReceipt.reason || "Unknown"}`
          );
        } else if (!userOpsReceipt) {
          toast.warn(
            "Mining transaction took too long to confirm, but might still succeed."
          );
        }
      })().catch(console.error);

      return;
    } catch (error: any) {
      console.error(error);
      const decodedError = await errorDecoder.decode(error);
      toast.error(
        `Mining failed: ${decodedError.reason || error.message || "Unknown error"
        }`
      );
      toast.dismiss("mining-tx");
    } finally {
      setIsMining(false);
    }
  };

  const upgradePickaxe = async (onSuccess?: () => void) => {
    if (!gameContract || !address)
      return toast.error("Please connect your wallet first.");
    if (!primeSdk || !smartAccountAddress)
      return toast.error("Etherspot Smart Account not initialized yet.");

    if (isUpgrading)
      return toast.info("Upgrade already in progress, please wait.");

    setIsUpgrading(true);
    try {
      const contractAddress = await gameContract.getAddress();
      const encodedData =
        gameContract.interface.encodeFunctionData("upgradePickaxe");

      toast.info("Preparing gasless upgrade transaction...", {
        autoClose: false,
        toastId: "upgrade-tx",
      });

      await primeSdk.clearUserOpsFromBatch();
      await primeSdk.addUserOpsToBatch({
        to: contractAddress,
        data: encodedData,
      });

      // (Sponsor mode disabled temporarily due to Etherspot Arka outage)
      const userOp = await primeSdk.estimate();
      toast.update("upgrade-tx", {
        render: "Waiting for wallet signature...",
        type: "info",
        autoClose: false,
      });

      const uoHash = await primeSdk.send(userOp);
      toast.update("upgrade-tx", {
        render: `Upgrade submitted! Upgrading pickaxe in the background...`,
        type: "info",
        autoClose: 5000,
      });

      // Unblock UI immediately
      setIsUpgrading(false);

      // Start non-blocking background polling
      (async () => {
        console.log("Waiting for transaction...");
        let userOpsReceipt: any = null;
        const timeout = Date.now() + 180000; // 3 minute timeout
        while (userOpsReceipt == null && Date.now() < timeout) {
          await sleep(2);
          try {
            userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
          } catch (e) {
            console.log("Waiting for receipt...");
          }
        }
        console.log(
          "\x1b[33m%s\x1b[0m",
          `Transaction Receipt: `,
          userOpsReceipt
        );

        if (userOpsReceipt && userOpsReceipt.success) {
          if (onSuccess) onSuccess();
          toast.success("✅ Pickaxe successfully upgraded on-chain!");
        } else if (userOpsReceipt && userOpsReceipt.success === false) {
          toast.error(
            `❌ Upgrade failed on-chain: ${userOpsReceipt.reason || "Unknown"}`
          );
        } else if (!userOpsReceipt) {
          toast.warn(
            "⚠️ Upgrade transaction took too long to confirm, but might still succeed."
          );
        }
      })().catch(console.error);

      return;
    } catch (error: any) {
      console.error(error);
      const decodedError = await errorDecoder.decode(error);
      if (
        error.message &&
        error.message.includes("Not enough gold to upgrade")
      ) {
        toast.error("Not enough gold to upgrade!");
      } else {
        toast.error(
          `Upgrade failed: ${decodedError.reason || error.message || "Unknown error"
          }`
        );
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
    isUpgrading,
  };
};
