import { useAppKitAccount } from "@reown/appkit/react";
import { useGameContract } from "../useContracts";
import { ErrorDecoder } from "ethers-decode-error";
import { useState } from "react";
import { toast } from "react-toastify";
import { useEtherSpot } from "../useEtherspot";

const sleep = (sec : number) => new Promise((resolve) => setTimeout(resolve, sec * 1000));

export const useWriteFunctions = () => {
  const gameContract = useGameContract(true);
  const { address } = useAppKitAccount();
  const errorDecoder = ErrorDecoder.create();

  const [isMining, setIsMining] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const {primeSdk, smartAccountAddress} = useEtherSpot();

  const mineGold = async (onSuccess?: () => void) => {

    if (!gameContract || !address) return toast.error("Please connect your wallet first.");

    if (!primeSdk || !smartAccountAddress) return toast.error("Sdk or smart account not initialized.");

    if(isMining) return toast.info("Mining in progress, please wait");

    setIsMining(true);

    try {
      // const tx = await gameContract.mineGold();
      // toast.info("Mining transaction submitted. Please wait for confirmation...", { autoClose: false, toastId: "mining-tx" });

      // await tx.wait(); // Wait for it to be mined

      // toast.update("mining-tx", { render: "Gold successfully mined!", type: "success", autoClose: 3000 });
      const contractAddress = await gameContract.getAddress();
      const encodeData = gameContract.interface.encodeFunctionData("mineGold");
      toast.info("Preparing gasless transaction...", { autoClose: false, toastId: "mining-tx" });

      await primeSdk.clearUserOpsFromBatch();

      await primeSdk.addUserOpsToBatch({to : contractAddress, data : encodeData});

      const userOp = await primeSdk.estimate();
      const uoHash = await primeSdk.send(userOp);
      console.log("uohash => ",uoHash);

      toast.update("mining-tx", { render: "Transaction submitted! Mining gold in the background", type: "info", autoClose: 5000 });

      setIsMining(false);

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
      toast.error(`Mining failed: ${decodedError.reason || "Unknown error"}`);
    } finally {
      setIsMining(false);
    }
  };

  const upgradePickaxe = async (onSuccess?: () => void) => {
    if (!gameContract || !address) return toast.error("Please connect your wallet first.");

    setIsUpgrading(true);
    try {
      const tx = await gameContract.upgradePickaxe();
      toast.info("Upgrade transaction submitted. Please wait for confirmation...", { autoClose: false, toastId: "upgrade-tx" });

      await tx.wait();

      toast.update("upgrade-tx", { render: "Pickaxe successfully upgraded!", type: "success", autoClose: 3000 });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      const decodedError = await errorDecoder.decode(error);
      // Check if it's the specific require statement we added in the contract
      if (error.message.includes("Not enough gold to upgrade")) {
        toast.error("Not enough gold to upgrade!");
      } else {
        toast.error(`Upgrade failed: ${decodedError.reason || "Unknown error"}`);
      }
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
