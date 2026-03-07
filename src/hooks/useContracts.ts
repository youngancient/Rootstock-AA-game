import { useMemo } from "react";
import useRunners from "./useRunners";
import { Contract } from "ethers";
import { GAME_ABI } from "../ABI/game";
import { getAddress } from "ethers";

export const useGameContract = (withSigner = false) => {
  const { readOnlyProvider, signer } = useRunners();

  return useMemo(() => {
    if (withSigner) {
      if (!signer) return null;
      return new Contract(
        getAddress(import.meta.env.VITE_GAME_CONTRACT_ADDRESS),
        GAME_ABI,
        signer
      );
    }
    return new Contract(
      getAddress(import.meta.env.VITE_GAME_CONTRACT_ADDRESS),
      GAME_ABI,
      readOnlyProvider
    );
  }, [readOnlyProvider, signer, withSigner]);
};
