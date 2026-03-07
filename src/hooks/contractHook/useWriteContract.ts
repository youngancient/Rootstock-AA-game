import { useAppKitAccount } from "@reown/appkit/react";
import { useGameContract } from "../useContracts";
import { ErrorDecoder } from "ethers-decode-error";
import { useState } from "react";
import { toast } from "react-toastify";

export const useWriteFunctions = () => {
  const gameContract = useGameContract(true);
  const { address } = useAppKitAccount();
  const errorDecoder = ErrorDecoder.create();

  const [isMining, setIsMining] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const mineGold = async (onSuccess?: () => void) => {
    if (!gameContract || !address) return toast.error("Please connect your wallet first.");

    setIsMining(true);
    try {
      const tx = await gameContract.mineGold();
      toast.info("Mining transaction submitted. Please wait for confirmation...", { autoClose: false, toastId: "mining-tx" });

      await tx.wait(); // Wait for it to be mined

      toast.update("mining-tx", { render: "Gold successfully mined!", type: "success", autoClose: 3000 });
      if (onSuccess) onSuccess();
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
