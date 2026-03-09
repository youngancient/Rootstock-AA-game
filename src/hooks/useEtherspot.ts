import { useEffect, useState } from "react";
import { PrimeSdk, EtherspotBundler, Web3WalletProvider } from "@etherspot/prime-sdk";
import useRunners from "./useRunners";

export const useEtherspot = () => {
    const { provider, signer, walletProvider } = useRunners();
    const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
    const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const initSdk = async () => {
            if (!provider || !signer || !walletProvider) {
                if (isMounted) {
                    setPrimeSdk(null);
                    setSmartAccountAddress(null);
                }
                return;
            }

            setIsInitializing(true);
            try {
                // Etherspot requires a Web3Provider wrapper around the Ethers provider
                // or a custom wrapper for AppKit/Ethers v6. 
                // We'll pass the private key if available, but for AppKit we use the provider.
                // Actually, PrimeSdk supports EIP1193 provider directly.
                // Let's use the underlying wallet provider from AppKit if possible.

                // Wait, Etherspot Prime SDK requires the EOA private key, OR an EIP1193 provider.
                // Let's use the EIP1193 provider from the Ethers BrowserProvider.
                // Note: as of @etherspot/prime-sdk v1.x, we instantiate it with a Web3Provider instance

                // For ethers v6 integrations with PrimeSdk, we might need a custom approach.
                // Let's try passing the underlying provider. 
                // According to Etherspot docs: mappedProvider = new Web3Provider(window.ethereum)
                // With AppKit, provider (BrowserProvider) has `.provider` (Eip1193Provider).


                const mappedProvider = new Web3WalletProvider(walletProvider as any);
                await mappedProvider.refresh();

                const projectKey = import.meta.env.VITE_ETHERSPOT_PROJECT_KEY || "";

                const bundlerProvider = new EtherspotBundler(
                    31,
                    projectKey,
                    "https://rootstocktestnet-bundler.etherspot.io/"
                );


                const sdk = new PrimeSdk(mappedProvider, {
                    chainId: 31, // Rootstock Testnet
                    bundlerProvider,
                });

                const address = await sdk.getCounterFactualAddress();

                if (isMounted) {
                    setPrimeSdk(sdk);
                    setSmartAccountAddress(address);
                }
            } catch (error) {
                console.error("Failed to initialize Etherspot SDK:", error);
            } finally {
                if (isMounted) {
                    setIsInitializing(false);
                }
            }
        };

        initSdk();

        return () => {
            isMounted = false;
        };
    }, [provider, signer]);

    return { primeSdk, smartAccountAddress, isInitializing };
};
