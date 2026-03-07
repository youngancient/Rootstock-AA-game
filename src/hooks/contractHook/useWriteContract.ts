import { useAppKitAccount } from "@reown/appkit/react";
import { useGameContract } from "../useContracts";
import { ErrorDecoder, DecodedError } from "ethers-decode-error";

// will contain write functions
export const useWriteFunctions = () => {
  const gameContract = useGameContract(true);
  const { address } = useAppKitAccount();
  const errorDecoder = ErrorDecoder.create();


  return {

   };
};
