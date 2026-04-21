import localhostDeployment from "@/lib/deployments/31337.json";
import legacyGanacheDeployment from "@/lib/deployments/5777.json";
import sepoliaDeployment from "@/lib/deployments/11155111.json";
import { getEthereumProvider } from "@/lib/ethereum";

export interface ContractConfig {
  address: string;
  abi: any;
  network: string;
  networkName: string;
  explorerTxBaseUrl?: string;
}

const deployments: Record<string, ContractConfig> = {
  "31337": localhostDeployment,
  "5777": legacyGanacheDeployment,
  "11155111": sepoliaDeployment,
};

export const getContractConfig = async (): Promise<ContractConfig> => {
  try {
    const provider = getEthereumProvider();
    const chainIdHex = await provider.request({ method: "eth_chainId" });
    const networkId = parseInt(chainIdHex, 16).toString();
    const deployedNetwork = deployments[networkId];

    if (!deployedNetwork || !deployedNetwork.address) {
      throw new Error(`Contract not deployed on network ${networkId}`);
    }

    return deployedNetwork;
  } catch (error: any) {
    throw new Error(`Failed to get contract config: ${error.message}`);
  }
};
