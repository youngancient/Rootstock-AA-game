import { useCallback, useState } from "react";
import { useGameContract } from "../useContracts";
import { useEtherspot } from "../useEtherspot";
import { ethers } from "ethers";

export const useReadFunctions = () => {
  const gameContract = useGameContract();
  const { smartAccountAddress } = useEtherspot();

  const [goldBalance, setGoldBalance] = useState<number>(0);
  const [pickaxeLevel, setPickaxeLevel] = useState<number>(0);
  const [nextUpgradeCost, setNextUpgradeCost] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const fetchPlayerStats = useCallback(async () => {
    if (!gameContract || !smartAccountAddress) return;

    setIsLoadingStats(true);
    try {
      // getPlayerStats returns (uint256 gold, uint256 level, uint256 nextUpgradeCost)
      const stats = await gameContract.getPlayerStats(smartAccountAddress);

      setGoldBalance(Number(ethers.formatUnits(stats[0], 0)));
      setPickaxeLevel(Number(ethers.formatUnits(stats[1], 0)));
      setNextUpgradeCost(Number(ethers.formatUnits(stats[2], 0)));
    } catch (error) {
      console.error("Error fetching player stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [gameContract, smartAccountAddress]);

  return {
    goldBalance,
    pickaxeLevel,
    nextUpgradeCost,
    isLoadingStats,
    fetchPlayerStats,
  };
};
