declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      providers?: Array<{
        isMetaMask?: boolean;
        on?: (event: string, handler: (...args: unknown[]) => void) => void;
        request: (args: { method: string; params?: unknown[] | object }) => Promise<any>;
      }>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      request: (args: { method: string; params?: unknown[] | object }) => Promise<any>;
    };
  }
}

export type EthereumProvider = NonNullable<Window["ethereum"]>;

const HARDHAT_CHAIN_ID_HEX = "0x7a69";
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export function getEthereumProvider(): EthereumProvider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Please install MetaMask to use this application");
  }

  const providers = window.ethereum.providers;
  if (Array.isArray(providers) && providers.length > 0) {
    const metaMaskProvider = providers.find((provider) => provider.isMetaMask);
    if (metaMaskProvider) {
      return metaMaskProvider;
    }

    return providers[0];
  }

  return window.ethereum;
}

export async function ensureSupportedNetwork(provider: EthereumProvider): Promise<void> {
  const chainIdHex = await provider.request({ method: "eth_chainId" });
  if (chainIdHex === HARDHAT_CHAIN_ID_HEX || chainIdHex === SEPOLIA_CHAIN_ID_HEX) {
    return;
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
    });
  } catch (error: any) {
    if (error?.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: HARDHAT_CHAIN_ID_HEX,
            chainName: "Hardhat Local",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["http://127.0.0.1:8545"],
          },
        ],
      });
      return;
    }

    throw error;
  }
}
