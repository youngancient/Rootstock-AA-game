import { useEffect, useState } from "react";
import useRunners from "./useRunners"
import { EtherspotBundler, PrimeSdk } from "@etherspot/prime-sdk";
import { id } from "ethers";


export const useEtherSpot = ()=>{
    const {provider, signer} = useRunners();
    const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
    const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
    const [isInititalizing, setIsInitializing] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const initSdk = async () => {
            if(!provider || !signer){
                if(isMounted){
                    setPrimeSdk(null);
                    setSmartAccountAddress(null);
                }
                return;
            }
            setIsInitializing(true);
            try {
                const userAddress = await signer.getAddress();
                const storageKey = `session_key_${userAddress}`;
                let sessionPrivateKey = localStorage.getItem(storageKey);

                if(!sessionPrivateKey){
                    const message = `Welcome to Clicker Miner!\n\nSign this message to generate your secure local session key for gasless transactions.\n\nThis will not trigger any on-chain transaction or cost any gas.\n\nWallet: ${userAddress}`;
                    const signature = await signer.signMessage(message);
                    sessionPrivateKey = id(signature);
                    localStorage.setItem(storageKey,sessionPrivateKey);
                }
                const projectKey = import.meta.env.VITE_ETHERSPOT_PROJECT_KEY || "";
                const bundlerProvider = new EtherspotBundler(31,projectKey);
                const sdk = new PrimeSdk({privateKey : sessionPrivateKey}, {
                    chainId : 31,
                    bundlerProvider
                });
                const address = await sdk.getCounterFactualAddress();

                if(isMounted){
                    setPrimeSdk(sdk);
                    setSmartAccountAddress(address);
                }
            } catch (error) {
                console.error("failed to initialize etherspot sdk: ", error);
            } finally{
                if(isMounted){
                    setIsInitializing(false);
                }
            }
        }

        initSdk();

        return () => {
            isMounted = false;
        }
    },[provider, signer]);

    return {
        primeSdk, smartAccountAddress, isInititalizing
    }
}