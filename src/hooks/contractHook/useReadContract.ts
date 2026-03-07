import { toast } from "react-toastify";
import { useGameContract } from "../useContracts";
import { useCallback, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { ethers } from "ethers";

// will contain read functions
export const useReadFunctions = () => {
  const gameContract = useGameContract();
  const { address } = useAppKitAccount();

  return {
    
  };
};
